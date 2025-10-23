module chimera_prediction_market::prediction_market {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;
    use sui::table::{Self, Table};
    use sui::dynamic_field as df;

    // Error codes
    const EMarketNotFound: u64 = 1;
    const EMarketEnded: u64 = 2;
    const EMarketNotEnded: u64 = 3;
    const EInvalidOption: u64 = 4;
    const EInsufficientBet: u64 = 5;
    const EExcessiveBet: u64 = 6;
    const EMarketAlreadyResolved: u64 = 7;
    const ENotAuthorized: u64 = 8;
    const ENoWinningPosition: u64 = 9;
    const EAlreadyClaimed: u64 = 10;

    // Market status
    const MARKET_ACTIVE: u8 = 0;
    const MARKET_PAUSED: u8 = 1;
    const MARKET_RESOLVED: u8 = 2;

    // Market types
    const MARKET_TYPE_CUSTOM: u8 = 0;
    const MARKET_TYPE_PRICE: u8 = 1;

    // Structs
    public struct Market has key, store {
        id: UID,
        market_id: u64,
        title: String,
        description: String,
        option_a: String,
        option_b: String,
        category: u8,
        creator: address,
        created_at: u64,
        end_time: u64,
        min_bet: u64,
        max_bet: u64,
        status: u8,
        outcome: u8,
        resolved: bool,
        total_option_a_shares: u64,
        total_option_b_shares: u64,
        total_pool: Balance<SUI>,
        image_url: String,
        market_type: u8,
        target_price: u64, // For price-based markets
        price_above: bool, // true if betting price will be above target
    }

    public struct UserPosition has key, store {
        id: UID,
        market_id: u64,
        user: address,
        option_a_shares: u64,
        option_b_shares: u64,
        total_invested: u64,
        claimed: bool,
    }

    public struct MarketRegistry has key {
        id: UID,
        market_counter: u64,
        markets: Table<u64, ID>,
        admin: address,
        platform_fee: u64, // Basis points (e.g., 250 = 2.5%)
        treasury: Balance<SUI>,
    }

    public struct AgentDelegation has key, store {
        id: UID,
        user: address,
        agent: address,
        max_bet_amount: u64,
        active: bool,
    }

    // Events
    public struct MarketCreated has copy, drop {
        market_id: u64,
        title: String,
        creator: address,
        market_type: u8,
        end_time: u64,
    }

    public struct BetPlaced has copy, drop {
        market_id: u64,
        user: address,
        agent: address,
        option: u8,
        amount: u64,
        shares: u64,
    }

    public struct MarketResolved has copy, drop {
        market_id: u64,
        outcome: u8,
        resolver: address,
        final_price: u64,
    }

    public struct RewardsClaimed has copy, drop {
        market_id: u64,
        user: address,
        amount: u64,
    }

    public struct AgentDelegationUpdated has copy, drop {
        user: address,
        agent: address,
        approved: bool,
        max_bet_amount: u64,
    }

    // Initialize the market registry
    fun init(ctx: &mut TxContext) {
        let registry = MarketRegistry {
            id: object::new(ctx),
            market_counter: 0,
            markets: table::new(ctx),
            admin: tx_context::sender(ctx),
            platform_fee: 250, // 2.5%
            treasury: balance::zero(),
        };
        transfer::share_object(registry);
    }

    // Create a new prediction market
    public entry fun create_market(
        registry: &mut MarketRegistry,
        title: vector<u8>,
        description: vector<u8>,
        option_a: vector<u8>,
        option_b: vector<u8>,
        category: u8,
        end_time: u64,
        min_bet: u64,
        max_bet: u64,
        image_url: vector<u8>,
        market_type: u8,
        target_price: u64,
        price_above: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, ENotAuthorized);
        assert!(end_time > clock::timestamp_ms(clock), EMarketEnded);
        assert!(min_bet > 0, EInsufficientBet);
        assert!(max_bet >= min_bet, EExcessiveBet);

        registry.market_counter = registry.market_counter + 1;
        let market_id = registry.market_counter;

        let market = Market {
            id: object::new(ctx),
            market_id,
            title: string::utf8(title),
            description: string::utf8(description),
            option_a: string::utf8(option_a),
            option_b: string::utf8(option_b),
            category,
            creator: tx_context::sender(ctx),
            created_at: clock::timestamp_ms(clock),
            end_time,
            min_bet,
            max_bet,
            status: MARKET_ACTIVE,
            outcome: 0,
            resolved: false,
            total_option_a_shares: 0,
            total_option_b_shares: 0,
            total_pool: balance::zero(),
            image_url: string::utf8(image_url),
            market_type,
            target_price,
            price_above,
        };

        let market_object_id = object::id(&market);
        table::add(&mut registry.markets, market_id, market_object_id);

        event::emit(MarketCreated {
            market_id,
            title: string::utf8(title),
            creator: tx_context::sender(ctx),
            market_type,
            end_time,
        });

        transfer::share_object(market);
    }

    // Place a bet on a market
    public entry fun place_bet(
        market: &mut Market,
        option: u8,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let user = tx_context::sender(ctx);
        
        assert!(market.status == MARKET_ACTIVE, EMarketNotFound);
        assert!(clock::timestamp_ms(clock) < market.end_time, EMarketEnded);
        assert!(option == 0 || option == 1, EInvalidOption);
        assert!(amount >= market.min_bet, EInsufficientBet);
        assert!(amount <= market.max_bet, EExcessiveBet);

        // Add payment to market pool
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut market.total_pool, payment_balance);

        // Calculate shares (1:1 ratio for simplicity)
        let shares = amount;

        // Update market shares
        if (option == 0) {
            market.total_option_a_shares = market.total_option_a_shares + shares;
        } else {
            market.total_option_b_shares = market.total_option_b_shares + shares;
        };

        // Create or update user position
        let position_exists = df::exists_(&market.id, user);
        
        if (position_exists) {
            let position: &mut UserPosition = df::borrow_mut(&mut market.id, user);
            if (option == 0) {
                position.option_a_shares = position.option_a_shares + shares;
            } else {
                position.option_b_shares = position.option_b_shares + shares;
            };
            position.total_invested = position.total_invested + amount;
        } else {
            let position = UserPosition {
                id: object::new(ctx),
                market_id: market.market_id,
                user,
                option_a_shares: if (option == 0) shares else 0,
                option_b_shares: if (option == 1) shares else 0,
                total_invested: amount,
                claimed: false,
            };
            df::add(&mut market.id, user, position);
        };

        event::emit(BetPlaced {
            market_id: market.market_id,
            user,
            agent: user, // No agent for direct bets
            option,
            amount,
            shares,
        });
    }

    // Resolve a market manually (for custom events)
    public entry fun resolve_market(
        registry: &mut MarketRegistry,
        market: &mut Market,
        outcome: u8,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, ENotAuthorized);
        assert!(!market.resolved, EMarketAlreadyResolved);
        assert!(market.market_type == MARKET_TYPE_CUSTOM, EInvalidOption);
        assert!(outcome == 0 || outcome == 1, EInvalidOption);

        market.resolved = true;
        market.outcome = outcome;
        market.status = MARKET_RESOLVED;

        event::emit(MarketResolved {
            market_id: market.market_id,
            outcome,
            resolver: tx_context::sender(ctx),
            final_price: 0,
        });
    }

    // Resolve a price-based market (simplified - in production would use oracle)
    public entry fun resolve_price_market(
        registry: &mut MarketRegistry,
        market: &mut Market,
        final_price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, ENotAuthorized);
        assert!(!market.resolved, EMarketAlreadyResolved);
        assert!(market.market_type == MARKET_TYPE_PRICE, EInvalidOption);
        assert!(clock::timestamp_ms(clock) >= market.end_time, EMarketNotEnded);

        // Determine outcome based on price vs target
        let outcome = if (market.price_above) {
            if (final_price >= market.target_price) 0 else 1
        } else {
            if (final_price <= market.target_price) 0 else 1
        };

        market.resolved = true;
        market.outcome = outcome;
        market.status = MARKET_RESOLVED;

        event::emit(MarketResolved {
            market_id: market.market_id,
            outcome,
            resolver: tx_context::sender(ctx),
            final_price,
        });
    }

    // Claim winnings for a specific market
    public entry fun claim_winnings(
        registry: &mut MarketRegistry,
        market: &mut Market,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        assert!(market.resolved, EMarketAlreadyResolved);
        assert!(df::exists_(&market.id, user), ENoWinningPosition);

        let position: &mut UserPosition = df::borrow_mut(&mut market.id, user);
        assert!(!position.claimed, EAlreadyClaimed);
        assert!(position.total_invested > 0, ENoWinningPosition);

        let winning_shares = if (market.outcome == 0) {
            position.option_a_shares
        } else {
            position.option_b_shares
        };
        assert!(winning_shares > 0, ENoWinningPosition);

        let total_winning_shares = if (market.outcome == 0) {
            market.total_option_a_shares
        } else {
            market.total_option_b_shares
        };

        let total_pool_value = balance::value(&market.total_pool);
        let platform_fee = (total_pool_value * registry.platform_fee) / 10000;
        let reward_pool = total_pool_value - platform_fee;

        let user_reward = (reward_pool * winning_shares) / total_winning_shares;

        // Mark as claimed
        position.claimed = true;

        // Transfer platform fee to treasury
        let fee_balance = balance::split(&mut market.total_pool, platform_fee);
        balance::join(&mut registry.treasury, fee_balance);

        // Transfer reward to user
        let reward_balance = balance::split(&mut market.total_pool, user_reward);
        let reward_coin = coin::from_balance(reward_balance, ctx);
        transfer::public_transfer(reward_coin, user);

        event::emit(RewardsClaimed {
            market_id: market.market_id,
            user,
            amount: user_reward,
        });
    }

    // Agent delegation functions
    public entry fun delegate_to_agent(
        agent: address,
        max_bet_amount: u64,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let delegation = AgentDelegation {
            id: object::new(ctx),
            user,
            agent,
            max_bet_amount,
            active: true,
        };

        event::emit(AgentDelegationUpdated {
            user,
            agent,
            approved: true,
            max_bet_amount,
        });

        transfer::transfer(delegation, user);
    }

    // View functions
    public fun get_market_info(market: &Market): (u64, String, String, String, String, u8, u64, u64, u64, u64, u8, bool, u64, u64) {
        (
            market.market_id,
            market.title,
            market.description,
            market.option_a,
            market.option_b,
            market.category,
            market.created_at,
            market.end_time,
            market.min_bet,
            market.max_bet,
            market.status,
            market.resolved,
            market.total_option_a_shares,
            market.total_option_b_shares
        )
    }

    public fun get_user_position(market: &Market, user: address): (u64, u64, u64, bool) {
        if (df::exists_(&market.id, user)) {
            let position: &UserPosition = df::borrow(&market.id, user);
            (position.option_a_shares, position.option_b_shares, position.total_invested, position.claimed)
        } else {
            (0, 0, 0, false)
        }
    }

    public fun get_market_pool_value(market: &Market): u64 {
        balance::value(&market.total_pool)
    }

    // Admin functions
    public entry fun update_platform_fee(
        registry: &mut MarketRegistry,
        new_fee: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, ENotAuthorized);
        registry.platform_fee = new_fee;
    }

    public entry fun withdraw_treasury(
        registry: &mut MarketRegistry,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, ENotAuthorized);
        let treasury_balance = balance::split(&mut registry.treasury, amount);
        let treasury_coin = coin::from_balance(treasury_balance, ctx);
        transfer::public_transfer(treasury_coin, registry.admin);
    }
}
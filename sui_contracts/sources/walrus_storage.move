// Copyright (c) ChimeraAI
// SPDX-License-Identifier: Apache-2.0

/// Module: walrus_storage
/// Integrates Walrus decentralized storage with ChimeraAI prediction markets
module chimera_prediction_market::walrus_storage {
    use std::string::{Self, String};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::dynamic_field;

    // Error codes
    const EInvalidBlobId: u64 = 0;
    const EUnauthorized: u64 = 1;
    const EBlobNotFound: u64 = 2;
    const EInsufficientPayment: u64 = 3;
    const EInvalidDataType: u64 = 4;

    // Storage costs (in MIST)
    const STORAGE_COST_PER_KB: u64 = 1000; // 0.001 SUI per KB
    const MIN_STORAGE_COST: u64 = 100000; // 0.1 SUI minimum

    // Data types
    const CHAT_HISTORY: u8 = 1;
    const BET_HISTORY: u8 = 2;
    const MARKET_ANALYSIS: u8 = 3;

    /// Storage registry for tracking Walrus blobs
    public struct StorageRegistry has key {
        id: UID,
        /// Maps blob_id to StorageRecord
        records: Table<String, StorageRecord>,
        /// Total blobs stored
        total_blobs: u64,
        /// Total storage used (in bytes)
        total_storage: u64,
    }

    /// Individual storage record
    public struct StorageRecord has store {
        blob_id: String,
        owner: address,
        data_type: u8,
        size_bytes: u64,
        timestamp: u64,
        metadata: String,
        cost_paid: u64,
    }

    /// Chat message structure for Walrus storage
    public struct ChatMessage has store, drop {
        id: String,
        message_type: String, // "user" or "assistant"
        content: String,
        timestamp: u64,
        market_id: Option<String>,
    }

    /// Bet history structure for Walrus storage
    public struct BetRecord has store, drop {
        id: String,
        market_id: String,
        market_title: String,
        bet_amount: u64,
        bet_side: String, // "A" or "B"
        timestamp: u64,
        status: String, // "active", "won", "lost", "cancelled"
        payout: Option<u64>,
    }

    /// Storage capability for admin functions
    public struct StorageAdminCap has key, store {
        id: UID,
    }

    // Events
    public struct BlobStored has copy, drop {
        blob_id: String,
        owner: address,
        data_type: u8,
        size_bytes: u64,
        cost_paid: u64,
        timestamp: u64,
    }

    public struct BlobRetrieved has copy, drop {
        blob_id: String,
        requester: address,
        timestamp: u64,
    }

    public struct StoragePayment has copy, drop {
        payer: address,
        amount: u64,
        blob_id: String,
        timestamp: u64,
    }

    /// Initialize the storage registry
    fun init(ctx: &mut TxContext) {
        let registry = StorageRegistry {
            id: object::new(ctx),
            records: table::new(ctx),
            total_blobs: 0,
            total_storage: 0,
        };

        let admin_cap = StorageAdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(registry);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Calculate storage cost based on data size
    public fun calculate_storage_cost(size_bytes: u64): u64 {
        let cost_per_byte = STORAGE_COST_PER_KB / 1024;
        let calculated_cost = size_bytes * cost_per_byte;
        if (calculated_cost < MIN_STORAGE_COST) {
            MIN_STORAGE_COST
        } else {
            calculated_cost
        }
    }

    /// Store a blob reference in the registry
    public fun store_blob(
        registry: &mut StorageRegistry,
        blob_id: String,
        data_type: u8,
        size_bytes: u64,
        metadata: String,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate data type
        assert!(data_type >= 1 && data_type <= 3, EInvalidDataType);

        // Calculate and validate payment
        let required_cost = calculate_storage_cost(size_bytes);
        let paid_amount = coin::value(&payment);
        assert!(paid_amount >= required_cost, EInsufficientPayment);

        // Create storage record
        let record = StorageRecord {
            blob_id: blob_id,
            owner: tx_context::sender(ctx),
            data_type,
            size_bytes,
            timestamp: clock::timestamp_ms(clock),
            metadata,
            cost_paid: paid_amount,
        };

        // Store the record
        table::add(&mut registry.records, blob_id, record);
        registry.total_blobs = registry.total_blobs + 1;
        registry.total_storage = registry.total_storage + size_bytes;

        // Transfer payment to registry (could be sent to treasury)
        transfer::public_transfer(payment, @chimera_prediction_market);

        // Emit events
        event::emit(BlobStored {
            blob_id,
            owner: tx_context::sender(ctx),
            data_type,
            size_bytes,
            cost_paid: paid_amount,
            timestamp: clock::timestamp_ms(clock),
        });

        event::emit(StoragePayment {
            payer: tx_context::sender(ctx),
            amount: paid_amount,
            blob_id,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Retrieve blob information
    public fun get_blob_info(
        registry: &StorageRegistry,
        blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): (address, u8, u64, u64, String) {
        assert!(table::contains(&registry.records, blob_id), EBlobNotFound);
        
        let record = table::borrow(&registry.records, blob_id);
        
        // Emit retrieval event
        event::emit(BlobRetrieved {
            blob_id,
            requester: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });

        (record.owner, record.data_type, record.size_bytes, record.timestamp, record.metadata)
    }

    /// Check if blob exists
    public fun blob_exists(registry: &StorageRegistry, blob_id: String): bool {
        table::contains(&registry.records, blob_id)
    }

    /// Get registry statistics
    public fun get_registry_stats(registry: &StorageRegistry): (u64, u64) {
        (registry.total_blobs, registry.total_storage)
    }

    /// Store chat messages (convenience function)
    public fun store_chat_messages(
        registry: &mut StorageRegistry,
        blob_id: String,
        messages_count: u64,
        total_size: u64,
        user_address: String,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let mut metadata = string::utf8(b"chat_history:");
        string::append(&mut metadata, string::utf8(*string::as_bytes(&user_address)));
        string::append(&mut metadata, string::utf8(b":"));
        string::append(&mut metadata, string::utf8(b"messages_count:"));
        // Note: In a real implementation, you'd convert u64 to string properly
        
        store_blob(
            registry,
            blob_id,
            CHAT_HISTORY,
            total_size,
            metadata,
            payment,
            clock,
            ctx
        );
    }

    /// Store bet history (convenience function)
    public fun store_bet_history(
        registry: &mut StorageRegistry,
        blob_id: String,
        bets_count: u64,
        total_size: u64,
        user_address: String,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let mut metadata = string::utf8(b"bet_history:");
        string::append(&mut metadata, string::utf8(*string::as_bytes(&user_address)));
        string::append(&mut metadata, string::utf8(b":"));
        string::append(&mut metadata, string::utf8(b"bets_count:"));
        // Note: In a real implementation, you'd convert u64 to string properly
        
        store_blob(
            registry,
            blob_id,
            BET_HISTORY,
            total_size,
            metadata,
            payment,
            clock,
            ctx
        );
    }

    /// Admin function to update storage costs
    public fun update_storage_costs(
        _: &StorageAdminCap,
        _new_cost_per_kb: u64,
        _new_min_cost: u64
    ) {
        // In a real implementation, you'd store these as dynamic fields
        // and update the constants accordingly
        abort 0 // Placeholder - implement cost updates
    }

    /// Get data type constants for frontend
    public fun get_data_types(): (u8, u8, u8) {
        (CHAT_HISTORY, BET_HISTORY, MARKET_ANALYSIS)
    }

    // Test functions
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
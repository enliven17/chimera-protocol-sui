import { useState, useEffect, useCallback } from 'react'
import { BetActivity } from './use-bet-activity'
import { toast } from 'sonner'

export const useUserBets = (userAddress?: string) => {
    const [userBets, setUserBets] = useState<BetActivity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's bet activities from localStorage (with Walrus as backup)
    const fetchUserBets = useCallback(async () => {
        if (!userAddress) {
            setUserBets([])
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            let userActivities: BetActivity[] = []
            
            // FIRST: Try to get bets from localStorage (fast, reliable)
            const localBetsKey = `user_bets_${userAddress}`;
            const storedBets = localStorage.getItem(localBetsKey);
            
            if (storedBets) {
                try {
                    const bets = JSON.parse(storedBets);
                    userActivities = bets.map((bet: any) => ({
                        id: bet.id,
                        marketId: bet.marketId,
                        marketTitle: bet.marketTitle,
                        userId: bet.userId || bet.userAddress || 'unknown',
                        userAddress: bet.userAddress || bet.userId || 'unknown',
                        betAmount: typeof bet.betAmount === 'number' ? bet.betAmount : Number(bet.betAmount),
                        betSide: bet.betSide,
                        createdAt: bet.createdAt || bet.timestamp,
                        status: bet.status || 'active',
                        transactionHash: bet.transactionHash,
                        blobId: bet.blobId || bet.metadata?.blobId,
                        metadata: bet.metadata
                    }));
                    console.log(`✅ Loaded ${userActivities.length} bets from localStorage`);
                } catch (error) {
                    console.error('Failed to parse localStorage bets:', error);
                }
            }
            
            // No need to fetch from Walrus - bets are already in localStorage
            // Walrus is just for backup/permanent storage
            
            // Sort by creation date (newest first)
            userActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            setUserBets(userActivities)
        } catch (err: any) {
            console.error('Error fetching user bets:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [userAddress])

    // Get user bets for specific market
    const getUserBetsForMarket = (marketId: string) => {
        return userBets.filter(bet => bet.marketId === marketId)
    }

    // Get user's total stats
    const getUserStats = () => {
        const totalBets = userBets.length
        const totalAmount = userBets.reduce((sum, bet) => sum + bet.betAmount, 0)
        const uniqueMarkets = new Set(userBets.map(bet => bet.marketId)).size

        return {
            totalBets,
            totalAmount,
            uniqueMarkets
        }
    }

    useEffect(() => {
        fetchUserBets()
    }, [fetchUserBets])

    // Listen for bet updates
    useEffect(() => {
        const handleBetUpdate = () => {
            fetchUserBets()
        }

        // Listen for custom bet update events
        window.addEventListener('betPlaced', handleBetUpdate)
        window.addEventListener('storage', handleBetUpdate)

        return () => {
            window.removeEventListener('betPlaced', handleBetUpdate)
            window.removeEventListener('storage', handleBetUpdate)
        }
    }, [fetchUserBets])

    return {
        userBets,
        isLoading,
        error,
        refetch: fetchUserBets,
        getUserBetsForMarket,
        getUserStats
    }
}
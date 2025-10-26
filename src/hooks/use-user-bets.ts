import { useState, useEffect, useCallback } from 'react'
import { BetActivity } from './use-bet-activity'
import { toast } from 'sonner'

export const useUserBets = (userAddress?: string) => {
    const [userBets, setUserBets] = useState<BetActivity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's bet activities from Walrus
    const fetchUserBets = useCallback(async () => {
        if (!userAddress) {
            setUserBets([])
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Get stored bet blob IDs from localStorage for this user
            const storedBlobIds = localStorage.getItem(`user_bet_blobs_${userAddress}`)
            let userActivities: BetActivity[] = []
            
            if (storedBlobIds) {
                const blobIds: string[] = JSON.parse(storedBlobIds)
                
                // Fetch each bet from Walrus
                for (const blobId of blobIds) {
                    try {
                        const response = await fetch('/api/walrus-storage', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'bet',
                                action: 'retrieve',
                                blobId
                            })
                        })

                        const result = await response.json()
                        const betData = result.success ? (result.bet || result.bets) : null
                        
                        if (betData) {
                            if (Array.isArray(betData)) {
                                // If it's an array of bets
                                userActivities.push(...betData.map(bet => ({
                                    id: bet.id,
                                    marketId: bet.marketId,
                                    marketTitle: bet.marketTitle,
                                    userAddress: bet.userAddress,
                                    betAmount: typeof bet.betAmount === 'number' ? bet.betAmount : Number(bet.betAmount),
                                    betSide: bet.betSide,
                                    createdAt: bet.createdAt || bet.timestamp,
                                    status: bet.status || 'active',
                                    transactionHash: bet.transactionHash,
                                    metadata: bet.metadata
                                })))
                            } else {
                                // Single bet object
                                userActivities.push({
                                    id: betData.id,
                                    marketId: betData.marketId,
                                    marketTitle: betData.marketTitle,
                                    userAddress: betData.userAddress,
                                    betAmount: typeof betData.betAmount === 'number' ? betData.betAmount : Number(betData.betAmount),
                                    betSide: betData.betSide,
                                    createdAt: betData.createdAt || betData.timestamp,
                                    status: betData.status || 'active',
                                    transactionHash: betData.transactionHash,
                                    metadata: betData.metadata
                                })
                            }
                        }
                    } catch (error) {
                        console.error(`Failed to load bet from blob ${blobId}:`, error)
                    }
                }
            }

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
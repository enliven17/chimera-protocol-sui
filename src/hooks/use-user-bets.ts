import { useState, useEffect } from 'react'
import { BetActivity } from './use-bet-activity'
import { toast } from 'sonner'

export const useUserBets = (userAddress?: string) => {
    const [userBets, setUserBets] = useState<BetActivity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's bet activities from Walrus
    const fetchUserBets = async () => {
        if (!userAddress) {
            setUserBets([])
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Get all bet activities from localStorage (fallback)
            const storedActivities = localStorage.getItem('bet_activities')
            let allActivities: BetActivity[] = []
            
            if (storedActivities) {
                allActivities = JSON.parse(storedActivities)
            }

            // Filter by user address
            const userActivities = allActivities.filter(activity => 
                activity.userAddress.toLowerCase() === userAddress.toLowerCase()
            )

            // Sort by creation date (newest first)
            userActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            setUserBets(userActivities)
        } catch (err: any) {
            console.error('Error fetching user bets:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

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
    }, [userAddress])

    return {
        userBets,
        isLoading,
        error,
        refetch: fetchUserBets,
        getUserBetsForMarket,
        getUserStats
    }
}
import { useState, useEffect } from 'react'
import { walrusClient } from '@/lib/walrus-client'
import { toast } from 'sonner'

export interface BetActivity {
  id: string
  marketId: string
  userId: string
  userAddress: string
  betAmount: number
  betSide: 'A' | 'B'
  transactionHash?: string
  createdAt: string
  marketTitle?: string
  status?: string
  blobId?: string
  metadata?: any
}

export const useBetActivity = (marketId?: string) => {
  const [activities, setActivities] = useState<BetActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch bet activities from localStorage (primary) with Walrus as backup
  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📡 Fetching bet activities from localStorage...')
      
      let allActivities: BetActivity[] = []
      
      // PRIMARY: Get all bets from localStorage (fast and reliable)
      const globalBetsKey = 'all_bets';
      const storedBets = localStorage.getItem(globalBetsKey);
      
      if (storedBets) {
        try {
          const bets = JSON.parse(storedBets);
          allActivities = bets.map((bet: any) => ({
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
          console.log(`✅ Loaded ${allActivities.length} bets from localStorage`);
        } catch (error) {
          console.error('Failed to parse localStorage bets:', error);
        }
      }

      // Filter by marketId if provided
      const filteredActivities = marketId 
        ? allActivities.filter(activity => activity.marketId === marketId)
        : allActivities

      // Sort by creation date (newest first)
      filteredActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      console.log(`✅ Successfully fetched ${filteredActivities.length} activities${marketId ? ` for market ${marketId}` : ''}`)
      setActivities(filteredActivities)
    } catch (err: any) {
      console.error('❌ Error fetching bet activities:', err)
      setError(err.message || 'Failed to fetch bet activities')
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add new bet activity to Walrus
  const addBetActivity = async (activity: Omit<BetActivity, 'id' | 'createdAt'>) => {
    try {
      const newActivity: BetActivity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }

      // Store to Walrus
      const blobId = await walrusClient.storeBlob(JSON.stringify(newActivity))
      console.log('✅ Bet activity stored to Walrus:', blobId)

      // Also store locally for quick access
      const storedActivities = localStorage.getItem('bet_activities')
      let allActivities: BetActivity[] = []
      
      if (storedActivities) {
        allActivities = JSON.parse(storedActivities)
      }

      allActivities.unshift(newActivity)
      localStorage.setItem('bet_activities', JSON.stringify(allActivities))

      // Add to local state
      setActivities(prev => [newActivity, ...prev])
      return newActivity
    } catch (err: any) {
      console.error('Error adding bet activity:', err)
      toast.error('Failed to record bet activity')
      return null
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [marketId])

  // Listen for bet updates
  useEffect(() => {
    const handleBetUpdate = () => {
      console.log('🔄 Bet update detected, refetching activities...')
      fetchActivities()
    }

    // Listen for custom bet update events
    window.addEventListener('betPlaced', handleBetUpdate)
    window.addEventListener('storage', handleBetUpdate)

    return () => {
      window.removeEventListener('betPlaced', handleBetUpdate)
      window.removeEventListener('storage', handleBetUpdate)
    }
  }, [fetchActivities])

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    addBetActivity
  }
}
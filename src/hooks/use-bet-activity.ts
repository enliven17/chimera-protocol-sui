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
  metadata?: any
}

export const useBetActivity = (marketId?: string) => {
  const [activities, setActivities] = useState<BetActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch bet activities from Walrus
  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching bet activities from Walrus...')
      
      // For now, we'll store activities in localStorage as a fallback
      // In a real implementation, you'd query Walrus storage
      const storedActivities = localStorage.getItem('bet_activities')
      let allActivities: BetActivity[] = []
      
      if (storedActivities) {
        allActivities = JSON.parse(storedActivities)
      }

      // Filter by marketId if provided
      const filteredActivities = marketId 
        ? allActivities.filter(activity => activity.marketId === marketId)
        : allActivities

      // Sort by creation date (newest first)
      filteredActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      console.log('Successfully fetched activities:', filteredActivities.length)
      setActivities(filteredActivities)
    } catch (err: any) {
      console.error('Error fetching bet activities:', err)
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

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    addBetActivity
  }
}
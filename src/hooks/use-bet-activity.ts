import { useState, useEffect } from 'react'
import { supabase, BetActivity } from '@/lib/supabase'
import { toast } from 'sonner'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export const useBetActivity = (marketId?: string) => {
  const [activities, setActivities] = useState<BetActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch bet activities
  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching bet activities...')
      console.log('Supabase client exists:', !!supabase)

      let query = supabase
        .from('bet_activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (marketId) {
        query = query.eq('market_id', marketId)
      }

      console.log('Executing query...')
      const { data, error } = await query.limit(50)

      console.log('Query result:', { data, error })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // If table doesn't exist, just return empty array instead of throwing
        if (error.message?.includes('relation "bet_activities" does not exist')) {
          console.warn('bet_activities table does not exist, returning empty array')
          setActivities([])
          return
        }
        throw error
      }

      console.log('Successfully fetched activities:', data?.length || 0)
      setActivities(data || [])
    } catch (err: any) {
      console.error('Error fetching bet activities:', err)
      setError(err.message || 'Failed to fetch bet activities')
      // Set empty array on error to prevent UI issues
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add new bet activity
  const addBetActivity = async (activity: Omit<BetActivity, 'id' | 'created_at'>) => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.warn('Supabase client not configured, skipping bet activity recording')
        return null
      }

      const { data, error } = await supabase
        .from('bet_activities')
        .insert([activity])
        .select()
        .single()

      if (error) {
        console.error('Supabase error adding bet activity:', error)
        // If table doesn't exist, just log and continue
        if (error.message?.includes('relation "bet_activities" does not exist')) {
          console.warn('bet_activities table does not exist, skipping activity recording')
          return null
        }
        throw error
      }

      // Add to local state
      setActivities(prev => [data, ...prev])
      return data
    } catch (err: any) {
      console.error('Error adding bet activity:', err)
      // Don't show toast error for missing table, just log it
      if (!err.message?.includes('relation "bet_activities" does not exist')) {
        toast.error('Failed to record bet activity')
      }
      // Don't throw error to prevent breaking the betting flow
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
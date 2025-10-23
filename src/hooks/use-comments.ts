import { useState, useEffect } from 'react'
import { supabase, Comment } from '@/lib/supabase'
import { toast } from 'sonner'

export const useComments = (marketId: string) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch comments
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('market_id', marketId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      setComments(data || [])
    } catch (err: any) {
      console.error('Error fetching comments:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Add new comment
  const addComment = async (content: string, userAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          market_id: marketId,
          user_address: userAddress,
          content: content.trim()
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Add to local state
      setComments(prev => [...prev, data])
      toast.success('Comment added successfully!')
      return data
    } catch (err: any) {
      console.error('Error adding comment:', err)
      toast.error('Failed to add comment')
      throw err
    }
  }

  // Delete comment (only by author)
  const deleteComment = async (commentId: string, userAddress: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_address', userAddress)

      if (error) {
        throw error
      }

      // Remove from local state
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted successfully!')
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      toast.error('Failed to delete comment')
      throw err
    }
  }

  useEffect(() => {
    if (marketId) {
      fetchComments()
    }
  }, [marketId])

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
    addComment,
    deleteComment
  }
}
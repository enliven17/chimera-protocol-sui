import { useState, useEffect } from 'react'
import { walrusClient } from '@/lib/walrus-client'
import { toast } from 'sonner'

export interface Comment {
  id: string
  marketId: string
  userId: string
  userAddress: string
  userName: string
  content: string
  likes: number
  dislikes: number
  replies: Comment[]
  isDeleted: boolean
  createdAt: string
  metadata?: any
}

export const useComments = (marketId: string) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch comments from Walrus
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get comments from localStorage (fallback)
      const storedComments = localStorage.getItem(`comments_${marketId}`)
      let marketComments: Comment[] = []
      
      if (storedComments) {
        marketComments = JSON.parse(storedComments)
      }

      // Sort by creation date (oldest first for chronological order)
      marketComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      setComments(marketComments)
    } catch (err: any) {
      console.error('Error fetching comments:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Add new comment to Walrus
  const addComment = async (content: string, userAddress: string) => {
    try {
      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        marketId: marketId,
        userId: userAddress,
        userAddress: userAddress,
        userName: userAddress.slice(0, 8) + '...', // Simplified username
        content: content.trim(),
        likes: 0,
        dislikes: 0,
        replies: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
        metadata: {
          platform: 'Chimera Protocol Sui'
        }
      }

      // Store to Walrus
      const blobResult = await walrusClient.storeBlob(JSON.stringify(newComment))
      console.log('✅ Comment stored to Walrus:', blobResult.blobId)
      
      // Add blob ID to metadata
      newComment.metadata = {
        ...newComment.metadata,
        blobId: blobResult.blobId
      }

      // Also store locally for quick access
      const storedComments = localStorage.getItem(`comments_${marketId}`)
      let marketComments: Comment[] = []
      
      if (storedComments) {
        marketComments = JSON.parse(storedComments)
      }

      marketComments.push(newComment)
      localStorage.setItem(`comments_${marketId}`, JSON.stringify(marketComments))

      // Add to local state
      setComments(prev => [...prev, newComment])
      toast.success('Comment added successfully!')
      return newComment
    } catch (err: any) {
      console.error('Error adding comment:', err)
      toast.error('Failed to add comment')
      throw err
    }
  }

  // Delete comment (only by author)
  const deleteComment = async (commentId: string, userAddress: string) => {
    try {
      // Update local storage
      const storedComments = localStorage.getItem(`comments_${marketId}`)
      let marketComments: Comment[] = []
      
      if (storedComments) {
        marketComments = JSON.parse(storedComments)
      }

      // Find and mark as deleted
      const commentIndex = marketComments.findIndex(c => c.id === commentId && c.userAddress === userAddress)
      if (commentIndex !== -1) {
        marketComments[commentIndex].isDeleted = true
        localStorage.setItem(`comments_${marketId}`, JSON.stringify(marketComments))
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
import { useState, useCallback, useEffect } from 'react';
import { WalrusCommentsService, WalrusComment } from '@/lib/walrus-comments-service';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export interface WalrusCommentsState {
  comments: WalrusComment[];
  isLoading: boolean;
  error: string | null;
  lastBlobId: string | null;
}

export function useWalrusComments(marketId: string) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  
  const [state, setState] = useState<WalrusCommentsState>({
    comments: [],
    isLoading: false,
    error: null,
    lastBlobId: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setComments = useCallback((comments: WalrusComment[]) => {
    setState(prev => ({ ...prev, comments }));
  }, []);

  const setBlobId = useCallback((blobId: string | null) => {
    setState(prev => ({ ...prev, lastBlobId: blobId }));
  }, []);

  /**
   * Load comments for the market
   */
  const loadComments = useCallback(async (blobId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const comments = await WalrusCommentsService.getMarketComments(marketId, blobId);
      setComments(comments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      setError(errorMessage);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [marketId, setLoading, setError, setComments]);

  /**
   * Add a new comment
   */
  const addComment = useCallback(async (
    content: string,
    parentId?: string
  ): Promise<boolean> => {
    if (!currentAccount?.address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const newComment = await WalrusCommentsService.addComment(
        marketId,
        content,
        currentAccount.address,
        parentId,
        signAndExecute
      );

      // Update local state
      setComments(prev => [...prev, newComment]);
      setBlobId(newComment.walrus_blob_id);
      
      toast.success('Comment added and stored on Walrus');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      setError(errorMessage);
      toast.error('Failed to add comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [marketId, currentAccount?.address, signAndExecute, setLoading, setError, setComments, setBlobId]);

  /**
   * Update a comment
   */
  const updateComment = useCallback(async (
    commentId: string,
    content: string
  ): Promise<boolean> => {
    if (!currentAccount?.address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await WalrusCommentsService.updateComment(
        marketId,
        commentId,
        content,
        currentAccount.address,
        signAndExecute
      );

      if (success) {
        // Update local state
        setComments(prev => prev.map(comment => 
          comment.id === commentId && comment.user_address === currentAccount.address
            ? { ...comment, content, edited: true, updated_at: new Date().toISOString() }
            : comment
        ));
        
        toast.success('Comment updated on Walrus');
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      setError(errorMessage);
      toast.error('Failed to update comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [marketId, currentAccount?.address, signAndExecute, setLoading, setError, setComments]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!currentAccount?.address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await WalrusCommentsService.deleteComment(
        marketId,
        commentId,
        currentAccount.address,
        signAndExecute
      );

      if (success) {
        // Update local state
        setComments(prev => prev.filter(comment => 
          !(comment.id === commentId && comment.user_address === currentAccount.address)
        ));
        
        toast.success('Comment deleted from Walrus');
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setError(errorMessage);
      toast.error('Failed to delete comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [marketId, currentAccount?.address, signAndExecute, setLoading, setError, setComments]);

  /**
   * React to a comment
   */
  const reactToComment = useCallback(async (
    commentId: string,
    reactionType: "like" | "dislike"
  ): Promise<boolean> => {
    if (!currentAccount?.address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await WalrusCommentsService.reactToComment(
        marketId,
        commentId,
        currentAccount.address,
        reactionType,
        signAndExecute
      );

      if (success) {
        // Update local state
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            const currentReaction = comment.user_reaction;
            let newLikesCount = comment.likes_count;
            let newDislikesCount = comment.dislikes_count;
            let newUserReaction: "like" | "dislike" | null = null;

            if (currentReaction === reactionType) {
              // Remove reaction
              if (reactionType === "like") {
                newLikesCount = Math.max(0, newLikesCount - 1);
              } else {
                newDislikesCount = Math.max(0, newDislikesCount - 1);
              }
            } else {
              // Add or change reaction
              if (currentReaction === "like") {
                newLikesCount = Math.max(0, newLikesCount - 1);
              } else if (currentReaction === "dislike") {
                newDislikesCount = Math.max(0, newDislikesCount - 1);
              }

              if (reactionType === "like") {
                newLikesCount += 1;
              } else {
                newDislikesCount += 1;
              }
              newUserReaction = reactionType;
            }

            return {
              ...comment,
              likes_count: newLikesCount,
              dislikes_count: newDislikesCount,
              user_reaction: newUserReaction,
            };
          }
          return comment;
        }));
        
        toast.success(`${reactionType === 'like' ? 'Liked' : 'Disliked'} comment`);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to react to comment';
      setError(errorMessage);
      toast.error('Failed to react to comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [marketId, currentAccount?.address, signAndExecute, setLoading, setError, setComments]);

  /**
   * Load comments from a specific blob ID
   */
  const loadFromBlob = useCallback(async (blobId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await WalrusCommentsService.loadCommentsFromBlob(blobId);
      if (data && data.market_id === marketId) {
        setComments(data.comments);
        setBlobId(blobId);
        toast.success('Comments loaded from Walrus');
      } else {
        throw new Error('Invalid blob data or market mismatch');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments from blob';
      setError(errorMessage);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [marketId, setLoading, setError, setComments, setBlobId]);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    ...state,
    loadComments,
    addComment,
    updateComment,
    deleteComment,
    reactToComment,
    loadFromBlob,
  };
}
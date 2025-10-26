import { walrusClient } from '@/lib/walrus-client';

export interface CommentData {
  id: string;
  marketId: string;
  userId: string;
  userAddress: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // For replies
  likes: number;
  dislikes: number;
  replies: string[]; // Array of reply comment IDs
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: any;
}

export interface CommentStorageResult {
  blobId: string;
  commentId: string;
  size: number;
  cost: number;
}

export class CommentWalrusStorage {
  /**
   * Store comment data to Walrus
   */
  async storeComment(commentData: CommentData): Promise<CommentStorageResult> {
    const walrusData = {
      type: 'comment_data',
      version: '1.0',
      timestamp: new Date().toISOString(),
      comment: commentData,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'comment',
        ...commentData.metadata
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Comment stored to Walrus: ${commentData.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        commentId: commentData.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store comment ${commentData.id} to Walrus:`, error);
      throw new Error(`Comment storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve comment data from Walrus
   */
  async retrieveComment(blobId: string): Promise<CommentData> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'comment_data') {
        throw new Error('Invalid data type - expected comment_data');
      }

      console.log(`✅ Comment retrieved from Walrus: ${data.comment.id}`);
      return data.comment;
    } catch (error) {
      console.error(`❌ Failed to retrieve comment from Walrus:`, error);
      throw new Error(`Comment retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update comment data in Walrus
   */
  async updateComment(blobId: string, updatedCommentData: Partial<CommentData>): Promise<CommentStorageResult> {
    try {
      // First retrieve existing data
      const existingData = await walrusClient.retrieveBlob(blobId);
      
      if (existingData.type !== 'comment_data') {
        throw new Error('Invalid data type - expected comment_data');
      }

      // Merge with updated data
      const updatedComment = {
        ...existingData.comment,
        ...updatedCommentData,
        updatedAt: new Date().toISOString()
      };

      // Store updated data
      const updatedWalrusData = {
        ...existingData,
        comment: updatedComment,
        timestamp: new Date().toISOString()
      };

      const blob = await walrusClient.storeBlob(updatedWalrusData);
      
      console.log(`✅ Comment updated in Walrus: ${updatedComment.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        commentId: updatedComment.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to update comment in Walrus:`, error);
      throw new Error(`Comment update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store market's comment thread to Walrus
   */
  async storeMarketComments(marketId: string, comments: CommentData[]): Promise<CommentStorageResult> {
    const walrusData = {
      type: 'market_comments',
      version: '1.0',
      timestamp: new Date().toISOString(),
      marketId,
      comments,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'market_comments',
        totalComments: comments.length,
        totalReplies: comments.reduce((sum, comment) => sum + comment.replies.length, 0)
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Market comments stored to Walrus: ${marketId} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        commentId: `market_${marketId}`,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store market comments to Walrus:`, error);
      throw new Error(`Market comments storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve market's comment thread from Walrus
   */
  async retrieveMarketComments(blobId: string): Promise<CommentData[]> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'market_comments') {
        throw new Error('Invalid data type - expected market_comments');
      }

      console.log(`✅ Market comments retrieved from Walrus: ${data.marketId}`);
      return data.comments;
    } catch (error) {
      console.error(`❌ Failed to retrieve market comments from Walrus:`, error);
      throw new Error(`Market comments retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store user's comment history to Walrus
   */
  async storeUserCommentHistory(userAddress: string, comments: CommentData[]): Promise<CommentStorageResult> {
    const walrusData = {
      type: 'user_comment_history',
      version: '1.0',
      timestamp: new Date().toISOString(),
      userAddress,
      comments,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'user_comment_history',
        totalComments: comments.length,
        totalLikes: comments.reduce((sum, comment) => sum + comment.likes, 0),
        totalDislikes: comments.reduce((sum, comment) => sum + comment.dislikes, 0)
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ User comment history stored to Walrus: ${userAddress} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        commentId: `history_${userAddress}`,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store user comment history to Walrus:`, error);
      throw new Error(`User comment history storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve user's comment history from Walrus
   */
  async retrieveUserCommentHistory(blobId: string): Promise<CommentData[]> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'user_comment_history') {
        throw new Error('Invalid data type - expected user_comment_history');
      }

      console.log(`✅ User comment history retrieved from Walrus: ${data.userAddress}`);
      return data.comments;
    } catch (error) {
      console.error(`❌ Failed to retrieve user comment history from Walrus:`, error);
      throw new Error(`User comment history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store comment with replies to Walrus
   */
  async storeCommentWithReplies(comment: CommentData, replies: CommentData[]): Promise<CommentStorageResult> {
    const walrusData = {
      type: 'comment_with_replies',
      version: '1.0',
      timestamp: new Date().toISOString(),
      comment,
      replies,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'comment_with_replies',
        totalReplies: replies.length
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Comment with replies stored to Walrus: ${comment.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        commentId: comment.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store comment with replies to Walrus:`, error);
      throw new Error(`Comment with replies storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if comment exists in Walrus
   */
  async commentExists(blobId: string): Promise<boolean> {
    try {
      return await walrusClient.blobExists(blobId);
    } catch (error) {
      console.error(`❌ Failed to check comment existence:`, error);
      return false;
    }
  }

  /**
   * Store multiple comments in batch
   */
  async storeCommentsBatch(comments: CommentData[]): Promise<CommentStorageResult[]> {
    const results: CommentStorageResult[] = [];
    
    for (const comment of comments) {
      try {
        const result = await this.storeComment(comment);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to store comment ${comment.id} in batch:`, error);
        // Continue with other comments
      }
    }
    
    console.log(`✅ Batch storage completed: ${results.length}/${comments.length} comments stored`);
    return results;
  }

  /**
   * Get comment statistics
   */
  async getCommentStats(marketId?: string, userAddress?: string): Promise<{
    totalComments: number;
    totalReplies: number;
    totalLikes: number;
    totalDislikes: number;
    averageLikes: number;
  }> {
    // This would require implementing a way to track stored comments
    // For now, return placeholder data
    return {
      totalComments: 0,
      totalReplies: 0,
      totalLikes: 0,
      totalDislikes: 0,
      averageLikes: 0
    };
  }
}

// Singleton instance
export const commentWalrusStorage = new CommentWalrusStorage();





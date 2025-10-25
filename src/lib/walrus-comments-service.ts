// Walrus-based comments service for decentralized storage
import { walrusClient } from "@/lib/walrus-client";
import { 
  storeWalrusBlob, 
  calculateWalrusStorageCost, 
  WALRUS_DATA_TYPES 
} from "@/lib/sui-client";

export interface WalrusComment {
  id: string;
  content: string;
  user_address: string;
  market_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  edited: boolean;
  likes_count: number;
  dislikes_count: number;
  user?: {
    username: string;
    display_name: string;
    profile_image_url?: string;
  };
  replies?: WalrusComment[];
  user_reaction?: "like" | "dislike" | null;
  walrus_blob_id: string;
}

export interface WalrusCommentData {
  comments: WalrusComment[];
  market_id: string;
  timestamp: string;
  type: 'market_comments';
  version: string;
}

export interface WalrusCommentReaction {
  id: string;
  comment_id: string;
  user_address: string;
  reaction_type: "like" | "dislike";
  created_at: string;
}

export class WalrusCommentsService {
  private static commentStorage = new Map<string, WalrusCommentData>();
  private static reactionStorage = new Map<string, WalrusCommentReaction[]>();

  /**
   * Store market comments to Walrus
   */
  static async storeMarketComments(
    marketId: string,
    comments: WalrusComment[],
    userAddress: string,
    signer?: any
  ): Promise<string> {
    const commentData: WalrusCommentData = {
      comments,
      market_id: marketId,
      timestamp: new Date().toISOString(),
      type: 'market_comments',
      version: '1.0',
    };

    try {
      // Store to Walrus network
      const blob = await walrusClient.storeBlob(commentData);
      
      // Register on-chain if signer provided
      if (signer) {
        try {
          const cost = await calculateWalrusStorageCost(blob.size);
          await storeWalrusBlob(
            blob.blobId,
            WALRUS_DATA_TYPES.MARKET_ANALYSIS, // Using market analysis type for comments
            blob.size,
            `market_comments:${marketId}:${comments.length}`,
            cost,
            signer
          );
        } catch (error) {
          console.warn('Failed to register on-chain:', error);
        }
      }

      // Cache locally
      this.commentStorage.set(marketId, commentData);
      
      return blob.blobId;
    } catch (error) {
      console.error('Error storing comments to Walrus:', error);
      throw error;
    }
  }

  /**
   * Retrieve market comments from Walrus
   */
  static async getMarketComments(
    marketId: string,
    blobId?: string
  ): Promise<WalrusComment[]> {
    try {
      // Try cache first
      const cached = this.commentStorage.get(marketId);
      if (cached) {
        return cached.comments;
      }

      // If blob ID provided, retrieve from Walrus
      if (blobId) {
        const data = await walrusClient.retrieveBlob(blobId);
        if (data.type === 'market_comments' && data.market_id === marketId) {
          this.commentStorage.set(marketId, data);
          return data.comments;
        }
      }

      // Return empty array if no data found
      return [];
    } catch (error) {
      console.error('Error retrieving comments from Walrus:', error);
      return [];
    }
  }

  /**
   * Add a new comment
   */
  static async addComment(
    marketId: string,
    content: string,
    userAddress: string,
    parentId?: string,
    signer?: any
  ): Promise<WalrusComment> {
    const newComment: WalrusComment = {
      id: this.generateCommentId(),
      content: content.trim(),
      user_address: userAddress,
      market_id: marketId,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edited: false,
      likes_count: 0,
      dislikes_count: 0,
      replies: [],
      user_reaction: null,
      walrus_blob_id: '',
    };

    try {
      // Get existing comments
      const existingComments = await this.getMarketComments(marketId);
      
      // Add new comment
      const updatedComments = [...existingComments, newComment];
      
      // Store updated comments to Walrus
      const blobId = await this.storeMarketComments(
        marketId,
        updatedComments,
        userAddress,
        signer
      );
      
      newComment.walrus_blob_id = blobId;
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(
    marketId: string,
    commentId: string,
    content: string,
    userAddress: string,
    signer?: any
  ): Promise<boolean> {
    try {
      const existingComments = await this.getMarketComments(marketId);
      
      const updatedComments = existingComments.map(comment => {
        if (comment.id === commentId && comment.user_address === userAddress) {
          return {
            ...comment,
            content: content.trim(),
            edited: true,
            updated_at: new Date().toISOString(),
          };
        }
        return comment;
      });

      await this.storeMarketComments(marketId, updatedComments, userAddress, signer);
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      return false;
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(
    marketId: string,
    commentId: string,
    userAddress: string,
    signer?: any
  ): Promise<boolean> {
    try {
      const existingComments = await this.getMarketComments(marketId);
      
      const filteredComments = existingComments.filter(comment => 
        !(comment.id === commentId && comment.user_address === userAddress)
      );

      await this.storeMarketComments(marketId, filteredComments, userAddress, signer);
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  /**
   * React to a comment (like/dislike)
   */
  static async reactToComment(
    marketId: string,
    commentId: string,
    userAddress: string,
    reactionType: "like" | "dislike",
    signer?: any
  ): Promise<boolean> {
    try {
      const existingComments = await this.getMarketComments(marketId);
      
      const updatedComments = existingComments.map(comment => {
        if (comment.id === commentId) {
          // Update reaction counts
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
      });

      await this.storeMarketComments(marketId, updatedComments, userAddress, signer);
      return true;
    } catch (error) {
      console.error('Error reacting to comment:', error);
      return false;
    }
  }

  /**
   * Get comment count for a market
   */
  static async getMarketCommentCount(marketId: string): Promise<number> {
    try {
      const comments = await this.getMarketComments(marketId);
      return comments.length;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }

  /**
   * Generate a unique comment ID
   */
  private static generateCommentId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get all market comment blob IDs (for sharing)
   */
  static getStoredMarketBlobIds(): string[] {
    const blobIds: string[] = [];
    this.commentStorage.forEach((data) => {
      if (data.comments.length > 0 && data.comments[0].walrus_blob_id) {
        blobIds.push(data.comments[0].walrus_blob_id);
      }
    });
    return blobIds;
  }

  /**
   * Load comments from a specific blob ID
   */
  static async loadCommentsFromBlob(blobId: string): Promise<WalrusCommentData | null> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      if (data.type === 'market_comments') {
        this.commentStorage.set(data.market_id, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading comments from blob:', error);
      return null;
    }
  }
}
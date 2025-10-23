import React, { useState } from 'react';
import { useComments } from '@/hooks/use-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';

interface CommentsSectionProps {
  marketId: number;
  marketTitle: string;
  currentUserAddress: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  marketId, 
  marketTitle, 
  currentUserAddress 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { comments, isLoading, error, addComment, deleteComment } = useComments(marketId.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUserAddress) return;
    
    try {
      setIsSubmitting(true);
      await addComment(newComment, currentUserAddress);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId, currentUserAddress);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#eab308]" />
        <span className="ml-2 text-gray-400">Loading comments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p>Failed to load comments</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      {currentUserAddress ? (
        <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Share your thoughts on this market..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20 min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Commenting as {formatAddress(currentUserAddress)}
                </span>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400">Connect your wallet to join the discussion</p>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-[#eab308]" />
          <h3 className="text-lg font-semibold text-white">
            Discussion ({comments.length})
          </h3>
        </div>

        {comments.length === 0 ? (
          <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg font-medium mb-2">No comments yet</p>
              <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <Card key={comment.id} className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#eab308] to-[#ca8a04] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {comment.user_address.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {formatAddress(comment.user_address)}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {comment.user_address.toLowerCase() === currentUserAddress.toLowerCase() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
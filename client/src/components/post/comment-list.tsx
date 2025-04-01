import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Comment } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CommentForm from "./comment-form";
import { Reply } from "lucide-react";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const { data: comments, isLoading, isError } = useQuery({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-destructive">Error loading comments</div>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  // Filter top-level comments (no parentId)
  const topLevelComments = comments.filter((comment: Comment) => !comment.parentId);
  
  // Get replies for a given comment
  const getReplies = (commentId: number) => {
    return comments.filter((comment: Comment) => comment.parentId === commentId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render a single comment with its replies
  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    
    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mb-8'}`}>
        <div className="flex">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback>{comment.authorName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {comment.authorName || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt.toString())}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs flex items-center"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
            <div className="mt-2 text-sm">
              {comment.content}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4">
                <CommentForm 
                  postId={postId} 
                  parentId={comment.id} 
                  onSuccess={() => setReplyingTo(null)}
                />
              </div>
            )}
            
            {/* Render Replies */}
            {replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {topLevelComments.map(comment => renderComment(comment))}
    </div>
  );
}

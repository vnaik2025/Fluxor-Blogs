import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface RecentCommentsProps {
  comments: any[];
  showViewAll?: boolean;
}

export default function RecentComments({ comments, showViewAll = true }: RecentCommentsProps) {
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Truncate comment content for preview
  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/comments/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Comment updated",
        description: "The comment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/admin/comments/${commentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "The comment has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      setCommentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleApproveComment = (id: number) => {
    approveCommentMutation.mutate({ id, status: "approved" });
  };

  const handleRejectComment = (id: number) => {
    approveCommentMutation.mutate({ id, status: "rejected" });
  };

  const handleDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-800">Recent Comments</h2>
      </div>
      <div className="divide-y divide-neutral-200">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-neutral-50">
              <div className="flex">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                  <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-neutral-800">
                        {comment.authorName || 'Anonymous'}
                      </div>
                      <div className="text-sm text-neutral-500 mb-2">
                        On: {comment.postTitle} • {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {comment.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-success hover:text-success/80 hover:bg-success/10"
                            onClick={() => handleApproveComment(comment.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleRejectComment(comment.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <AlertDialog open={commentToDelete === comment.id} onOpenChange={(open) => !open && setCommentToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-neutral-500 hover:text-destructive"
                            onClick={() => setCommentToDelete(comment.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this comment. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={handleDeleteComment}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">{truncateContent(comment.content)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-neutral-500">
            No comments to display
          </div>
        )}
      </div>
      {showViewAll && (
        <div className="px-6 py-4 border-t border-neutral-200">
          <Link href="/admin/comments" className="text-primary text-sm font-medium hover:underline">
            View all comments
          </Link>
        </div>
      )}
    </div>
  );
}

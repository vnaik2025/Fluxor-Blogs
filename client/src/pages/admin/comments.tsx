import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function AdminComments() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [commentDetail, setCommentDetail] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments with pagination and filters
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["/api/admin/comments", { page: currentPage, search: searchQuery, status: statusFilter, sort: sortOrder }],
    queryFn: async () => {
      let url = `/api/admin/comments?page=${currentPage}&sort=${sortOrder}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    }
  });

  // Approve/Reject comment mutation
  const updateCommentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/comments/${id}`, { status });
      return res.json();
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
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/comments/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      setCommentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  // Handle approve/reject comment
  const handleUpdateCommentStatus = (id: number, status: string) => {
    updateCommentStatusMutation.mutate({ id, status });
  };

  // Handle delete comment
  const handleDeleteComment = () => {
    if (commentToDelete !== null) {
      deleteCommentMutation.mutate(commentToDelete);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Get badge for comment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success">Approved</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-accent/10 text-accent">Pending</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">Rejected</Badge>;
      case "spam":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-800">Spam</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate pagination items
  const getPaginationItems = () => {
    if (!commentsData?.meta) return null;
    
    const { page, totalPages } = commentsData.meta;
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (page > 1) setCurrentPage(page - 1);
          }}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // First page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(1);
          }}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Pages around current
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i <= 1 || i >= totalPages) continue;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(totalPages);
            }}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (page < totalPages) setCurrentPage(page + 1);
          }}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return items;
  };

  return (
    <>
      <Helmet>
        <title>Manage Comments - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex h-screen overflow-hidden bg-neutral-100">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Page Header */}
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-neutral-800">Comments</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Manage Comments</CardTitle>
                    <CardDescription>
                      Review, approve, and manage comments on your blog posts
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input 
                          placeholder="Search comments..." 
                          className="w-full sm:w-64 pl-10"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </form>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Comments</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
                      >
                        {sortOrder === "desc" ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !commentsData || commentsData.data.length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-neutral-50">
                    <MessageSquare className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">No comments found</h3>
                    <p className="text-neutral-600">
                      {searchQuery 
                        ? `No results found for "${searchQuery}"`
                        : statusFilter !== "all"
                          ? `No comments with status "${statusFilter}" found`
                          : "There are no comments yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {commentsData.data.map((comment: any) => (
                        <div 
                          key={comment.id} 
                          className="border rounded-lg p-4 bg-white hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {comment.authorName?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{comment.authorName || "Anonymous"}</div>
                                <div className="text-sm text-neutral-500 mt-0.5">
                                  {formatDate(comment.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getStatusBadge(comment.status)}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setCommentDetail(comment)}
                                className="ml-2"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                          
                          <div className="ml-13 mb-3">
                            <div className="text-sm text-neutral-700 mb-1">
                              <span className="font-medium">On post: </span>
                              <Link 
                                href={`/post/${comment.postSlug}`}
                                className="text-primary hover:underline"
                                target="_blank"
                              >
                                {comment.postTitle}
                              </Link>
                            </div>
                            <p className="text-neutral-600 line-clamp-2">
                              {comment.content}
                            </p>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            {comment.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-success"
                                  onClick={() => handleUpdateCommentStatus(comment.id, "approved")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleUpdateCommentStatus(comment.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {comment.status === "rejected" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-success"
                                onClick={() => handleUpdateCommentStatus(comment.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            )}
                            {comment.status === "approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleUpdateCommentStatus(comment.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            )}
                            <AlertDialog
                              open={commentToDelete === comment.id}
                              onOpenChange={(open) => !open && setCommentToDelete(null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => setCommentToDelete(comment.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete
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
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {commentsData.meta.totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            {getPaginationItems()}
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Comment Detail Dialog */}
      {commentDetail && (
        <Dialog open={!!commentDetail} onOpenChange={() => setCommentDetail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comment Details</DialogTitle>
              <DialogDescription>
                View and moderate this comment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>
                    {commentDetail.authorName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{commentDetail.authorName || "Anonymous"}</div>
                  <div className="text-sm text-neutral-500">
                    {commentDetail.authorEmail || "No email provided"}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {formatDate(commentDetail.createdAt)}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Status:</div>
                <div>{getStatusBadge(commentDetail.status)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">On post:</div>
                <Link 
                  href={`/post/${commentDetail.postSlug}`}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {commentDetail.postTitle}
                </Link>
              </div>
              
              {commentDetail.parentId && (
                <div>
                  <div className="text-sm font-medium mb-1">In reply to:</div>
                  <div className="p-3 bg-neutral-50 rounded-md text-sm">
                    {commentDetail.parentContent || "Parent comment"}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium mb-1">Comment:</div>
                <div className="p-3 bg-neutral-50 rounded-md">
                  {commentDetail.content}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between space-x-2 pt-2">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open(`/post/${commentDetail.postSlug}`, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View in Post
                  </Button>
                  <AlertDialog
                    open={commentToDelete === commentDetail.id}
                    onOpenChange={(open) => !open && setCommentToDelete(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setCommentToDelete(commentDetail.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete
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
                
                <div className="space-x-2">
                  {commentDetail.status !== "approved" && (
                    <Button 
                      className="text-success"
                      onClick={() => {
                        handleUpdateCommentStatus(commentDetail.id, "approved");
                        setCommentDetail(null);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {commentDetail.status !== "rejected" && (
                    <Button 
                      variant="outline" 
                      className="text-destructive"
                      onClick={() => {
                        handleUpdateCommentStatus(commentDetail.id, "rejected");
                        setCommentDetail(null);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

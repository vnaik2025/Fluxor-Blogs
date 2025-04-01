import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin/admin-sidebar";
import RichTextEditor from "@/lib/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { updatePostSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Eye, 
  Calendar, 
  Loader2, 
  ImagePlus,
  Clock, 
  AlertTriangle
} from "lucide-react";
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

// Extend the schema for client-side validation
const editPostSchema = updatePostSchema.extend({
  content: z.string().min(10, "Post content must be at least 10 characters"),
  title: z.string().min(5, "Title must be at least 5 characters"),
});

type EditPostFormValues = z.infer<typeof editPostSchema>;

export default function EditPost() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("content");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch post data
  const { data: post, isLoading, isError } = useQuery({
    queryKey: [`/api/admin/posts/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/posts/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error("Failed to fetch post");
      }
      return res.json();
    }
  });

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Form setup
  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
      isCommentsEnabled: true,
    },
  });

  // Set form values when post data is loaded
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        featuredImage: post.featuredImage || "",
        status: post.status,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        isCommentsEnabled: post.isCommentsEnabled,
      });
    }
  }, [post, form]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: EditPostFormValues) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/posts/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      setLastSaved(new Date());
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      navigate("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditPostFormValues) => {
    // If status is published and no publish date is set, set it to now
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    updatePostMutation.mutate(data);
  };

  const handleDeletePost = () => {
    deletePostMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-destructive/10 p-6 rounded-lg text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-lg font-medium mb-2">Post Not Found</h2>
              <p className="mb-4">The post you're trying to edit doesn't exist or has been deleted.</p>
              <Button onClick={() => navigate("/admin/posts")}>
                Back to Posts
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Post - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex h-screen overflow-hidden bg-neutral-100">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Page Header */}
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => navigate("/admin/posts")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Posts
                  </Button>
                  <h1 className="text-xl font-semibold text-neutral-800">Edit Post</h1>
                  
                  {lastSaved && (
                    <div className="ml-4 text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/post/${post.slug}`, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Post
                  </Button>
                  
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the post "{post.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={handleDeletePost}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    onClick={() => {
                      form.setValue("status", "published");
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={updatePostMutation.isPending}
                  >
                    {updatePostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {post.status === "published" ? "Update" : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter post title" 
                                  {...field} 
                                  className="text-lg font-medium"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">Slug</p>
                            <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                              {post.slug}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation</p>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the post (appears in search results and post previews)" 
                                  {...field}
                                  className="resize-none h-20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                        <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="content" className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Content</FormLabel>
                                  <FormControl>
                                    <RichTextEditor
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="seo" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="metaTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta Title</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="SEO title (leave blank to use post title)" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="metaDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="SEO description (leave blank to use excerpt)" 
                                      {...field}
                                      className="resize-none h-20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  {/* Right Column - Settings */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Publish Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("status") === "scheduled" && (
                          <FormField
                            control={form.control}
                            name="publishedAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publish Date</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value ? new Date(e.target.value) : null);
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Featured Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="featuredImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-4">
                                  {field.value ? (
                                    <div className="relative border rounded-md overflow-hidden">
                                      <img 
                                        src={field.value} 
                                        alt="Featured" 
                                        className="w-full h-40 object-cover"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => field.onChange("")}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="border border-dashed rounded-md p-8 text-center">
                                      <ImagePlus className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                                      <p className="text-sm text-neutral-500">No image selected</p>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <FormLabel>Image URL</FormLabel>
                                    <Input 
                                      placeholder="Enter image URL" 
                                      value={field.value} 
                                      onChange={field.onChange}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="isCommentsEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable comments</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Allow readers to comment on this post
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={updatePostMutation.isPending}
                        >
                          {updatePostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </form>
            </Form>
          </main>
        </div>
      </div>
    </>
  );
}

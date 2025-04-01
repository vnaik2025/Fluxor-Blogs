import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin/admin-sidebar";
import RichTextEditor from "@/lib/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";

// Fix for the react-helmet TypeScript issue
declare module 'react-helmet';
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
  Save, 
  Eye, 
  Calendar, 
  Loader2, 
  ImagePlus, 
  ClipboardList 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Extend the schema for client-side validation
const createPostSchema = insertPostSchema.extend({
  content: z.string().min(10, "Post content must be at least 10 characters"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes"),
  // Ensure string fields have string defaults (not null) for form components
  excerpt: z.string().default(""),
  featuredImage: z.string().default(""),
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export default function CreatePost() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("content");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Fetch tags for the dropdown
  const { data: tags } = useQuery({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    }
  });

  // Form setup
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      status: "draft",
      authorId: user?.id || 0,
      metaTitle: "",
      metaDescription: "",
      isCommentsEnabled: true,
      publishedAt: null, // Add default value for publishedAt
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormValues) => {
      const res = await apiRequest("POST", "/api/admin/posts", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      navigate(`/admin/posts/edit/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (!title) return;

    setIsGeneratingSlug(true);
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    
    form.setValue("slug", slug);
    setIsGeneratingSlug(false);
  };

  const onSubmit = (data: CreatePostFormValues) => {
    // Add authorId if not set
    if (!data.authorId && user) {
      data.authorId = user.id;
    }

    // If status is published and no publish date is set, set it to now
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    // Ensure publishedAt is handled correctly
    // If it's a Date instance, it will be properly serialized to ISO string by the fetch API
    // If it's null, leave it as null
    createPostMutation.mutate({
      ...data,
      publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null
    });
  };

  return (
    <>
      <Helmet>
        <title>Create New Post - Admin</title>
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
                  <h1 className="text-xl font-semibold text-neutral-800">Create New Post</h1>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => form.setValue("status", "draft")}
                    disabled={createPostMutation.isPending}
                    type="button"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => {
                      form.setValue("status", "published");
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={createPostMutation.isPending}
                    type="button"
                  >
                    {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // Auto-generate slug on initial title entry if slug is empty
                                    if (!form.getValues("slug")) {
                                      generateSlug();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Slug</FormLabel>
                                <div className="flex space-x-2">
                                  <FormControl>
                                    <Input 
                                      placeholder="post-url-slug" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    className="mt-0.5"
                                    onClick={generateSlug}
                                    disabled={isGeneratingSlug || !form.getValues("title")}
                                  >
                                    {isGeneratingSlug ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Generate"
                                    )}
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                          disabled={createPostMutation.isPending}
                        >
                          {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Post
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

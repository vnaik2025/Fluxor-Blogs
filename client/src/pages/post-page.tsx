import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import PostCard from "@/components/post/post-card";
import CommentList from "@/components/post/comment-list";
import CommentForm from "@/components/post/comment-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { Loader2, Calendar, User, Eye, Share2, Facebook, Twitter, Linkedin, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PostPage() {
  const { slug } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch post data
  const { data: post, isLoading, isError } = useQuery({
    queryKey: [`/api/posts/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error("Failed to fetch post");
      }
      return res.json();
    }
  });

  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ["/api/posts", { related: slug, limit: 3 }],
    queryFn: async () => {
      const res = await fetch(`/api/posts?related=${slug}&limit=3`);
      if (!res.ok) throw new Error("Failed to fetch related posts");
      return res.json();
    },
    enabled: !!post
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate read time (approx. 200 words per minute)
  const calculateReadTime = (content: string) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Copy URL to clipboard for sharing
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Post URL copied to clipboard",
    });
  };

  // Share on social media
  const shareOnSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || "Check out this blog post");
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh] py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-6">The post you are looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/blog")}>Return to Blog</Button>
        </div>
        <Footer />
      </>
    );
  }

  const readTime = calculateReadTime(post.content);

  // Extract the first sentence from content for meta description if no excerpt
  const getMetaDescription = () => {
    if (post.excerpt) return post.excerpt;
    
    const firstSentence = post.content.split(/[.!?]/, 1)[0];
    return firstSentence.length > 160 
      ? firstSentence.substring(0, 157) + "..."
      : firstSentence;
  };

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title}</title>
        <meta name="description" content={post.metaDescription || getMetaDescription()} />
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta property="og:description" content={post.metaDescription || getMetaDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.featuredImage || ""} />
        <meta property="article:published_time" content={post.publishedAt || ""} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <Navbar />
      
      <main className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <article className="bg-white rounded-xl shadow-sm overflow-hidden">
                {post.featuredImage && (
                  <div className="w-full">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories && post.categories.map((category: any) => (
                      <Badge 
                        key={category.id}
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Link href={`/category/${category.slug}`}>
                          {category.name}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-4">
                    {post.title}
                  </h1>
                  
                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-neutral-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(post.publishedAt?.toString())}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {post.author?.username || "Unknown Author"}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      {post.viewCount} views
                    </div>
                    <div>{readTime} min read</div>
                  </div>
                  
                  {/* Author info if available */}
                  {post.author && (
                    <div className="flex items-center mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} alt={post.author.username} />
                        <AvatarFallback>
                          {post.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-neutral-800">{post.author.username}</p>
                        {post.author.bio && (
                          <p className="text-xs text-neutral-500">{post.author.bio}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Post Content */}
                  <div className="prose prose-slate max-w-none article-content">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium text-neutral-500 mb-2">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: any) => (
                          <Badge 
                            key={tag.id}
                            variant="outline"
                            className="hover:bg-neutral-100"
                          >
                            <Link href={`/blog?tag=${tag.slug}`}>
                              #{tag.name}
                            </Link>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Share buttons */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-neutral-500 mb-2">Share this post:</h3>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-full" 
                        onClick={() => shareOnSocial("facebook")}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-full" 
                        onClick={() => shareOnSocial("twitter")}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-full" 
                        onClick={() => shareOnSocial("linkedin")}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-full" 
                        onClick={copyLink}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
              
              {/* Related Posts */}
              {relatedPosts?.data && relatedPosts.data.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-6">Related Posts</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {relatedPosts.data.map((relatedPost: any) => (
                      <PostCard key={relatedPost.id} post={relatedPost} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Comments Section */}
              {post.isCommentsEnabled && (
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-6">Comments</h2>
                  
                  <CommentList postId={post.id} />
                  
                  <Separator className="my-8" />
                  
                  <h3 className="text-xl font-medium mb-4">Leave a Comment</h3>
                  <CommentForm postId={post.id} />
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

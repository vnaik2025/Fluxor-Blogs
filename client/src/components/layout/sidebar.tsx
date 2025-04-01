import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");

  // Fetch recent posts
  const { data: recentPosts } = useQuery({
    queryKey: ["/api/posts", { limit: 5 }],
    queryFn: async () => {
      const res = await fetch("/api/posts?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent posts");
      return res.json();
    }
  });
  
  // Fetch popular posts
  const { data: popularPosts } = useQuery({
    queryKey: ["/api/posts", { popular: true, limit: 5 }],
    queryFn: async () => {
      const res = await fetch("/api/posts?popular=true&limit=5");
      if (!res.ok) throw new Error("Failed to fetch popular posts");
      return res.json();
    }
  });
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle newsletter subscription
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-0 top-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Posts Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts && recentPosts.data ? (
              recentPosts.data.map((post: any) => (
                <div key={post.id} className="space-y-1">
                  <Link 
                    href={`/post/${post.slug}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <Separator className="mt-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading recent posts...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Posts Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularPosts && popularPosts.data ? (
              popularPosts.data.map((post: any) => (
                <div key={post.id} className="space-y-1">
                  <Link 
                    href={`/post/${post.slug}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {post.viewCount} views
                  </p>
                  <Separator className="mt-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading popular posts...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories ? (
              categories.map((category: any) => (
                <div key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-sm hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Widget */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-lg">Subscribe to Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">Get the latest posts delivered straight to your inbox.</p>
          <form onSubmit={handleSubscribe}>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 placeholder:text-white/60 text-white"
              />
              <Button 
                type="submit" 
                variant="secondary" 
                className="w-full"
              >
                Subscribe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ad Widget */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-neutral-100 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Advertisement</p>
            <div className="h-[250px] flex items-center justify-center border border-dashed border-neutral-300 bg-neutral-50">
              <p className="text-sm text-muted-foreground">Ad Space Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FeaturedPost from "@/components/post/featured-post";
import PostCard from "@/components/post/post-card";
import CategoryCard from "@/components/post/category-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";
import { Post, Category } from "@shared/schema";

export default function HomePage() {
  const [email, setEmail] = useState("");

  // Fetch featured posts
  const { data: featuredPosts, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["/api/posts", { limit: 2, featured: true }],
    queryFn: async () => {
      const res = await fetch("/api/posts?limit=2&featured=true");
      if (!res.ok) throw new Error("Failed to fetch featured posts");
      return res.json();
    }
  });

  // Fetch trending posts
  const { data: trendingPosts, isLoading: isLoadingTrending } = useQuery({
    queryKey: ["/api/posts", { limit: 3, popular: true }],
    queryFn: async () => {
      const res = await fetch("/api/posts?limit=3&popular=true");
      if (!res.ok) throw new Error("Failed to fetch trending posts");
      return res.json();
    }
  });

  // Fetch categories with post counts
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Fetch site settings for SEO
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the email to the newsletter service
    alert(`Subscribed with email: ${email}`);
    setEmail("");
  };

  // Set default data for initial render
  const featured = featuredPosts?.data || [];
  const trending = trendingPosts?.data || [];
  const categoryList = categories || [];

  return (
    <>
      <Helmet>
        <title>{settings?.site_title || "Blogger - Home"}</title>
        <meta name="description" content={settings?.site_description || "Discover stories that matter"} />
        <meta property="og:title" content={settings?.site_title || "Blogger"} />
        <meta property="og:description" content={settings?.site_description || "A place to share knowledge, ideas, and experiences with the world."} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-neutral-800 mb-4">
                Discover Stories That Matter
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-neutral-600">
                A place to share knowledge, ideas, and experiences with the world.
              </p>
            </div>

            {/* Featured Posts */}
            <div className="md:flex md:space-x-8 mb-12">
              <div className="md:w-2/3">
                {isLoadingFeatured ? (
                  <div className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
                ) : featured.length > 0 ? (
                  <FeaturedPost post={featured[0]} variant="primary" />
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center border border-dashed border-neutral-300">
                    <p className="text-neutral-500">No featured posts available</p>
                  </div>
                )}
              </div>
              <div className="md:w-1/3 mt-6 md:mt-0">
                {isLoadingFeatured ? (
                  <div className="bg-neutral-800 rounded-lg shadow-md h-96 animate-pulse" />
                ) : featured.length > 1 ? (
                  <FeaturedPost post={featured[1]} variant="secondary" />
                ) : (
                  <div className="bg-neutral-800 text-white rounded-lg shadow-md p-6 h-full flex items-center justify-center border border-dashed border-neutral-700">
                    <p className="text-neutral-300">No secondary featured post available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Articles Section */}
        <section className="py-12 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-neutral-800">Trending Articles</h2>
              <Link href="/blog">
                <Button variant="link" className="text-primary font-medium hover:underline">
                  View all
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {isLoadingTrending ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm h-80 animate-pulse" />
                ))
              ) : trending.length > 0 ? (
                trending.map((post: Post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-neutral-500">No trending articles available at the moment</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-8">Explore by Category</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoadingCategories ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-primary/5 rounded-lg p-6 h-40 animate-pulse" />
                ))
              ) : categoryList.length > 0 ? (
                categoryList.slice(0, 4).map((category: Category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              ) : (
                <div className="col-span-4 text-center py-12">
                  <p className="text-neutral-500">No categories available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">Join Our Newsletter</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get the latest articles, resources, and updates delivered straight to your inbox. No spam, just valuable content.
            </p>
            
            <form className="max-w-md mx-auto" onSubmit={handleSubscribe}>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 py-3 px-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-neutral-800 font-medium py-3 px-6 rounded-r-lg">
                  Subscribe
                </Button>
              </div>
              <p className="text-white/60 text-xs mt-3">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import PostCard from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

export default function BlogPage() {
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  
  // Extract search query from URL if present
  const params = new URLSearchParams(location.split("?")[1]);
  const searchQuery = params.get("search") || "";
  const categorySlug = params.get("category") || "";
  const tagSlug = params.get("tag") || "";
  
  // Build query params for API
  const buildQueryParams = () => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", currentPage.toString());
    queryParams.append("limit", "9");
    
    if (searchQuery) {
      queryParams.append("search", searchQuery);
    }
    
    if (categorySlug) {
      queryParams.append("category", categorySlug);
    }
    
    if (tagSlug) {
      queryParams.append("tag", tagSlug);
    }
    
    if (sortBy === "popular") {
      queryParams.append("popular", "true");
    } else if (sortBy === "oldest") {
      queryParams.append("sort", "asc");
    }
    
    return queryParams.toString();
  };
  
  // Fetch posts with pagination and filters
  const { data: postsData, isLoading, isError } = useQuery({
    queryKey: ["/api/posts", { page: currentPage, search: searchQuery, category: categorySlug, tag: tagSlug, sort: sortBy }],
    queryFn: async () => {
      const res = await fetch(`/api/posts?${buildQueryParams()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });
  
  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });
  
  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categorySlug, tagSlug, sortBy]);
  
  const getPaginationItems = () => {
    if (!postsData?.meta) return null;
    
    const { page, totalPages } = postsData.meta;
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

  // Prepare page title based on filters
  let pageTitle = "Blog";
  if (searchQuery) {
    pageTitle = `Search: ${searchQuery}`;
  } else if (categorySlug) {
    pageTitle = `Category: ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`;
  } else if (tagSlug) {
    pageTitle = `Tag: ${tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1)}`;
  }

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} - ${settings?.site_title || "Blogger"}`}</title>
        <meta name="description" content={settings?.site_description || "Explore our latest articles and blog posts"} />
      </Helmet>
      
      <Navbar />
      
      <main className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-neutral-800">{pageTitle}</h1>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filter tags if any */}
          {(searchQuery || categorySlug || tagSlug) && (
            <div className="mb-6 flex items-center">
              <span className="text-sm text-neutral-500 mr-2">Filters:</span>
              {searchQuery && (
                <Button variant="outline" size="sm" className="mr-2">
                  Search: {searchQuery} ✕
                </Button>
              )}
              {categorySlug && (
                <Button variant="outline" size="sm" className="mr-2">
                  Category: {categorySlug} ✕
                </Button>
              )}
              {tagSlug && (
                <Button variant="outline" size="sm" className="mr-2">
                  Tag: {tagSlug} ✕
                </Button>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
                  Failed to load posts. Please try again later.
                </div>
              ) : postsData?.data.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No posts found</h3>
                  <p className="text-neutral-600">
                    {searchQuery 
                      ? `No results found for "${searchQuery}".`
                      : categorySlug
                        ? `No posts found in the "${categorySlug}" category.`
                        : tagSlug
                          ? `No posts found with the "${tagSlug}" tag.`
                          : "There are no blog posts to display."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                    {postsData.data.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {postsData.meta.totalPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        {getPaginationItems()}
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
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

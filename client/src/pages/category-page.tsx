import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const [_, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch category details
  const { data: category, isLoading: isLoadingCategory, isError: isCategoryError } = useQuery({
    queryKey: [`/api/categories/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Category not found");
        }
        throw new Error("Failed to fetch category");
      }
      return res.json();
    }
  });

  // Fetch posts in this category
  const { data: postsData, isLoading: isLoadingPosts, isError: isPostsError } = useQuery({
    queryKey: ["/api/posts", { category: slug, page: currentPage }],
    queryFn: async () => {
      const res = await fetch(`/api/posts?category=${slug}&page=${currentPage}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!category
  });

  const isLoading = isLoadingCategory || isLoadingPosts;
  const isError = isCategoryError || isPostsError;

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

  if (isError || !category) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="mb-6">The category you are looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/blog")}>Return to Blog</Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${category.name} - Blog Category`}</title>
        <meta 
          name="description" 
          content={category.description || `Browse all posts in the ${category.name} category`} 
        />
      </Helmet>
      
      <Navbar />
      
      <main className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-neutral-600 max-w-3xl">
                {category.description}
              </p>
            )}
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isPostsError ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
                  Failed to load posts. Please try again later.
                </div>
              ) : !postsData || postsData.data.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No posts found</h3>
                  <p className="text-neutral-600">
                    There are no posts in this category yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
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

import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post, Category } from "@shared/schema";

interface FeaturedPostProps {
  post: Post & {
    author?: {
      username: string;
      avatar?: string;
    };
    categories?: Category[];
  };
  variant?: "primary" | "secondary";
  className?: string;
}

export default function FeaturedPost({ 
  post, 
  variant = "primary", 
  className = "" 
}: FeaturedPostProps) {
  // Format date
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Calculate read time (approx. 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (variant === "primary") {
    return (
      <Card className={`overflow-hidden shadow-md ${className}`}>
        {post.featuredImage && (
          <div className="w-full overflow-hidden">
            <Link href={`/post/${post.slug}`}>
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-96 object-cover transition-transform hover:scale-105 duration-300"
              />
            </Link>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            {post.categories && post.categories.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {post.categories[0].name}
              </Badge>
            )}
            <span className="text-neutral-500 text-sm">{readTime} min read</span>
          </div>
          
          <Link href={`/post/${post.slug}`}>
            <h2 className="text-2xl font-serif font-bold mb-2 hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>
          
          {post.excerpt && (
            <p className="text-neutral-600 mb-4">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center">
            {post.author && (
              <>
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.author.avatar} alt={post.author.username} />
                  <AvatarFallback>
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{post.author.username}</p>
                  <p className="text-xs text-neutral-500">{formattedDate}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Secondary variant (dark card)
  return (
    <Card className={`bg-neutral-800 text-white h-full flex flex-col justify-between shadow-md ${className}`}>
      <CardContent className="p-6">
        {post.categories && post.categories.length > 0 && (
          <Badge variant="outline" className="bg-accent/20 text-accent hover:bg-accent/30 border-0 mb-2">
            Editor's Pick
          </Badge>
        )}
        
        <Link href={`/post/${post.slug}`}>
          <h2 className="text-xl font-serif font-bold mb-4 hover:text-accent transition-colors">
            {post.title}
          </h2>
        </Link>
        
        {post.excerpt && (
          <p className="text-neutral-300 mb-6">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center mt-auto">
          {post.author && (
            <>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                <AvatarFallback className="bg-neutral-700">
                  {post.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{post.author.username}</p>
                <p className="text-xs text-neutral-400">{formattedDate}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

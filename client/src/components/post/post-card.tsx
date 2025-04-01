import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post, Category } from "@shared/schema";

interface PostCardProps {
  post: Post & {
    author?: {
      username: string;
      avatar?: string;
    };
    categories?: Category[];
  };
  className?: string;
}

export default function PostCard({ post, className = "" }: PostCardProps) {
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

  return (
    <Card className={`h-full overflow-hidden transition-shadow hover:shadow-md ${className}`}>
      {post.featuredImage && (
        <div className="aspect-video w-full overflow-hidden">
          <Link href={`/post/${post.slug}`}>
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-48 object-cover transition-transform hover:scale-105 duration-300"
            />
          </Link>
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-center space-x-2 mb-2">
          {post.categories && post.categories.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {post.categories[0].name}
            </Badge>
          )}
          <span className="text-neutral-500 text-sm">{readTime} min read</span>
        </div>
        
        <Link href={`/post/${post.slug}`}>
          <h3 className="text-lg font-serif font-bold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        
        {post.excerpt && (
          <p className="text-neutral-600 mb-4 text-sm line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 px-5 pb-5">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            {post.author && (
              <>
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.author.avatar} alt={post.author.username} />
                  <AvatarFallback>
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-neutral-500">{post.author.username}</span>
              </>
            )}
          </div>
          <span className="text-xs text-neutral-500">{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

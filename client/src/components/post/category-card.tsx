import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@shared/schema";
import { 
  Monitor, 
  PaintBucket, 
  BarChart3, 
  BookOpen 
} from "lucide-react";

interface CategoryCardProps {
  category: Category & {
    postCount?: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Map category slugs to icons
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'technology':
        return <Monitor className="h-12 w-12 mx-auto mb-3 text-primary" />;
      case 'design':
        return <PaintBucket className="h-12 w-12 mx-auto mb-3 text-secondary" />;
      case 'business':
        return <BarChart3 className="h-12 w-12 mx-auto mb-3 text-accent" />;
      case 'tutorials':
        return <BookOpen className="h-12 w-12 mx-auto mb-3 text-destructive" />;
      default:
        return <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />;
    }
  };

  // Get background color based on slug
  const getBackgroundClass = (slug: string) => {
    switch (slug) {
      case 'technology':
        return 'bg-primary/5 hover:bg-primary/10';
      case 'design':
        return 'bg-secondary/5 hover:bg-secondary/10';
      case 'business':
        return 'bg-accent/5 hover:bg-accent/10';
      case 'tutorials':
        return 'bg-destructive/5 hover:bg-destructive/10';
      default:
        return 'bg-primary/5 hover:bg-primary/10';
    }
  };

  return (
    <Link href={`/category/${category.slug}`}>
      <Card className={`${getBackgroundClass(category.slug)} transition-colors rounded-lg p-6 text-center h-full hover:shadow-md`}>
        {getCategoryIcon(category.slug)}
        <CardContent className="p-0">
          <h3 className="font-bold text-neutral-800">{category.name}</h3>
          <p className="text-sm text-neutral-600 mt-1">
            {category.postCount || 0} {category.postCount === 1 ? 'article' : 'articles'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

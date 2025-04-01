import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  iconColor: 
    | "primary" 
    | "secondary" 
    | "accent" 
    | "destructive";
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  isPositiveChange = true, 
  icon: Icon, 
  iconColor 
}: StatsCardProps) {
  // Map color names to Tailwind classes
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorMap[iconColor]}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="ml-5">
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <div className="flex items-center">
              <span className={isPositiveChange ? 'text-success' : 'text-destructive'}>
                {isPositiveChange ? '+' : ''}{change}
              </span>
              <span className="ml-2 text-neutral-500 text-sm">from last month</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

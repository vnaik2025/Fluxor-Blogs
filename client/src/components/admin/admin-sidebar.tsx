import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart2, 
  LogOut, 
  Plus, 
  Image 
} from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { useState } from "react";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    posts: true
  });

  const toggleCollapsible = (name: string) => {
    setOpenItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <Home className="h-5 w-5 mr-3" />
    },
    {
      name: "Posts",
      collapsible: true,
      icon: <FileText className="h-5 w-5 mr-3" />,
      items: [
        { name: "All Posts", href: "/admin/posts" },
        { name: "Add New", href: "/admin/posts/create" },
        { name: "Categories", href: "/admin/categories" },
      ]
    },
    {
      name: "Media",
      href: "/admin/media",
      icon: <Image className="h-5 w-5 mr-3" />
    },
    {
      name: "Comments",
      href: "/admin/comments",
      icon: <MessageSquare className="h-5 w-5 mr-3" />
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5 mr-3" />
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5 mr-3" />
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart2 className="h-5 w-5 mr-3" />
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-neutral-800">
        <div className="flex items-center justify-center h-16 bg-neutral-900">
          <Link href="/admin" className="text-xl text-white font-bold">Blog Admin</Link>
        </div>
        <ScrollArea className="flex-grow">
          <nav className="px-2 py-4 space-y-1">
            {navItems.map((item, idx) => (
              item.collapsible ? (
                <Collapsible key={idx} open={openItems[item.name.toLowerCase()]} onOpenChange={() => toggleCollapsible(item.name.toLowerCase())}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 rounded-md justify-between"
                    >
                      <span className="flex items-center">
                        {item.icon}
                        {item.name}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn("h-4 w-4 transition-transform", openItems[item.name.toLowerCase()] ? "rotate-180" : "")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-10 space-y-1">
                    {item.items?.map((subItem, subIdx) => (
                      <Link 
                        key={subIdx} 
                        href={subItem.href}
                        className={cn(
                          "block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-md",
                          isActive(subItem.href) && "bg-neutral-700 text-white"
                        )}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link 
                  key={idx} 
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 rounded-md",
                    isActive(item.href || "") && "bg-primary text-white"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-neutral-700">
          <Button
            variant="ghost" 
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 rounded-md"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Menu, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path
      ? "text-primary border-b-2 border-primary"
      : "text-neutral-600 hover:text-primary";
  };

  return (
    <header className="bg-white shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif font-bold text-neutral-800">
                {settings?.site_title || "Blogger"}
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md font-medium ${isActive("/")}`}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className={`px-3 py-2 rounded-md font-medium ${isActive("/blog")}`}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-md font-medium ${isActive("/about")}`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md font-medium ${isActive("/contact")}`}
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-64 bg-neutral-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                >
                  <Search className="h-5 w-5 text-neutral-500" />
                </Button>
              </form>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost" className="text-neutral-600 hover:text-primary">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button className="px-4 py-2 rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                      Subscribe
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="-mr-2 ml-6 flex md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-500">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="py-4">
                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/blog"
                      className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                    <Link
                      href="/about"
                      className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                    <div className="mt-4">
                      <form onSubmit={handleSearch} className="relative px-3">
                        <Input
                          type="text"
                          placeholder="Search..."
                          className="w-full bg-neutral-100 rounded-full py-2 px-4 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Search className="h-5 w-5 text-neutral-500" />
                        </Button>
                      </form>
                    </div>
                    <div className="border-t border-neutral-200 mt-4 pt-4">
                      {user ? (
                        <div className="px-3">
                          <div className="flex items-center mb-3">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-neutral-800">{user.username}</p>
                              <p className="text-xs text-neutral-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Link
                              href="/profile"
                              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Profile
                            </Link>
                            {user.role === "admin" && (
                              <Link
                                href="/admin"
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100"
                              onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              Logout
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 px-3">
                          <Link
                            href="/auth"
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/auth?tab=register"
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Register
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

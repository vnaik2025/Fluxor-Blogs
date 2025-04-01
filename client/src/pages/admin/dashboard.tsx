import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import RecentPostsTable from "@/components/admin/recent-posts-table";
import RecentComments from "@/components/admin/recent-comments";
import StatsCard from "@/components/admin/stats-card";
import { Helmet } from "react-helmet";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Eye, 
  PlusCircle,
  Upload,
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch blog stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch blog stats");
      return res.json();
    }
  });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex h-screen overflow-hidden bg-neutral-100">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-lg font-medium">Dashboard</h1>
                <div className="flex items-center">
                  <div className="ml-3 relative">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm font-medium text-neutral-700">{user?.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Posts"
                value={isLoadingStats ? "..." : stats?.postsCount}
                change="8.1%"
                isPositiveChange={true}
                icon={FileText}
                iconColor="primary"
              />
              
              <StatsCard
                title="Comments"
                value={isLoadingStats ? "..." : stats?.commentsCount}
                change="12.4%"
                isPositiveChange={true}
                icon={MessageSquare}
                iconColor="secondary"
              />
              
              <StatsCard
                title="Users"
                value={isLoadingStats ? "..." : stats?.usersCount}
                change="5.2%"
                isPositiveChange={true}
                icon={Users}
                iconColor="accent"
              />
              
              <StatsCard
                title="Page Views"
                value={isLoadingStats ? "..." : `${stats?.viewsCount}`}
                change="2.3%"
                isPositiveChange={false}
                icon={Eye}
                iconColor="destructive"
              />
            </div>
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Posts */}
              <div className="lg:col-span-2">
                <RecentPostsTable 
                  posts={stats?.popularPosts || []} 
                  showViewAll={true}
                />
              </div>
              
              {/* Right Column */}
              <div>
                {/* Recent Comments */}
                <div className="mb-6">
                  <RecentComments 
                    comments={stats?.recentComments || []} 
                    showViewAll={true}
                  />
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-800">Quick Actions</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <Link href="/admin/posts/create">
                      <Button className="w-full flex items-center justify-center">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Add New Post
                      </Button>
                    </Link>
                    
                    <Link href="/admin/media">
                      <Button className="w-full flex items-center justify-center" variant="secondary">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Media
                      </Button>
                    </Link>
                    
                    <Link href="/admin/users">
                      <Button className="w-full flex items-center justify-center" variant="outline">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Add New User
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

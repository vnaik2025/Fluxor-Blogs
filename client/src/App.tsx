import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";

// User-facing pages
import HomePage from "@/pages/home-page";
import BlogPage from "@/pages/blog-page";
import PostPage from "@/pages/post-page";
import CategoryPage from "@/pages/category-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPosts from "@/pages/admin/posts";
import CreatePost from "@/pages/admin/create-post";
import EditPost from "@/pages/admin/edit-post";
import AdminCategories from "@/pages/admin/categories";
import AdminComments from "@/pages/admin/comments";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/post/:slug" component={PostPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/posts" component={AdminPosts} />
      <AdminRoute path="/admin/posts/create" component={CreatePost} />
      <AdminRoute path="/admin/posts/edit/:id" component={EditPost} />
      <AdminRoute path="/admin/categories" component={AdminCategories} />
      <AdminRoute path="/admin/comments" component={AdminComments} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/settings" component={AdminSettings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

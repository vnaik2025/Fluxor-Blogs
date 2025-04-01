import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  Globe,
  Mail,
  MessageSquare,
  FileText,
  Shield,
} from "lucide-react";

// Settings form schema
const settingsFormSchema = z.object({
  // General
  site_title: z.string().min(2, "Site title is required"),
  site_description: z.string(),
  site_tagline: z.string(),
  site_logo: z.string().url("Must be a valid URL").or(z.literal("")),
  site_favicon: z.string().url("Must be a valid URL").or(z.literal("")),
  
  // SEO
  meta_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  social_image: z.string().url("Must be a valid URL").or(z.literal("")),
  
  // Social
  facebook_url: z.string().url("Must be a valid URL").or(z.literal("")),
  twitter_url: z.string().url("Must be a valid URL").or(z.literal("")),
  instagram_url: z.string().url("Must be a valid URL").or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").or(z.literal("")),
  
  // Comments
  enable_comments: z.boolean().default(true),
  comment_moderation: z.boolean().default(true),
  
  // Contact
  contact_email: z.string().email("Must be a valid email").or(z.literal("")),
  contact_phone: z.string(),
  contact_address: z.string(),
  
  // Analytics
  google_analytics_id: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  // Settings form
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      site_title: "",
      site_description: "",
      site_tagline: "",
      site_logo: "",
      site_favicon: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      social_image: "",
      facebook_url: "",
      twitter_url: "",
      instagram_url: "",
      linkedin_url: "",
      enable_comments: true,
      comment_moderation: true,
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      google_analytics_id: "",
    }
  });

  // Update form values when settings are loaded
  useState(() => {
    if (settings) {
      form.reset({
        site_title: settings.site_title || "",
        site_description: settings.site_description || "",
        site_tagline: settings.site_tagline || "",
        site_logo: settings.site_logo || "",
        site_favicon: settings.site_favicon || "",
        meta_title: settings.meta_title || "",
        meta_description: settings.meta_description || "",
        meta_keywords: settings.meta_keywords || "",
        social_image: settings.social_image || "",
        facebook_url: settings.facebook_url || "",
        twitter_url: settings.twitter_url || "",
        instagram_url: settings.instagram_url || "",
        linkedin_url: settings.linkedin_url || "",
        enable_comments: settings.enable_comments !== false,
        comment_moderation: settings.comment_moderation !== false,
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        contact_address: settings.contact_address || "",
        google_analytics_id: settings.google_analytics_id || "",
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const res = await apiRequest("PUT", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Site Settings - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex h-screen overflow-hidden bg-neutral-100">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Page Header */}
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-neutral-800">Site Settings</h1>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="general">
                        <Globe className="h-4 w-4 mr-2" />
                        General
                      </TabsTrigger>
                      <TabsTrigger value="seo">
                        <FileText className="h-4 w-4 mr-2" />
                        SEO
                      </TabsTrigger>
                      <TabsTrigger value="social">
                        <Globe className="h-4 w-4 mr-2" />
                        Social
                      </TabsTrigger>
                      <TabsTrigger value="comments">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                      </TabsTrigger>
                      <TabsTrigger value="contact">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* General Settings */}
                    <TabsContent value="general">
                      <Card>
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>
                            Configure the basic information about your blog
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="site_title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="My Blog" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The name of your website
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="site_tagline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Tagline</FormLabel>
                                <FormControl>
                                  <Input placeholder="Just another blog" {...field} />
                                </FormControl>
                                <FormDescription>
                                  A short description or slogan for your site
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="site_description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="A brief description of your blog"
                                    className="resize-none h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A longer description of your website and its purpose
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="site_logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Logo URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/logo.png" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The URL of your site logo image
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="site_favicon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Favicon URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/favicon.ico" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The URL of your site favicon
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* SEO Settings */}
                    <TabsContent value="seo">
                      <Card>
                        <CardHeader>
                          <CardTitle>SEO Settings</CardTitle>
                          <CardDescription>
                            Configure settings that help improve your site's search engine visibility
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="meta_title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Meta Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="My Blog | Best Content on the Web" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The default title tag for pages without specific meta titles
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="meta_description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Meta Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="A brief description of your site for search engines"
                                    className="resize-none h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The default meta description for pages without specific descriptions
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="meta_keywords"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Meta Keywords</FormLabel>
                                <FormControl>
                                  <Input placeholder="blog, content, articles" {...field} />
                                </FormControl>
                                <FormDescription>
                                  A comma-separated list of keywords for your site
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="social_image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Social Sharing Image</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/social-image.jpg" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The default image used when your content is shared on social media
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Social Settings */}
                    <TabsContent value="social">
                      <Card>
                        <CardHeader>
                          <CardTitle>Social Media Settings</CardTitle>
                          <CardDescription>
                            Configure your social media profiles
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="facebook_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://facebook.com/yourblog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="twitter_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://twitter.com/yourblog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="instagram_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://instagram.com/yourblog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="linkedin_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/company/yourblog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Comments Settings */}
                    <TabsContent value="comments">
                      <Card>
                        <CardHeader>
                          <CardTitle>Comments Settings</CardTitle>
                          <CardDescription>
                            Configure how comments are handled on your blog
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="enable_comments"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Enable Comments</FormLabel>
                                  <FormDescription>
                                    Allow visitors to comment on your blog posts
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="comment_moderation"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Comment Moderation</FormLabel>
                                  <FormDescription>
                                    Require comments to be approved before they are published
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Contact Settings */}
                    <TabsContent value="contact">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                          <CardDescription>
                            Configure your contact information for the contact page
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="contact@yourblog.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The primary email address for contact inquiries
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (123) 456-7890" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The phone number displayed on your contact page
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contact_address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="123 Blog Street, San Francisco, CA 94103"
                                    className="resize-none h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The physical address displayed on your contact page
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save All Settings
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
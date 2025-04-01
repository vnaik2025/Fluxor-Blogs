import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Users, Heart } from "lucide-react";

export default function AboutPage() {
  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  return (
    <>
      <Helmet>
        <title>About Us - {settings?.site_title || "Blogger"}</title>
        <meta 
          name="description" 
          content={`Learn more about ${settings?.site_title || "Blogger"} and our mission to share knowledge and insights.`} 
        />
      </Helmet>
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-serif font-bold text-neutral-800 mb-6">
                About {settings?.site_title || "Blogger"}
              </h1>
              <p className="text-xl text-neutral-600 mb-8">
                A place where ideas, knowledge, and experiences come together to inspire and inform.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-12 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-4">Our Story</h2>
                <p className="text-neutral-600 mb-4">
                  Founded in 2023, Blogger started with a simple mission: to create a platform where experts and enthusiasts could share their knowledge and insights with the world.
                </p>
                <p className="text-neutral-600 mb-4">
                  What began as a small personal blog has grown into a vibrant community of writers, readers, and commenters who come together to explore ideas, learn new skills, and engage in meaningful conversations.
                </p>
                <p className="text-neutral-600">
                  Today, we're proud to host thousands of articles spanning technology, design, business, and more, all written with the goal of informing, inspiring, and occasionally challenging our readers.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <blockquote className="border-l-4 border-primary pl-4 italic text-neutral-700">
                  "Our goal is to create a space where knowledge flows freely, where experts share their insights, and where readers can find reliable information that helps them grow personally and professionally."
                  <footer className="mt-2 text-sm text-neutral-500">
                    — Founder & Editor-in-Chief
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-4">Our Values</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                These core principles guide everything we do, from the content we publish to the way we interact with our community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Quality</h3>
                <p className="text-neutral-600">
                  We're committed to publishing well-researched, thoughtfully written content that provides real value to our readers.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="text-secondary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Education</h3>
                <p className="text-neutral-600">
                  We believe in the power of knowledge sharing to improve lives and foster personal and professional growth.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="bg-accent/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Community</h3>
                <p className="text-neutral-600">
                  We foster an inclusive environment where diverse perspectives are welcomed and respectful dialogue is encouraged.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="bg-destructive/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Heart className="text-destructive h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Passion</h3>
                <p className="text-neutral-600">
                  We're driven by a genuine enthusiasm for the topics we cover and the positive impact our content can have.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-4">Meet Our Team</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                The passionate individuals behind our content, ensuring quality and thoughtfulness in everything we publish.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-neutral-200">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="Sarah Johnson" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-1">Sarah Johnson</h3>
                <p className="text-primary mb-3">Founder & Editor-in-Chief</p>
                <p className="text-neutral-600 text-sm">
                  With over 15 years of experience in digital publishing, Sarah leads our editorial vision and strategy.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-neutral-200">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="David Chen" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-1">David Chen</h3>
                <p className="text-primary mb-3">Technology Editor</p>
                <p className="text-neutral-600 text-sm">
                  A software engineer turned writer, David brings technical expertise and clarity to complex topics.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-neutral-200">
                  <img 
                    src="https://randomuser.me/api/portraits/women/68.jpg" 
                    alt="Maya Patel" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-1">Maya Patel</h3>
                <p className="text-primary mb-3">Design Lead</p>
                <p className="text-neutral-600 text-sm">
                  With a background in UX/UI design, Maya ensures our content is both beautiful and accessible.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Join Our Community</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Be part of our journey to create and share valuable content. Subscribe to our newsletter, become a contributor, or join the conversation in the comments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-block bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-neutral-100 transition-colors">
                Contact Us
              </a>
              <a href="/auth?tab=register" className="inline-block bg-accent text-neutral-800 px-6 py-3 rounded-md font-medium hover:bg-accent/90 transition-colors">
                Sign Up
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}

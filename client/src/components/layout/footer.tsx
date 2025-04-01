import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">
              {settings?.site_title || "Blogger"}
            </h3>
            <p className="text-neutral-400 text-sm mb-4">
              {settings?.site_description || "Sharing knowledge, ideas, and experiences with the world."}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-neutral-400 hover:text-white text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/blog" className="text-neutral-400 hover:text-white text-sm">Technology</Link></li>
                  <li><Link href="/blog" className="text-neutral-400 hover:text-white text-sm">Design</Link></li>
                  <li><Link href="/blog" className="text-neutral-400 hover:text-white text-sm">Business</Link></li>
                  <li><Link href="/blog" className="text-neutral-400 hover:text-white text-sm">Tutorials</Link></li>
                  <li><Link href="/blog" className="text-neutral-400 hover:text-white text-sm">Productivity</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-400 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-white text-sm">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-neutral-400 hover:text-white text-sm">Terms of Service</Link></li>
              <li><Link href="/faq" className="text-neutral-400 hover:text-white text-sm">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <address className="not-italic text-neutral-400 text-sm">
              <p className="mb-2">123 Blog Street</p>
              <p className="mb-2">San Francisco, CA 94103</p>
              <p className="mb-2">info@blogger.com</p>
              <p>(123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center">
          <p className="text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} {settings?.site_title || "Blogger"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

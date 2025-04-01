import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPostSchema, 
  updatePostSchema, 
  insertCategorySchema, 
  insertTagSchema, 
  insertCommentSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import moment from "moment";

/**
 * Process request body to convert specially marked date fields from client
 * This handles date objects that were serialized with the _isDate flag
 */
function processDateFields(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // If this is a marked date field, return a formatted date string
  if (obj._isDate === true && obj.value) {
    return moment(obj.value).format('YYYY-MM-DD HH:mm:ss');
  }
  
  // If it's an array, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => processDateFields(item));
  }
  
  // If it's an object, process each property
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = processDateFields(obj[key]);
    }
  }
  
  return result;
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // ======================
  // PUBLIC API ROUTES
  // ======================

  // Get all published posts
  app.get("/api/posts", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const categorySlug = req.query.category as string;
      const tagSlug = req.query.tag as string;
      const search = req.query.search as string;
      
      const result = await storage.getPosts({
        page,
        limit,
        categorySlug,
        tagSlug,
        search,
        status: "published"
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get a single post by slug
  app.get("/api/posts/:slug", async (req, res, next) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViewCount(post.id);
      
      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  // Get category by slug
  app.get("/api/categories/:slug", async (req, res, next) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Get all tags
  app.get("/api/tags", async (req, res, next) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });

  // Get comments for a post
  app.get("/api/posts/:postId/comments", async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  });

  // Add a comment to a post
  app.post("/api/comments", async (req, res, next) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      
      // If user is authenticated, use their ID
      if (req.isAuthenticated() && req.user) {
        commentData.authorId = req.user.id;
      }
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Get site settings
  app.get("/api/settings", async (req, res, next) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // Get ad units
  app.get("/api/ads", async (req, res, next) => {
    try {
      const ads = await storage.getActiveAdUnits();
      res.json(ads);
    } catch (error) {
      next(error);
    }
  });

  // ======================
  // AUTHENTICATED API ROUTES
  // ======================

  // Get user profile
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    res.json(req.user);
  });

  // ======================
  // ADMIN API ROUTES
  // ======================

  // Get all posts (including drafts) for admin
  app.get("/api/admin/posts", isAdmin, async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      
      const result = await storage.getPosts({
        page,
        limit,
        status
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Create a new post
  app.post("/api/admin/posts", isAdmin, async (req, res, next) => {
    try {
      // Pre-process the request body to handle our special date objects
      const processedBody = processDateFields(req.body);
      
      // Parse the incoming data with our schema which properly handles dates
      const postData = insertPostSchema.parse(processedBody);
      
      // Set the author ID to the current user
      // Since isAdmin middleware checks if user is authenticated, req.user is guaranteed to exist
      postData.authorId = req.user!.id;
      
      // Process publishedAt date
      // Ensure it's a properly formatted string
      if (postData.publishedAt && typeof postData.publishedAt === 'string' && postData.publishedAt.trim() !== '') {
        // Keep as string but ensure consistent format
        postData.publishedAt = moment(postData.publishedAt).format('YYYY-MM-DD HH:mm:ss');
      }
      
      console.log('Processed post data:', JSON.stringify(postData, null, 2));
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Update a post
  app.put("/api/admin/posts/:id", isAdmin, async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      
      // Pre-process the request body to handle our special date objects
      const processedBody = processDateFields(req.body);
      
      const postData = updatePostSchema.parse(processedBody);
      
      // Process publishedAt date
      // Ensure it's a properly formatted string
      if (postData.publishedAt && typeof postData.publishedAt === 'string' && postData.publishedAt.trim() !== '') {
        // Keep as string but ensure consistent format
        postData.publishedAt = moment(postData.publishedAt).format('YYYY-MM-DD HH:mm:ss');
      }
      
      const post = await storage.updatePost(postId, postData);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Delete a post
  app.delete("/api/admin/posts/:id", isAdmin, async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.deletePost(postId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Create a category
  app.post("/api/admin/categories", isAdmin, async (req, res, next) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Update a category
  app.put("/api/admin/categories/:id", isAdmin, async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const categoryData = insertCategorySchema.pick({
        name: true,
        description: true,
        featuredImage: true,
        parentId: true
      }).parse(req.body);
      
      const category = await storage.updateCategory(categoryId, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Delete a category
  app.delete("/api/admin/categories/:id", isAdmin, async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Get blog statistics
  app.get("/api/admin/stats", isAdmin, async (req, res, next) => {
    try {
      const stats = await storage.getBlogStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Manage comments (approve, reject, delete)
  app.put("/api/admin/comments/:id", isAdmin, async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["approved", "rejected", "spam"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const comment = await storage.updateCommentStatus(commentId, status);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error) {
      next(error);
    }
  });

  // Delete a comment
  app.delete("/api/admin/comments/:id", isAdmin, async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      await storage.deleteComment(commentId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Update settings
  app.put("/api/admin/settings", isAdmin, async (req, res, next) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.updateSettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  });

  // Create a special endpoint to promote a user to admin (for first-time setup)
  app.post("/api/promote-to-admin", async (req, res, next) => {
    try {
      const { username, secretKey } = req.body;
      
      // This is a sensitive operation, so we add a secret key check
      // In a production app, you'd want to use an environment variable
      if (secretKey !== "BloggerAdminSetup") {
        return res.status(403).json({ message: "Invalid secret key" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user role to admin
      const updatedUser = await storage.updateUser(user.id, { role: "admin" });
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

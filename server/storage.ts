import { 
  User, InsertUser, Post, InsertPost, UpdatePost, 
  Category, InsertCategory, Tag, InsertTag, 
  Comment, InsertComment, AdUnit, Setting, InsertSetting
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Types for pagination and filtering
interface PostFilters {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  status?: string;
  authorId?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface BlogStats {
  postsCount: number;
  commentsCount: number;
  usersCount: number;
  viewsCount: number;
  popularPosts: Post[];
  recentComments: Comment[];
}

// Storage interface
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(filters: PostFilters): Promise<PaginatedResponse<Post>>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: UpdatePost): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  incrementPostViewCount(id: number): Promise<void>;
  getPopularPosts(limit?: number): Promise<Post[]>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;
  getCategoriesForPost(postId: number): Promise<Category[]>;
  
  // Tag methods
  getTag(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  getTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, data: Partial<Tag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<void>;
  getTagsForPost(postId: number): Promise<Tag[]>;
  
  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentStatus(id: number, status: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<void>;
  getRecentComments(limit?: number): Promise<Comment[]>;
  
  // Ad unit methods
  getAdUnit(id: number): Promise<AdUnit | undefined>;
  getActiveAdUnits(): Promise<AdUnit[]>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(group?: string): Promise<Record<string, any>>;
  updateSettings(settings: Record<string, any>): Promise<Record<string, any>>;
  
  // Stats methods
  getBlogStats(): Promise<BlogStats>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private comments: Map<number, Comment>;
  private adUnits: Map<number, AdUnit>;
  private settings: Map<string, Setting>;
  private postCategories: Map<string, { postId: number, categoryId: number }>;
  private postTags: Map<string, { postId: number, tagId: number }>;
  
  sessionStore: session.SessionStore;
  private currentIds: {
    user: number;
    post: number;
    category: number;
    tag: number;
    comment: number;
    adUnit: number;
    setting: number;
  };

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.comments = new Map();
    this.adUnits = new Map();
    this.settings = new Map();
    this.postCategories = new Map();
    this.postTags = new Map();
    
    this.currentIds = {
      user: 1,
      post: 1,
      category: 1,
      tag: 1,
      comment: 1,
      adUnit: 1,
      setting: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add some initial settings
    this.settings.set("site_title", {
      id: this.getNextId("setting"),
      key: "site_title",
      value: "Blogger",
      group: "general"
    });
    
    this.settings.set("site_description", {
      id: this.getNextId("setting"),
      key: "site_description",
      value: "A place to share knowledge, ideas, and experiences with the world.",
      group: "general"
    });
  }

  private getNextId(entity: keyof typeof this.currentIds): number {
    return this.currentIds[entity]++;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser, isAdmin: boolean = false): Promise<User> {
    const id = this.getNextId("user");
    const role = isAdmin ? "admin" : "user";
    const user: User = { ...insertUser, id, role, isActive: true, bio: "", avatar: "" };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(post => post.slug === slug);
  }

  async getPosts(filters: PostFilters = {}): Promise<PaginatedResponse<Post>> {
    const {
      page = 1,
      limit = 10,
      categorySlug,
      tagSlug,
      search,
      status,
      authorId
    } = filters;
    
    let filteredPosts = Array.from(this.posts.values());
    
    // Filter by status
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    } else {
      // Default to published posts
      filteredPosts = filteredPosts.filter(post => post.status === 'published');
    }
    
    // Filter by author
    if (authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === authorId);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (categorySlug) {
      const category = Array.from(this.categories.values()).find(c => c.slug === categorySlug);
      if (category) {
        const categoryPostIds = new Set(
          Array.from(this.postCategories.values())
            .filter(pc => pc.categoryId === category.id)
            .map(pc => pc.postId)
        );
        filteredPosts = filteredPosts.filter(post => categoryPostIds.has(post.id));
      } else {
        filteredPosts = [];
      }
    }
    
    // Filter by tag
    if (tagSlug) {
      const tag = Array.from(this.tags.values()).find(t => t.slug === tagSlug);
      if (tag) {
        const tagPostIds = new Set(
          Array.from(this.postTags.values())
            .filter(pt => pt.tagId === tag.id)
            .map(pt => pt.postId)
        );
        filteredPosts = filteredPosts.filter(post => tagPostIds.has(post.id));
      } else {
        filteredPosts = [];
      }
    }
    
    // Sort by published date (newest first)
    filteredPosts.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Pagination
    const total = filteredPosts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      data: paginatedPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = this.getNextId("post");
    const newPost: Post = { ...post, id, viewCount: 0 };
    this.posts.set(id, newPost);
    return newPost;
  }

  async updatePost(id: number, data: UpdatePost): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
    
    // Remove associated categories and tags
    Array.from(this.postCategories.entries())
      .filter(([_, pc]) => pc.postId === id)
      .forEach(([key, _]) => this.postCategories.delete(key));
    
    Array.from(this.postTags.entries())
      .filter(([_, pt]) => pt.postId === id)
      .forEach(([key, _]) => this.postTags.delete(key));
      
    // Remove associated comments
    Array.from(this.comments.entries())
      .filter(([_, comment]) => comment.postId === id)
      .forEach(([commentId, _]) => this.comments.delete(Number(commentId)));
  }

  async incrementPostViewCount(id: number): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.viewCount++;
      this.posts.set(id, post);
    }
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.status === 'published')
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.getNextId("category");
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...data };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
    
    // Remove category from posts
    Array.from(this.postCategories.entries())
      .filter(([_, pc]) => pc.categoryId === id)
      .forEach(([key, _]) => this.postCategories.delete(key));
  }

  async getCategoriesForPost(postId: number): Promise<Category[]> {
    const categoryIds = Array.from(this.postCategories.values())
      .filter(pc => pc.postId === postId)
      .map(pc => pc.categoryId);
    
    return categoryIds
      .map(id => this.categories.get(id))
      .filter((category): category is Category => !!category);
  }

  // Tag methods
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(tag => tag.slug === slug);
  }

  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.getNextId("tag");
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }

  async updateTag(id: number, data: Partial<Tag>): Promise<Tag | undefined> {
    const tag = this.tags.get(id);
    if (!tag) return undefined;
    
    const updatedTag = { ...tag, ...data };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: number): Promise<void> {
    this.tags.delete(id);
    
    // Remove tag from posts
    Array.from(this.postTags.entries())
      .filter(([_, pt]) => pt.tagId === id)
      .forEach(([key, _]) => this.postTags.delete(key));
  }

  async getTagsForPost(postId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId)
      .map(pt => pt.tagId);
    
    return tagIds
      .map(id => this.tags.get(id))
      .filter((tag): tag is Tag => !!tag);
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId && comment.status === 'approved')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.getNextId("comment");
    const newComment: Comment = { 
      ...comment, 
      id, 
      status: 'pending',
      createdAt: new Date()
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async updateCommentStatus(id: number, status: string): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment = { ...comment, status };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
    
    // Delete child comments (replies)
    Array.from(this.comments.entries())
      .filter(([_, comment]) => comment.parentId === id)
      .forEach(([commentId, _]) => this.comments.delete(Number(commentId)));
  }

  async getRecentComments(limit: number = 5): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  // Ad unit methods
  async getAdUnit(id: number): Promise<AdUnit | undefined> {
    return this.adUnits.get(id);
  }

  async getActiveAdUnits(): Promise<AdUnit[]> {
    return Array.from(this.adUnits.values()).filter(ad => ad.isActive);
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(group?: string): Promise<Record<string, any>> {
    let settingsArray = Array.from(this.settings.values());
    
    if (group) {
      settingsArray = settingsArray.filter(setting => setting.group === group);
    }
    
    const settingsObject: Record<string, any> = {};
    settingsArray.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });
    
    return settingsObject;
  }

  async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    for (const [key, value] of Object.entries(settings)) {
      const existingSetting = this.settings.get(key);
      
      if (existingSetting) {
        existingSetting.value = value;
        this.settings.set(key, existingSetting);
      } else {
        const id = this.getNextId("setting");
        this.settings.set(key, {
          id,
          key,
          value,
          group: "general"
        });
      }
    }
    
    return this.getSettings();
  }

  // Stats methods
  async getBlogStats(): Promise<BlogStats> {
    const publishedPosts = Array.from(this.posts.values()).filter(post => post.status === 'published');
    
    return {
      postsCount: publishedPosts.length,
      commentsCount: this.comments.size,
      usersCount: this.users.size,
      viewsCount: publishedPosts.reduce((sum, post) => sum + post.viewCount, 0),
      popularPosts: await this.getPopularPosts(4),
      recentComments: await this.getRecentComments(5)
    };
  }
}

export const storage = new MemStorage();

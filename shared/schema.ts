import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import moment from "moment";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

// Blog post model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  isCommentsEnabled: boolean("is_comments_enabled").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
});

// Create the base schema
const baseInsertPostSchema = createInsertSchema(posts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  authorId: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  isCommentsEnabled: true,
});

// Create a modified schema where all string fields default to empty string instead of null
// This helps avoid TypeScript errors with components expecting strings
export const insertPostSchema = baseInsertPostSchema.extend({
  excerpt: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  status: z.string().optional().default("draft"),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  // Handle Date fields as string
  publishedAt: z.string().nullable().optional().default(""),
});

// Similar to insertPostSchema, create a modified updatePostSchema with proper defaults
const baseUpdatePostSchema = createInsertSchema(posts).pick({
  title: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  isCommentsEnabled: true,
});

export const updatePostSchema = baseUpdatePostSchema.extend({
  excerpt: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  status: z.string().optional().default("draft"),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  publishedAt: z.string().nullable().optional().default(""),
});

// Category model
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featuredImage: text("featured_image"),
  parentId: integer("parent_id"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  featuredImage: true,
  parentId: true,
});

// Posts to categories (many-to-many)
export const postCategories = pgTable("post_categories", {
  postId: integer("post_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

// Tag model
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  slug: true,
  description: true,
});

// Posts to tags (many-to-many)
export const postTags = pgTable("post_tags", {
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  authorId: integer("author_id"),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  parentId: integer("parent_id"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

const baseInsertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true,
  authorId: true,
  authorName: true,
  authorEmail: true,
  parentId: true,
});

export const insertCommentSchema = baseInsertCommentSchema.extend({
  createdAt: z.string().default(() => moment().format('YYYY-MM-DD HH:mm:ss')),
});

// Ad units
export const adUnits = pgTable("ad_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  placement: text("placement").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertAdUnitSchema = createInsertSchema(adUnits).pick({
  name: true,
  code: true,
  placement: true,
  isActive: true,
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  group: text("group").notNull().default("general"),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  group: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type AdUnit = typeof adUnits.$inferSelect;
export type InsertAdUnit = z.infer<typeof insertAdUnitSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

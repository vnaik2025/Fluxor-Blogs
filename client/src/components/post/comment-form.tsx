import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCommentSchema } from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
}

// Create schema for comment form with client-side validation
const commentFormSchema = insertCommentSchema
  .omit({ postId: true, authorId: true, parentId: true })
  .extend({
    authorName: z.string().min(2, "Name must be at least 2 characters").optional(),
    authorEmail: z.string().email("Invalid email address").optional(),
  });

type CommentFormValues = z.infer<typeof commentFormSchema>;

export default function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      authorName: user ? user.name || user.username : "",
      authorEmail: user ? user.email : "",
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      // Combine form data with post ID and author ID (if logged in)
      const commentData = {
        content: data.content,
        postId,
        parentId: parentId || null,
        authorId: user ? user.id : undefined,
        authorName: !user ? data.authorName : undefined,
        authorEmail: !user ? data.authorEmail : undefined,
      };

      const res = await apiRequest("POST", "/api/comments", commentData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch comments for this post
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      form.reset();
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted and is awaiting approval",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: CommentFormValues) {
    setIsSubmitting(true);
    commentMutation.mutate(data);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your comment here..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!user && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={isSubmitting || commentMutation.isPending}
        >
          {(isSubmitting || commentMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {parentId ? "Reply" : "Post Comment"}
        </Button>
      </form>
    </Form>
  );
}

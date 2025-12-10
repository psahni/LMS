"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCourse } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";

export const CreateCourseForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    
    setIsLoading(true);
    
    const result = await createCourse({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    
    setIsLoading(false);
    
    if (result.success && result.courseId) {
      toast.success("Course created successfully!");
      router.push(`/author/courses/${result.courseId}`);
    } else {
      toast.error(result.error || "Failed to create course");
    }
  };
  
  const handleCancel = () => {
    router.push("/author/courses");
  };
  
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Enter the basic information for your course
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              aria-required="true"
              aria-label="Course title"
              tabIndex={0}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Give your course a clear and descriptive title
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              aria-label="Course description"
              tabIndex={0}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              A good description helps students understand what they&apos;ll learn
            </p>
          </div>
          
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              tabIndex={0}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              tabIndex={0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};


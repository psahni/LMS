"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCourse } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { BookOpen, Loader2, X, ImageIcon } from "lucide-react";
import { Course } from "@prisma/client";

interface EditCourseFormProps {
  course: Course;
}

export const EditCourseForm = ({ course }: EditCourseFormProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [thumbnail, setThumbnail] = useState(course.thumbnail || "");
  const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnail || "");
  
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setThumbnail(result.url);
        toast.success("Thumbnail uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload thumbnail");
        setThumbnailPreview(course.thumbnail || "");
      }
    } catch {
      toast.error("Failed to upload thumbnail");
      setThumbnailPreview(course.thumbnail || "");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveThumbnail = () => {
    setThumbnail("");
    setThumbnailPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    
    setIsLoading(true);
    
    const result = await updateCourse(course.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      thumbnail: thumbnail || undefined,
    });
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Course updated successfully!");
      router.push(`/author/courses/${course.id}`);
    } else {
      toast.error(result.error || "Failed to update course");
    }
  };
  
  const handleCancel = () => {
    router.push(`/author/courses/${course.id}`);
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
              Update the basic information for your course
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Course Thumbnail</Label>
            <div className="flex items-start gap-4">
              <div 
                className="relative flex h-32 w-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/30 transition-colors hover:border-violet-500/50 hover:bg-muted/50 overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload thumbnail image"
              >
                {thumbnailPreview ? (
                  <>
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-violet-600">Click to upload</span>
                      <br />
                      PNG, JPG, WebP (max 5MB)
                    </div>
                  </div>
                )}
              </div>
              
              {thumbnailPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveThumbnail}
                  disabled={isUploading}
                  className="shrink-0"
                  aria-label="Remove thumbnail"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleThumbnailUpload}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Add a thumbnail to help students identify your course
            </p>
          </div>
          
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
              disabled={isLoading || isUploading || !title.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              tabIndex={0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

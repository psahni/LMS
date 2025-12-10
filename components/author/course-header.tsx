"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Globe,
  EyeOff,
} from "lucide-react";
import { deleteCourse, publishCourse, unpublishCourse } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { Course, Chapter, Video } from "@prisma/client";

interface CourseWithDetails extends Course {
  chapters: (Chapter & { videos: Video[] })[];
  _count: {
    enrollments: number;
  };
}

interface CourseHeaderProps {
  course: CourseWithDetails;
}

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const totalVideos = course.chapters.reduce(
    (acc, chapter) => acc + chapter.videos.length,
    0
  );
  
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCourse(course.id);
    setIsDeleting(false);
    
    if (result.success) {
      toast.success("Course deleted successfully");
      router.push("/author/courses");
    } else {
      toast.error(result.error || "Failed to delete course");
    }
  };
  
  const handlePublishToggle = async () => {
    setIsPublishing(true);
    
    if (course.status === "PUBLISHED") {
      const result = await unpublishCourse(course.id);
      if (result.success) {
        toast.success("Course unpublished");
      } else {
        toast.error(result.error || "Failed to unpublish course");
      }
    } else {
      const result = await publishCourse(course.id);
      if (result.success) {
        toast.success("Course published");
      } else {
        toast.error(result.error || "Failed to publish course");
      }
    }
    
    setIsPublishing(false);
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      DRAFT: {
        label: "Draft",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      },
      PUBLISHED: {
        label: "Published",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
      EXPIRE: {
        label: "Expired",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    };
    
    const config = variants[status] || variants.DRAFT;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/author/courses">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Back to courses"
            tabIndex={0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Back to courses</span>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 p-6 rounded-xl border border-border/40 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shrink-0">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(course.status)}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {course.description || "No description provided"}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{course.chapters.length} chapters</span>
              <span>•</span>
              <span>{totalVideos} videos</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course._count.enrollments} students</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            disabled={isPublishing}
            className="gap-2"
            tabIndex={0}
            aria-label={course.status === "PUBLISHED" ? "Unpublish course" : "Publish course"}
          >
            {course.status === "PUBLISHED" ? (
              <>
                <EyeOff className="h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Course options"
                tabIndex={0}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/author/courses/${course.id}/edit`} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Course Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{course.title}&quot;? This action cannot be undone and will remove all chapters, videos, and enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


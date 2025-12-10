"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Search,
  Plus,
  Users,
  Video,
  FileText,
} from "lucide-react";
import { deleteCourse, publishCourse, unpublishCourse } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { Course, Chapter, Video as VideoType } from "@/app/generated/prisma/client";

interface CourseWithDetails extends Course {
  chapters: (Chapter & { videos: VideoType[] })[];
  _count: {
    enrollments: number;
    chapters: number;
  };
}

interface CoursesListProps {
  courses: CourseWithDetails[];
}

export const CoursesList = ({ courses }: CoursesListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<CourseWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDelete = async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteCourse(courseToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      toast.success("Course deleted successfully");
      setCourseToDelete(null);
    } else {
      toast.error(result.error || "Failed to delete course");
    }
  };
  
  const handlePublishToggle = async (course: CourseWithDetails) => {
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
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; className: string }> = {
      DRAFT: { 
        variant: "secondary", 
        label: "Draft",
        className: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
      },
      PUBLISHED: { 
        variant: "default", 
        label: "Published",
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
      },
      EXPIRE: { 
        variant: "destructive", 
        label: "Expired",
        className: ""
      },
    };
    
    const config = variants[status] || variants.DRAFT;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };
  
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search courses"
          />
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">
              {searchQuery ? "No courses found" : "No courses yet"}
            </h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by creating your first course. Share your knowledge with students around the world."}
            </p>
            {!searchQuery && (
              <Link href="/author/courses/create" className="mt-6">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden border-border/40 hover:border-border/80 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Course options"
                        tabIndex={0}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/author/courses/${course.id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View Course
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/author/courses/${course.id}/edit`} className="cursor-pointer">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Course
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handlePublishToggle(course)}
                        className="cursor-pointer"
                      >
                        {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCourseToDelete(course)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(course.status)}
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description || "No description provided"}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{course._count.chapters}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4" />
                    <span>
                      {course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{course._count.enrollments}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href={`/author/courses/${course.id}`}>
                    <Button variant="outline" className="w-full" tabIndex={0}>
                      Manage Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{courseToDelete?.title}&quot;? This action cannot be undone and will remove all chapters, videos, and enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseToDelete(null)}
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


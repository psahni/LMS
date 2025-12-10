import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { Course, Chapter, Video } from "@prisma/client";

interface CourseWithDetails extends Course {
  chapters: (Chapter & { videos: Video[] })[];
  _count: {
    enrollments: number;
    chapters: number;
  };
}

interface RecentCoursesProps {
  courses: CourseWithDetails[];
}

export const RecentCourses = ({ courses }: RecentCoursesProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      DRAFT: { variant: "secondary", label: "Draft" },
      PUBLISHED: { variant: "default", label: "Published" },
      EXPIRE: { variant: "destructive", label: "Expired" },
    };
    
    const config = variants[status] || variants.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Courses</CardTitle>
          <CardDescription>
            Your recently created courses
          </CardDescription>
        </div>
        <Link href="/author/courses/create">
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Get started by creating your first course. Share your knowledge with students around the world.
            </p>
            <Link href="/author/courses/create" className="mt-4">
              <Button>Create Your First Course</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:border-border/80 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 overflow-hidden">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="h-6 w-6 text-violet-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{course._count.chapters} chapters</span>
                      <span>•</span>
                      <span>
                        {course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0)} videos
                      </span>
                      <span>•</span>
                      <span>{course._count.enrollments} students</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(course.status)}
                  <Link href={`/author/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            
            {courses.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <Link href="/author/courses">
                  <Button variant="outline" className="w-full">
                    View All Courses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


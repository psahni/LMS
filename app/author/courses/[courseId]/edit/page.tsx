import { notFound } from "next/navigation";
import { getCourseById } from "@/app/actions/course-actions";
import { EditCourseForm } from "@/components/author/edit-course-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;
  const course = await getCourseById(parseInt(courseId, 10));
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/author/courses/${course.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Back to course"
            tabIndex={0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-muted-foreground mt-1">
            Update your course details
          </p>
        </div>
      </div>
      
      <EditCourseForm course={course} />
    </div>
  );
}


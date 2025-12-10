import { notFound } from "next/navigation";
import { getCourseById } from "@/app/actions/course-actions";
import { CourseHeader } from "@/components/author/course-header";
import { ChaptersList } from "@/components/author/chapters-list";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = await getCourseById(parseInt(courseId, 10));
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <CourseHeader course={course} />
      <ChaptersList courseId={course.id} chapters={course.chapters} />
    </div>
  );
}


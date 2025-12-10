import { getCoursesByAuthor } from "@/app/actions/course-actions";
import { CoursesList } from "@/components/author/courses-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getCoursesByAuthor();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage and create your courses
          </p>
        </div>
        <Link href="/author/courses/create">
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>
      
      <CoursesList courses={courses} />
    </div>
  );
}


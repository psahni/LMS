import { CreateCourseForm } from "@/components/author/create-course-form";

export default function CreateCoursePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to create a new course
        </p>
      </div>
      
      <CreateCourseForm />
    </div>
  );
}


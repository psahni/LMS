import { getCoursesByAuthor } from "@/app/actions/course-actions";
import { DashboardStats } from "@/components/author/dashboard-stats";
import { RecentCourses } from "@/components/author/recent-courses";

export default async function AuthorDashboard() {
  const courses = await getCoursesByAuthor();
  
  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "PUBLISHED").length,
    draftCourses: courses.filter((c) => c.status === "DRAFT").length,
    totalEnrollments: courses.reduce((acc, c) => acc + c._count.enrollments, 0),
    totalChapters: courses.reduce((acc, c) => acc + c._count.chapters, 0),
    totalVideos: courses.reduce(
      (acc, c) => acc + c.chapters.reduce((chAcc, ch) => chAcc + ch.videos.length, 0),
      0
    ),
  };
  
  const recentCourses = courses.slice(0, 5);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your courses.
        </p>
      </div>
      
      <DashboardStats stats={stats} />
      
      <RecentCourses courses={recentCourses} />
    </div>
  );
}


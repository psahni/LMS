import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Users, Video, CheckCircle, Clock } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalChapters: number;
    totalVideos: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statItems = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      description: "All your courses",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "Published",
      value: stats.publishedCourses,
      icon: CheckCircle,
      description: "Live courses",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Drafts",
      value: stats.draftCourses,
      icon: Clock,
      description: "Work in progress",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      description: "Total students",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Chapters",
      value: stats.totalChapters,
      icon: FileText,
      description: "Across all courses",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Video,
      description: "Total content",
      gradient: "from-indigo-500 to-violet-600",
    },
  ];
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statItems.map((item) => (
        <Card
          key={item.title}
          className="relative overflow-hidden border-border/40 hover:border-border/80 transition-colors"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient}`}
            >
              <item.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


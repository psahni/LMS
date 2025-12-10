"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth-actions";

// Helper to get author ID with authentication check
const getAuthorId = async (): Promise<number> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    throw new Error("Only authors can perform this action");
  }
  return user.id;
};

export interface CreateCourseInput {
  title: string;
  description?: string;
}

export interface CreateChapterInput {
  title: string;
  courseId: number;
  order: number;
}

export interface CreateVideoInput {
  title: string;
  url: string;
  chapterId: number;
  order: number;
  duration?: number;
}

export interface UpdateVideoOrderInput {
  videoId: number;
  newOrder: number;
}

// Course Actions
export const createCourse = async (data: CreateCourseInput) => {
  try {
    const authorId = await getAuthorId();
    
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description || null,
        authorId,
        status: "DRAFT",
      },
    });
    
    revalidatePath("/author/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "Failed to create course" };
  }
};

export const getCoursesByAuthor = async () => {
  try {
    const authorId = await getAuthorId();
    
    const courses = await prisma.course.findMany({
      where: {
        authorId,
      },
      include: {
        chapters: {
          include: {
            videos: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return courses;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

export const getCourseById = async (courseId: number) => {
  try {
    const authorId = await getAuthorId();
    
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        authorId,
      },
      include: {
        chapters: {
          include: {
            videos: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
    
    return course;
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return null;
  }
};

export const updateCourse = async (courseId: number, data: Partial<CreateCourseInput>) => {
  try {
    const authorId = await getAuthorId();
    
    await prisma.course.update({
      where: {
        id: courseId,
        authorId,
      },
      data: {
        title: data.title,
        description: data.description,
      },
    });
    
    revalidatePath(`/author/courses/${courseId}`);
    revalidatePath("/author/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { success: false, error: "Failed to update course" };
  }
};

export const publishCourse = async (courseId: number) => {
  try {
    const authorId = await getAuthorId();
    
    await prisma.course.update({
      where: {
        id: courseId,
        authorId,
      },
      data: {
        status: "PUBLISHED",
      },
    });
    
    revalidatePath(`/author/courses/${courseId}`);
    revalidatePath("/author/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to publish course:", error);
    return { success: false, error: "Failed to publish course" };
  }
};

export const unpublishCourse = async (courseId: number) => {
  try {
    const authorId = await getAuthorId();
    
    await prisma.course.update({
      where: {
        id: courseId,
        authorId,
      },
      data: {
        status: "DRAFT",
      },
    });
    
    revalidatePath(`/author/courses/${courseId}`);
    revalidatePath("/author/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to unpublish course:", error);
    return { success: false, error: "Failed to unpublish course" };
  }
};

export const deleteCourse = async (courseId: number) => {
  try {
    // Delete all related data first
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      select: { id: true },
    });
    
    for (const chapter of chapters) {
      await prisma.video.deleteMany({
        where: { chapterId: chapter.id },
      });
    }
    
    await prisma.chapter.deleteMany({
      where: { courseId },
    });
    
    await prisma.courseEnrollment.deleteMany({
      where: { courseId },
    });
    
    const authorId = await getAuthorId();
    
    await prisma.course.delete({
      where: {
        id: courseId,
        authorId,
      },
    });
    
    revalidatePath("/author/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "Failed to delete course" };
  }
};

// Chapter Actions
export const createChapter = async (data: CreateChapterInput) => {
  try {
    const chapter = await prisma.chapter.create({
      data: {
        title: data.title,
        courseId: data.courseId,
        order: data.order,
      },
    });
    
    revalidatePath(`/author/courses/${data.courseId}`);
    return { success: true, chapterId: chapter.id };
  } catch (error) {
    console.error("Failed to create chapter:", error);
    return { success: false, error: "Failed to create chapter" };
  }
};

export const updateChapter = async (chapterId: number, title: string) => {
  try {
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title },
    });
    
    revalidatePath(`/author/courses/${chapter.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update chapter:", error);
    return { success: false, error: "Failed to update chapter" };
  }
};

export const deleteChapter = async (chapterId: number) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });
    
    if (!chapter) {
      return { success: false, error: "Chapter not found" };
    }
    
    // Delete all videos in the chapter first
    await prisma.video.deleteMany({
      where: { chapterId },
    });
    
    await prisma.chapter.delete({
      where: { id: chapterId },
    });
    
    revalidatePath(`/author/courses/${chapter.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete chapter:", error);
    return { success: false, error: "Failed to delete chapter" };
  }
};

// Video Actions
export const createVideo = async (data: CreateVideoInput) => {
  try {
    const video = await prisma.video.create({
      data: {
        title: data.title,
        url: data.url,
        chapterId: data.chapterId,
        order: data.order,
        duration: data.duration,
      },
    });
    
    const chapter = await prisma.chapter.findUnique({
      where: { id: data.chapterId },
      select: { courseId: true },
    });
    
    if (chapter) {
      revalidatePath(`/author/courses/${chapter.courseId}`);
    }
    
    return { success: true, videoId: video.id };
  } catch (error) {
    console.error("Failed to create video:", error);
    return { success: false, error: "Failed to create video" };
  }
};

export const updateVideo = async (
  videoId: number, 
  data: Partial<Omit<CreateVideoInput, "chapterId" | "order">>
) => {
  try {
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: data.title,
        url: data.url,
        duration: data.duration,
      },
      include: {
        chapter: {
          select: { courseId: true },
        },
      },
    });
    
    revalidatePath(`/author/courses/${video.chapter.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update video:", error);
    return { success: false, error: "Failed to update video" };
  }
};

export const deleteVideo = async (videoId: number) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        chapter: {
          select: { courseId: true },
        },
      },
    });
    
    if (!video) {
      return { success: false, error: "Video not found" };
    }
    
    await prisma.video.delete({
      where: { id: videoId },
    });
    
    revalidatePath(`/author/courses/${video.chapter.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete video:", error);
    return { success: false, error: "Failed to delete video" };
  }
};

export const reorderVideos = async (chapterId: number, videoIds: number[]) => {
  try {
    const updatePromises = videoIds.map((videoId, index) =>
      prisma.video.update({
        where: { id: videoId },
        data: { order: index + 1 },
      })
    );
    
    await Promise.all(updatePromises);
    
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });
    
    if (chapter) {
      revalidatePath(`/author/courses/${chapter.courseId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder videos:", error);
    return { success: false, error: "Failed to reorder videos" };
  }
};

export const reorderChapters = async (courseId: number, chapterIds: number[]) => {
  try {
    const updatePromises = chapterIds.map((chapterId, index) =>
      prisma.chapter.update({
        where: { id: chapterId },
        data: { order: index + 1 },
      })
    );
    
    await Promise.all(updatePromises);
    revalidatePath(`/author/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder chapters:", error);
    return { success: false, error: "Failed to reorder chapters" };
  }
};


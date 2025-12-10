import { prisma } from "../app/lib/prisma";

async function main() {
  // Create a test author user
  const author = await prisma.user.upsert({
    where: { email: "author@example.com" },
    update: {},
    create: {
      email: "author@example.com",
      name: "Test Author",
      password: "password123", // In production, this should be hashed
      role: "AUTHOR",
    },
  });

  console.log("Created author:", author);

  // Create a sample course
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
      authorId: author.id,
      status: "DRAFT",
    },
  });

  console.log("Created course:", course);

  // Create sample chapters
  const chapter1 = await prisma.chapter.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Getting Started with HTML",
      courseId: course.id,
      order: 1,
    },
  });

  const chapter2 = await prisma.chapter.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "CSS Fundamentals",
      courseId: course.id,
      order: 2,
    },
  });

  console.log("Created chapters:", chapter1, chapter2);

  // Create sample videos
  const video1 = await prisma.video.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "What is HTML?",
      url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
      chapterId: chapter1.id,
      order: 1,
      duration: 600,
    },
  });

  const video2 = await prisma.video.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "HTML Document Structure",
      url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
      chapterId: chapter1.id,
      order: 2,
      duration: 900,
    },
  });

  const video3 = await prisma.video.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: "Introduction to CSS",
      url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
      chapterId: chapter2.id,
      order: 1,
      duration: 720,
    },
  });

  console.log("Created videos:", video1, video2, video3);

  console.log("\n✅ Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


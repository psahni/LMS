"use server";

import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { auth0 } from "@/app/lib/auth0";
import crypto from "crypto";

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // Note: In production, use bcrypt.hashSync(password, 10)
  // For simplicity, we're using a basic hash here
  return crypto.createHash("sha256").update(password).digest("hex");
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  return hash === hashedPassword;
};

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Sign up a new author
export const signUpAuthor = async (data: SignUpInput) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash the password
    const hashedPassword = hashPassword(data.password);

    // Create the user with AUTHOR role
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "AUTHOR",
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create account" };
  }
};

// Login with email and password
export const loginWithCredentials = async (data: LoginInput) => {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user is an author
    if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
      return { success: false, error: "Only authors can access this portal" };
    }

    // Verify password
    if (!verifyPassword(data.password, user.password)) {
      return { success: false, error: "Invalid email or password" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("lms_user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Failed to login:", error);
    return { success: false, error: "Failed to login" };
  }
};

// Get current user from session
export const getCurrentUser = async () => {
  try {
    // First check Auth0 session
    const auth0Session = await auth0.getSession();
    
    if (auth0Session) {
      // Sync Auth0 user with database
      const user = await syncAuth0User(auth0Session.user);
      return user;
    }

    // Fall back to cookie-based session
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("lms_user_id");

    if (!userIdCookie) {
      return null;
    }

    const userId = parseInt(userIdCookie.value, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

// Sync Auth0 user with database
export const syncAuth0User = async (auth0User: {
  sub?: string;
  email?: string;
  name?: string;
  nickname?: string;
}) => {
  try {
    if (!auth0User.email) {
      return null;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: auth0User.email },
    });

    if (!user) {
      // Create new user with AUTHOR role
      user = await prisma.user.create({
        data: {
          email: auth0User.email,
          name: auth0User.name || auth0User.nickname || "Author",
          password: auth0User.sub || "", // Store Auth0 sub as password placeholder
          role: "AUTHOR",
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Failed to sync Auth0 user:", error);
    return null;
  }
};

// Logout
export const logout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("lms_user_id");
    return { success: true };
  } catch (error) {
    console.error("Failed to logout:", error);
    return { success: false, error: "Failed to logout" };
  }
};



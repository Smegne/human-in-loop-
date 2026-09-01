"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    general?: string[];
  };
  message?: string;
};

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = formData.get("role") as string;

  // ── Validation ──────────────────────────────────────────────────────────────
  const errors: SignupState["errors"] = {};

  if (!name || name.trim().length < 2) {
    errors.name = ["Name must be at least 2 characters."];
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  if (!password || password.length < 8) {
    errors.password = ["Password must be at least 8 characters."];
  } else if (password !== confirmPassword) {
    errors.password = ["Passwords do not match."];
  }

  if (!role || !["ADMIN", "EMPLOYEE"].includes(role)) {
    errors.role = ["Please select a valid role."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // ── Create user ──────────────────────────────────────────────────────────────
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { errors: { email: ["An account with this email already exists."] } };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role: role as "ADMIN" | "EMPLOYEE",
      },
    });

    // Create an EmployeeProfile for employees automatically
    if (role === "EMPLOYEE") {
      await db.employeeProfile.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
        },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Signup error:", message);
    return {
      errors: {
        general: [
          process.env.NODE_ENV === "development"
            ? `Error: ${message}`
            : `Something went wrong: ${message}`,
        ],
      },
    };
  }

  redirect("/login?registered=true");
}

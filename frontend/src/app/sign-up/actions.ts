"use server";

import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const password = input.password;
  const name = input.name?.trim();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    throw new Error("An account with that email already exists");
  }

  const passwordHash = await hash(password, 12);

  await db.collection("users").insertOne({
    email,
    passwordHash,
    name: name || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { ok: true };
}

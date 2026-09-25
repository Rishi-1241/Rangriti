import type { Metadata } from "next";
import { LoginExperience } from "@/components/auth/LoginExperience";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginExperience next={typeof next === "string" ? next : "/studio"} />;
}

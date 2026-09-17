"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AiNotConfiguredError } from "@/lib/ai-client";
import { generateCustomerInsights } from "@/lib/customer-insights";
import { getActor } from "@/lib/scope";

export async function generateCustomerInsightsAction() {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  try {
    await generateCustomerInsights();
  } catch (error) {
    const reason = error instanceof AiNotConfiguredError ? "chua-cau-hinh" : "loi";
    redirect(`/quan-tri/khach-hang?error=${reason}`);
  }

  revalidatePath("/quan-tri/khach-hang");
  redirect("/quan-tri/khach-hang?generated=1");
}

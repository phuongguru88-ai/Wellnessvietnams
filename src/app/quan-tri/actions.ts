"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE } from "@/lib/auth";

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/quan-tri/dang-nhap");
}

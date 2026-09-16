"use server";

import { toggleLeadContacted } from "@/lib/leads";
import { getActor } from "@/lib/scope";

export async function toggleContactedAction(id: string) {
  const actor = await getActor();
  if (actor?.role !== "admin") return;

  await toggleLeadContacted(id);
}

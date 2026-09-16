"use server";

import { listBookings, setBookingStatus } from "@/lib/bookings";
import { getActor, ownsProperty } from "@/lib/scope";
import type { BookingStatus } from "@/lib/types";

export async function setBookingStatusAction(id: string, status: BookingStatus) {
  const actor = await getActor();
  if (!actor) return;

  const booking = (await listBookings()).find((b) => b.id === id);
  if (!booking || !ownsProperty(actor, booking.propertyId)) return;

  await setBookingStatus(id, status);
}

import { supabase } from "./supabase";

interface ReservationEmailData {
  name: string;
  email: string;
  phone?: string;
  guests: number;
  date: string;
  time?: string;
  special_requests?: string;
}

export async function sendReservationEmail(
  type: "received" | "confirmed" | "declined",
  reservation: ReservationEmailData
) {
  try {
    const { error } = await supabase.functions.invoke("send-reservation-email", {
      body: { type, reservation },
    });
    if (error) console.error("Email send error:", error);
  } catch (e) {
    // Non-blocking: email failure should never break the UI
    console.error("Email send failed:", e);
  }
}

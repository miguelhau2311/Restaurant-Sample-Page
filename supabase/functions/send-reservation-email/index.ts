import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESTAURANT_EMAIL = Deno.env.get("RESTAURANT_EMAIL") || "restaurant@example.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Gourmet Haven <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationData {
  name: string;
  email: string;
  phone?: string;
  guests: number;
  date: string;
  time?: string;
  special_requests?: string;
}

function receivedEmail(r: ReservationData): { subject: string; html: string } {
  return {
    subject: "We received your reservation — Gourmet Haven",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;">Reservation Received</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for choosing Gourmet Haven</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">Hi <strong>${r.name}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        We have received your reservation request. Our team will review it and you'll receive a confirmation email shortly.
      </p>
      <div style="background:#fff7ed;border-radius:12px;padding:20px;border:1px solid #fed7aa;">
        <h3 style="margin:0 0 16px;color:#9a3412;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Reservation Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;width:100px;">Date</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.date}</td></tr>
          ${r.time ? `<tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Time</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.time}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Guests</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.guests}</td></tr>
          ${r.special_requests ? `<tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;vertical-align:top;">Notes</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${r.special_requests}</td></tr>` : ""}
        </table>
      </div>
      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
        If you need to make changes, please contact us directly.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Gourmet Haven · Musterstrasse 123 · 1234 Vienna</p>
    </div>
  </div>
</body></html>`,
  };
}

function confirmedEmail(r: ReservationData): { subject: string; html: string } {
  return {
    subject: "Your reservation is confirmed! — Gourmet Haven",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:32px;text-align:center;">
      <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 12px;line-height:48px;font-size:24px;">✓</div>
      <h1 style="margin:0;color:#fff;font-size:24px;">Reservation Confirmed</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">We look forward to seeing you!</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">Hi <strong>${r.name}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        Great news! Your reservation has been <strong style="color:#16a34a;">confirmed</strong>. We're looking forward to welcoming you.
      </p>
      <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;">
        <h3 style="margin:0 0 16px;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Your Reservation</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;width:100px;">Date</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.date}</td></tr>
          ${r.time ? `<tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Time</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.time}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Guests</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.guests}</td></tr>
        </table>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Gourmet Haven · Musterstrasse 123 · 1234 Vienna</p>
    </div>
  </div>
</body></html>`,
  };
}

function declinedEmail(r: ReservationData): { subject: string; html: string } {
  return {
    subject: "Reservation update — Gourmet Haven",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;">Reservation Declined</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">We're sorry for the inconvenience</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">Hi <strong>${r.name}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        Unfortunately, we are unable to accommodate your reservation for the requested date and time. We apologize for the inconvenience.
      </p>
      <div style="background:#fef2f2;border-radius:12px;padding:20px;border:1px solid #fecaca;">
        <h3 style="margin:0 0 16px;color:#991b1b;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Requested Reservation</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;width:100px;">Date</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${r.date}</td></tr>
          ${r.time ? `<tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Time</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${r.time}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Guests</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${r.guests}</td></tr>
        </table>
      </div>
      <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
        Please feel free to try a different date or contact us directly and we'll do our best to find a suitable time for you.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Gourmet Haven · Musterstrasse 123 · 1234 Vienna</p>
    </div>
  </div>
</body></html>`,
  };
}

function newReservationNotification(r: ReservationData): { subject: string; html: string } {
  return {
    subject: `New reservation: ${r.name} — ${r.date}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:20px;">New Reservation Request</h1>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;width:110px;">Name</td><td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.name}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Email</td><td style="padding:8px 0;color:#1f2937;font-size:14px;">${r.email}</td></tr>
        ${r.phone ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Phone</td><td style="padding:8px 0;color:#1f2937;font-size:14px;">${r.phone}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Date</td><td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.date}</td></tr>
        ${r.time ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Time</td><td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.time}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Guests</td><td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600;">${r.guests}</td></tr>
        ${r.special_requests ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;vertical-align:top;">Notes</td><td style="padding:8px 0;color:#1f2937;font-size:14px;">${r.special_requests}</td></tr>` : ""}
      </table>
      <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">Log in to the admin dashboard to confirm or decline this reservation.</p>
    </div>
  </div>
</body></html>`,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, reservation } = (await req.json()) as {
      type: "received" | "confirmed" | "declined";
      reservation: ReservationData;
    };

    const emails: { to: string; subject: string; html: string }[] = [];

    if (type === "received") {
      const received = receivedEmail(reservation);
      emails.push({ to: reservation.email, ...received });

      const notify = newReservationNotification(reservation);
      emails.push({ to: RESTAURANT_EMAIL, ...notify });
    } else if (type === "confirmed") {
      const confirmed = confirmedEmail(reservation);
      emails.push({ to: reservation.email, ...confirmed });
    } else if (type === "declined") {
      const declined = declinedEmail(reservation);
      emails.push({ to: reservation.email, ...declined });
    }

    const results = await Promise.allSettled(
      emails.map((email) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email.to,
            subject: email.subject,
            html: email.html,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Resend error: ${res.status} ${text}`);
          }
          return res.json();
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error("Some emails failed:", failed);
    }

    return new Response(
      JSON.stringify({ success: true, sent: emails.length - failed.length, failed: failed.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

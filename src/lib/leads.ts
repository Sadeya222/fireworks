import { LEAD_EMAIL, LEAD_ENDPOINT } from "./data";

/* ====================================================================
   Lead routing — a single seam between the intake form and whatever
   backend ships with the site.

   · LEAD_ENDPOINT set  → real JSON POST (Formspree / Resend / custom API)
   · LEAD_ENDPOINT empty → high-fidelity simulation: realistic latency,
     a receipt ID, local persistence for demo continuity, console echo.
   ==================================================================== */

export interface LeadPayload {
  name: string;
  phone: string;
  email: string;
  eventDate: string; // ISO yyyy-mm-dd
  venueSize: string;
  message: string;
}

export interface LeadReceipt {
  id: string;
  receivedAt: string; // ISO timestamp
  payload: LeadPayload;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Human-readable receipt id, e.g. CF-26-K7Q4X */
function receiptId(): string {
  const yy = String(new Date().getFullYear()).slice(-2);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CF-${yy}-${rand}`;
}

/** Submit a lead. Resolves with a receipt; rejects on hard failure. */
export async function submitLead(payload: LeadPayload): Promise<LeadReceipt> {
  const receipt: LeadReceipt = { id: receiptId(), receivedAt: new Date().toISOString(), payload };

  if (LEAD_ENDPOINT) {
    const res = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, receiptId: receipt.id, source: "classicfireworks.com" }),
    });
    if (!res.ok) throw new Error(`Lead endpoint responded ${res.status}`);
    return receipt;
  }

  // ---- Simulated API round-trip -----------------------------------
  await wait(1400 + Math.random() * 600);
  try {
    const key = "cf.leads";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as LeadReceipt[];
    localStorage.setItem(key, JSON.stringify([receipt, ...prev].slice(0, 20)));
  } catch {
    /* storage unavailable (private mode) — non-fatal */
  }
  console.info("[Classic Fireworks] Lead captured →", receipt);
  return receipt;
}

export const prettyDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

/** Pre-composed mailto: hand-off (used for "email a copy" and as a hard fallback). */
export function buildMailto(payload: LeadPayload, id?: string): string {
  const subject = `Quote Request${id ? ` ${id}` : ""} — ${payload.venueSize || "Display"} — ${prettyDate(payload.eventDate)}`;
  const body = [
    "New quote request via classicfireworks.com",
    "----------------------------------------",
    id ? `Receipt:      ${id}` : null,
    `Full Name:    ${payload.name}`,
    `Phone:        ${payload.phone}`,
    `Email:        ${payload.email}`,
    `Event Date:   ${prettyDate(payload.eventDate)}`,
    `Venue Size:   ${payload.venueSize}`,
    "",
    "Message:",
    payload.message.trim() || "—",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Check, Loader2, Send } from "lucide-react";
import SuccessModal from "./SuccessModal";
import { VENUE_SIZES } from "../lib/data";
import { buildMailto, submitLead, type LeadPayload, type LeadReceipt } from "../lib/leads";
import { cn } from "../utils/cn";

/* ====================================================================
   IntakeForm — high-converting lead capture.

   · Every field validated client-side with real-time feedback
     (red border + inline message once a field is touched or on submit)
   · Submit handler simulates an API round-trip (or POSTs to a real
     endpoint when configured), shows a glowing golden success modal,
     and resets the form state
   · Honeypot field silently drops bots
   ==================================================================== */

type FieldName = "name" | "phone" | "email" | "date" | "venue" | "message";
type FormValues = Record<FieldName, string>;

const FIELDS: FieldName[] = ["name", "phone", "email", "date", "venue", "message"];
const INITIAL: FormValues = { name: "", phone: "", email: "", date: "", venue: "", message: "" };
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

/** Returns `true` when valid, otherwise the message to display. */
function validate(field: FieldName, raw: string): true | string {
  const v = raw.trim();
  switch (field) {
    case "name":
      if (!v) return "Full name is required.";
      if (v.length < 2) return "Please enter your full name.";
      if (!/^[\p{L}][\p{L}\p{M}'’.\- ]*$/u.test(v)) return "Letters, spaces and hyphens only.";
      return true;
    case "phone": {
      if (!v) return "Phone number is required.";
      const digits = v.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) return "Enter a valid phone number (10–15 digits).";
      return true;
    }
    case "email":
      if (!v) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
      return true;
    case "date": {
      if (!v) return "Select an event date.";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return "Enter a valid date.";
      if (d.getTime() < today.getTime()) return "The event date must be today or later.";
      return true;
    }
    case "venue":
      return v !== "" || "Select a venue size.";
    case "message":
      if (!v) return "Tell us a little about the occasion.";
      if (v.length < MESSAGE_MIN) return `Please add at least ${MESSAGE_MIN} characters.`;
      if (v.length > MESSAGE_MAX) return `Please keep it under ${MESSAGE_MAX} characters.`;
      return true;
  }
}

/** Light phone formatting for US-style numbers; leaves intl input alone. */
function formatPhone(raw: string): string {
  if (raw.trim().startsWith("+")) return raw;
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/* ------------------------------------------------------------------ */
/* Field wrapper — label + animated inline error                      */
/* ------------------------------------------------------------------ */
function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-200/70">
          {label} <span className="text-crimson-400">*</span>
        </label>
        {hint && !error ? <span className="text-[11px] text-ivory/35">{hint}</span> : null}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={`${htmlFor}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 flex items-center gap-1.5 text-[12px] text-crimson-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */
export default function IntakeForm() {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<LeadReceipt | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const toastTimer = useRef<number | null>(null);

  /* Derived, real-time validation — recomputed on every keystroke */
  const errors = useMemo(() => {
    const out: Partial<Record<FieldName, string>> = {};
    for (const f of FIELDS) {
      const res = validate(f, values[f]);
      if (res !== true) out[f] = res;
    }
    return out;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (f: FieldName) => (touched[f] || submittedOnce ? errors[f] : undefined);
  const invalidProps = (f: FieldName) => ({
    "aria-invalid": !!showError(f),
    "aria-describedby": showError(f) ? `cf-${f}-error` : undefined,
    className: cn("field", showError(f) && "field-invalid"),
  });

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  }, []);

  const set = (f: FieldName) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = f === "phone" ? formatPhone(e.target.value) : e.target.value;
    setValues((prev) => ({ ...prev, [f]: v }));
  };
  const blur = (f: FieldName) => () => setTouched((t) => ({ ...t, [f]: true }));

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  };

  const closeModal = useCallback(() => setReceipt(null), []);

  /* ------------------------------------------------------------ */
  /* Submit — validate → simulate API → success modal → reset      */
  /* ------------------------------------------------------------ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedOnce(true);

    if (!isValid) {
      const invalid = FIELDS.filter((f) => errors[f]);
      formRef.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      showToast(`Please correct ${invalid.length} highlighted field${invalid.length > 1 ? "s" : ""}.`);
      return;
    }
    if (honeypot) return; // bot — silently drop

    const payload: LeadPayload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      eventDate: values.date,
      venueSize: values.venue,
      message: values.message.trim(),
    };

    setStatus("sending");
    try {
      const rec = await submitLead(payload);
      // Reset form state, then celebrate
      setValues(INITIAL);
      setTouched({});
      setSubmittedOnce(false);
      setReceipt(rec);
    } catch {
      // Hard failure (endpoint down) → hand off to the visitor's mail client
      showToast("Our server is busy — opening your email client instead.");
      window.location.href = buildMailto(payload);
    } finally {
      setStatus("idle");
    }
  }

  const msgLen = values.message.trim().length;

  return (
    <div className="relative">
      {/* Gilded corner brackets */}
      {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((pos) => (
        <span key={pos} className={cn("pointer-events-none absolute h-5 w-5 border-gold-400/70", pos)} aria-hidden="true" />
      ))}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 p-6 md:p-9"
        aria-label="Quote request form"
        aria-busy={status === "sending"}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="cf-name" error={showError("name")}>
            <input
              id="cf-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alexander Hale"
              value={values.name}
              onChange={set("name")}
              onBlur={blur("name")}
              {...invalidProps("name")}
            />
          </Field>
          <Field label="Phone Number" htmlFor="cf-phone" error={showError("phone")}>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(312) 555-0134"
              value={values.phone}
              onChange={set("phone")}
              onBlur={blur("phone")}
              {...invalidProps("phone")}
            />
          </Field>
        </div>

        <Field label="Email" htmlFor="cf-email" error={showError("email")}>
          <input
            id="cf-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={set("email")}
            onBlur={blur("email")}
            {...invalidProps("email")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event Date" htmlFor="cf-date" error={showError("date")}>
            <input
              id="cf-date"
              name="date"
              type="date"
              min={todayISO}
              value={values.date}
              onChange={set("date")}
              onBlur={blur("date")}
              {...invalidProps("date")}
            />
          </Field>
          <Field label="Venue Size" htmlFor="cf-venue" error={showError("venue")}>
            <select
              id="cf-venue"
              name="venue"
              value={values.venue}
              onChange={(e) => {
                set("venue")(e);
                setTouched((t) => ({ ...t, venue: true }));
              }}
              onBlur={blur("venue")}
              {...invalidProps("venue")}
              className={cn("field field-select", showError("venue") && "field-invalid")}
            >
              <option value="" disabled>
                Select venue size…
              </option>
              {VENUE_SIZES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Message"
          htmlFor="cf-message"
          error={showError("message")}
          hint={
            <span className={cn(msgLen > MESSAGE_MAX && "text-crimson-400")}>
              {msgLen} / {MESSAGE_MAX}
            </span>
          }
        >
          <textarea
            id="cf-message"
            name="message"
            rows={4}
            maxLength={MESSAGE_MAX + 50}
            placeholder="Tell us about the occasion, your palette, your music — or just the dream."
            value={values.message}
            onChange={set("message")}
            onBlur={blur("message")}
            {...invalidProps("message")}
            className={cn("field resize-none", showError("message") && "field-invalid")}
          />
        </Field>

        {/* Honeypot — hidden from humans, irresistible to bots */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[11px] text-ivory/40">
            <Check className="h-3.5 w-3.5 text-gold-400/80" />
            Replies within 4 business hours · <span className="text-crimson-400">*</span> required
          </p>
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-gold inline-flex min-h-[48px] items-center justify-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.28em] disabled:cursor-wait disabled:opacity-80"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Transmitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Request My Quote
              </>
            )}
          </button>
        </div>
      </form>

      {/* Validation toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-x-4 -bottom-16 z-10 mx-auto flex max-w-md items-center gap-3 border border-crimson-500/60 bg-obsidian-950/95 px-4 py-3 text-[13px] text-ivory shadow-[0_10px_40px_-12px_rgba(154,27,30,0.7)] backdrop-blur-md sm:inset-x-auto sm:right-6"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-crimson-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden success modal (portal) */}
      <SuccessModal receipt={receipt} onClose={closeModal} />
    </div>
  );
}

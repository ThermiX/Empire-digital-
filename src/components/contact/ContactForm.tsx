"use client";

import { CircleAlert, CircleCheck, Info, LoaderCircle, Send } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { cn } from "@/lib/cn";
import {
  CONTACT_FIELDS,
  CONTACT_SUBJECTS,
  MESSAGE_MAX,
  submitContact,
  validateContact,
  validateField,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact";
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from "@/lib/storage";

const EMPTY: ContactValues = { name: "", email: "", phone: "", subject: "", message: "", consent: false };
const LABELS: Record<keyof ContactValues, string> = {
  name: "Nom complet",
  email: "Adresse e-mail",
  phone: "Téléphone",
  subject: "Sujet",
  message: "Message",
  consent: "Consentement",
};

type Status = "idle" | "submitting" | "success";

function loadDraft(): ContactValues {
  const r = readJSON(STORAGE_KEYS.contactDraft, (raw) =>
    raw && typeof raw === "object" ? ({ ...EMPTY, ...(raw as Partial<ContactValues>), consent: false } as ContactValues) : null,
  );
  return r.ok ? r.value : EMPTY;
}

export function ContactForm() {
  const uid = useId();
  const { toast } = useToast();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactValues, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState(false);
  const [firstName, setFirstName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const draftLoaded = useRef(false);
  const shouldReset = useRef(false);

  // Restaure le brouillon après l'hydratation (le rendu serveur reste vide).
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = loadDraft();
    // Lecture d'un système externe (localStorage) après hydratation : volontaire.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (draft !== EMPTY) setValues(draft);
  }, []);

  // Sauvegarde du brouillon (sans le consentement).
  useEffect(() => {
    if (!draftLoaded.current || status === "success") return;
    const t = window.setTimeout(() => {
      const { consent: _consent, ...draft } = values;
      void _consent;
      writeJSON(STORAGE_KEYS.contactDraft, draft);
    }, 400);
    return () => window.clearTimeout(t);
  }, [values, status]);

  // Réinitialise un message de succès périmé quand la page est masquée.
  useLayoutEffect(() => {
    return () => {
      if (shouldReset.current) {
        shouldReset.current = false;
        setStatus("idle");
      }
    };
  }, []);

  function set<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || summary) setErrors((e) => ({ ...e, [key]: validateField(key, next) }));
  }

  function blur(key: keyof ContactValues) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateField(key, values) }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const data = new FormData(event.currentTarget);
    if (data.get("site_web")) return; // pot de miel anti-robots

    const found = validateContact(values);
    setErrors(found);
    setTouched(Object.fromEntries(CONTACT_FIELDS.map((k) => [k, true])));
    if (Object.keys(found).length > 0) {
      setSummary(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSummary(false);
    setStatus("submitting");
    try {
      const result = await submitContact(values);
      if (!result.ok) {
        setErrors(result.errors);
        setSummary(true);
        setStatus("idle");
        return;
      }
      setFirstName(values.name.trim().split(/\s+/)[0] ?? "");
      setValues(EMPTY);
      setTouched({});
      removeKey(STORAGE_KEYS.contactDraft);
      setStatus("success");
      shouldReset.current = true;
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("idle");
      toast({ tone: "error", title: "Une erreur est survenue", description: "Votre message n’a pas pu être traité. Réessayez." });
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-[1.75rem] border border-line bg-white p-7 shadow-card outline-none sm:p-10"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-ink text-neon">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <h2 className="mt-6 text-display-md font-semibold">Merci{firstName ? `, ${firstName}` : ""} ! Votre message est prêt.</h2>
        <p className="mt-3 leading-relaxed text-muted">Toutes les informations ont été vérifiées avec succès.</p>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-ink">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <strong>Version de démonstration :</strong> l’envoi des messages vers notre équipe n’est pas encore activé.
            Aucune donnée n’a quitté votre appareil.
          </p>
        </div>
        <Button variant="dark" className="mt-8" onClick={() => setStatus("idle")}>
          Écrire un autre message
        </Button>
      </div>
    );
  }

  const errorList = CONTACT_FIELDS.filter((k) => errors[k]);
  const fieldId = (k: keyof ContactValues) => `${uid}-${k}`;
  const describedBy = (k: keyof ContactValues, extra?: string) =>
    [errors[k] && touched[k] ? `${fieldId(k)}-erreur` : null, extra].filter(Boolean).join(" ") || undefined;

  const fieldError = (k: keyof ContactValues) =>
    errors[k] && touched[k] ? (
      <p id={`${fieldId(k)}-erreur`} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger-ink">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        {errors[k]}
      </p>
    ) : null;

  const invalid = (k: keyof ContactValues) => Boolean(errors[k] && touched[k]);
  const remaining = MESSAGE_MAX - values.message.length;

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={`${uid}-titre`} className="rounded-[1.75rem] border border-line bg-white p-6 shadow-card sm:p-9">
      <h2 id={`${uid}-titre`} className="text-display-md font-semibold">
        Envoyer un message
      </h2>
      <p className="mt-2 text-sm text-muted">
        Les champs marqués d’un <span aria-hidden>*</span>
        <span className="sr-only">astérisque</span> sont obligatoires. Votre brouillon est conservé sur cet appareil.
      </p>

      {summary && errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-2xl border border-danger-ink/30 bg-danger-soft p-4 text-sm text-danger-ink outline-none"
        >
          <p className="font-bold">
            {errorList.length === 1 ? "Un champ est à corriger :" : `${errorList.length} champs sont à corriger :`}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#${fieldId(k)}`} className="underline underline-offset-2">
                  {LABELS[k]} : {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("name")} className="text-sm font-semibold">
            Nom complet <span aria-hidden className="text-danger-ink">*</span>
          </label>
          <input
            id={fieldId("name")}
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={invalid("name")}
            aria-describedby={describedBy("name")}
            className="field-input mt-2"
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className="text-sm font-semibold">
            Adresse e-mail <span aria-hidden className="text-danger-ink">*</span>
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={invalid("email")}
            aria-describedby={describedBy("email")}
            className="field-input mt-2"
          />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor={fieldId("phone")} className="text-sm font-semibold">
            Téléphone <span className="font-normal text-subtle">(facultatif)</span>
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+225 07 00 00 00 00"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={invalid("phone")}
            aria-describedby={describedBy("phone")}
            className="field-input mt-2"
          />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor={fieldId("subject")} className="text-sm font-semibold">
            Sujet <span aria-hidden className="text-danger-ink">*</span>
          </label>
          <select
            id={fieldId("subject")}
            name="subject"
            required
            value={values.subject}
            onChange={(e) => set("subject", e.target.value as ContactValues["subject"])}
            onBlur={() => blur("subject")}
            aria-invalid={invalid("subject")}
            aria-describedby={describedBy("subject")}
            className={cn("field-input mt-2 appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", !values.subject && "text-subtle")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234A6354' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Choisir un sujet…</option>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {fieldError("subject")}
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={fieldId("message")} className="text-sm font-semibold">
              Message <span aria-hidden className="text-danger-ink">*</span>
            </label>
            <span id={`${fieldId("message")}-compteur`} className={cn("text-xs tabular-nums", remaining < 0 ? "font-bold text-danger-ink" : "text-subtle")}>
              {values.message.length} / {MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id={fieldId("message")}
            name="message"
            required
            rows={6}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => blur("message")}
            aria-invalid={invalid("message")}
            aria-describedby={describedBy("message", `${fieldId("message")}-compteur`)}
            className="field-input mt-2 resize-y"
          />
          {fieldError("message")}
        </div>
      </div>

      {/* Pot de miel : invisible pour les humains. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Site web
          <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            id={fieldId("consent")}
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            onBlur={() => blur("consent")}
            aria-invalid={invalid("consent")}
            aria-describedby={describedBy("consent")}
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[#124E30]"
          />
          <span>
            J’accepte que mes informations soient utilisées uniquement pour répondre à ma demande.{" "}
            <span aria-hidden className="text-danger-ink">*</span>
          </span>
        </label>
        {fieldError("consent")}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          size="lg"
          variant="dark"
          disabled={status === "submitting"}
          icon={status === "submitting" ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        >
          {status === "submitting" ? "Vérification…" : "Envoyer le message"}
        </Button>
        <p className="text-xs text-subtle">Démo : aucun message n’est transmis à un serveur.</p>
      </div>
    </form>
  );
}

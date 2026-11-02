export const CONTACT_SUBJECTS = [
  { value: "question", label: "Question générale" },
  { value: "simulateur", label: "Le simulateur de budget" },
  { value: "academie", label: "L’Académie et les contenus" },
  { value: "ressources", label: "Les guides et ressources" },
  { value: "partenariat", label: "Partenariat ou entreprise" },
  { value: "presse", label: "Presse" },
  { value: "probleme", label: "Signaler un problème" },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject | "";
  message: string;
  consent: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Numéro international ou local : chiffres, espaces, points, tirets, « + » initial. 8 à 15 chiffres.
const PHONE_RE = /^\+?[\d\s.\-()]+$/;

export function validateField<K extends keyof ContactValues>(key: K, values: ContactValues): string | undefined {
  switch (key) {
    case "name": {
      const v = values.name.trim();
      if (!v) return "Indiquez votre nom.";
      if (v.length < 2) return "Votre nom doit contenir au moins 2 caractères.";
      if (v.length > 80) return "Votre nom ne doit pas dépasser 80 caractères.";
      return undefined;
    }
    case "email": {
      const v = values.email.trim();
      if (!v) return "Indiquez votre adresse e-mail.";
      if (!EMAIL_RE.test(v)) return "Cette adresse e-mail ne semble pas valide (exemple : nom@domaine.com).";
      return undefined;
    }
    case "phone": {
      const v = values.phone.trim();
      if (!v) return undefined;
      const digits = v.replace(/\D/g, "");
      if (!PHONE_RE.test(v) || digits.length < 8 || digits.length > 15)
        return "Numéro invalide. Exemple : +221 77 123 45 67.";
      return undefined;
    }
    case "subject":
      return values.subject ? undefined : "Choisissez un sujet.";
    case "message": {
      const v = values.message.trim();
      if (!v) return "Écrivez votre message.";
      if (v.length < MESSAGE_MIN) return `Votre message doit contenir au moins ${MESSAGE_MIN} caractères.`;
      if (v.length > MESSAGE_MAX) return `Votre message ne doit pas dépasser ${MESSAGE_MAX} caractères.`;
      return undefined;
    }
    case "consent":
      return values.consent ? undefined : "Votre accord est nécessaire pour traiter votre demande.";
  }
  return undefined;
}

export const CONTACT_FIELDS: Array<keyof ContactValues> = ["name", "email", "phone", "subject", "message", "consent"];

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const key of CONTACT_FIELDS) {
    const error = validateField(key, values);
    if (error) errors[key] = error;
  }
  return errors;
}

/**
 * Point d'intégration unique pour un futur service d'envoi (API, e-mail…).
 * Aujourd'hui, aucune donnée ne quitte le navigateur : la fonction valide
 * puis simule le délai réseau, et l'interface l'indique clairement.
 */
export async function submitContact(values: ContactValues): Promise<{ ok: true; delivered: false } | { ok: false; errors: ContactErrors }> {
  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true, delivered: false };
}

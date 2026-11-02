import { describe, expect, it } from "vitest";
import { validateContact, validateField, type ContactValues } from "./contact";

const valid: ContactValues = {
  name: "Awa Diop",
  email: "awa@example.com",
  phone: "+221 77 123 45 67",
  subject: "question",
  message: "Bonjour, je voudrais savoir comment utiliser le simulateur.",
  consent: true,
};

describe("validation du formulaire de contact", () => {
  it("accepte un formulaire valide", () => {
    expect(validateContact(valid)).toEqual({});
    expect(validateContact({ ...valid, phone: "" })).toEqual({});
  });

  it("signale chaque champ invalide", () => {
    const errors = validateContact({ name: " ", email: "awa@", phone: "12", subject: "", message: "court", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "message", "name", "phone", "subject"]);
  });

  it("valide les e-mails et téléphones", () => {
    expect(validateField("email", { ...valid, email: "nom@domaine" })).toBeDefined();
    expect(validateField("email", { ...valid, email: "nom.prenom@domaine.ci" })).toBeUndefined();
    expect(validateField("phone", { ...valid, phone: "07 08 09 10 11" })).toBeUndefined();
    expect(validateField("phone", { ...valid, phone: "abc12345678" })).toBeDefined();
  });

  it("limite la longueur du message", () => {
    expect(validateField("message", { ...valid, message: "x".repeat(1001) })).toBeDefined();
  });
});

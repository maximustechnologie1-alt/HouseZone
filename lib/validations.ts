import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  acceptTerms: z
    .string()
    .refine((v) => v === "on", { message: "Vous devez accepter les conditions d'utilisation" }),
});

export const signInSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "8 caractères minimum"),
});

export const hostApplicationSchema = z.object({
  hostType: z.enum(["proprietaire", "agence", "demarcheur", "gestionnaire"]),
  companyName: z.string().optional(),
  legalForm: z.string().optional(),
  registrationNumber: z.string().optional(),
  age: z.coerce.number().optional(),
  bio: z.string().max(1000).optional(),
});

export const listingSchema = z.object({
  title: z.string().min(5, "Titre trop court").max(120),
  description: z.string().min(20, "Décrivez le bien en quelques phrases"),
  categoryId: z.uuid("Choisissez un type de bien"),
  operationType: z.enum(["location", "vente", "reservation"]),
  price: z.coerce.number().positive("Le prix doit être positif"),
  cityId: z.uuid("Choisissez une ville"),
  neighborhoodId: z.uuid().optional().or(z.literal("")),
  address: z.string().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  surfaceM2: z.coerce.number().positive().optional(),
  furnished: z.string().optional(),
});

export const visitRequestSchema = z.object({
  requestedDate: z.string().min(1, "Choisissez une date"),
  requestedTime: z.string().min(1, "Choisissez une heure"),
  message: z.string().max(500).optional(),
});

export const searchAlertSchema = z.object({
  categoryId: z.uuid().optional().or(z.literal("")),
  cityId: z.uuid().optional().or(z.literal("")),
  neighborhoodId: z.uuid().optional().or(z.literal("")),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
  characteristics: z.string().max(300).optional(),
  description: z.string().min(10, "Décrivez ce que vous recherchez").max(600),
});

export const reportSchema = z.object({
  targetType: z.enum(["listing", "user", "message", "search_alert"]),
  targetId: z.string().min(1),
  reason: z.string().min(1, "Choisissez un motif"),
  comment: z.string().max(500).optional(),
});

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(8),
  language: z.string().min(2),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message vide").max(2000),
});

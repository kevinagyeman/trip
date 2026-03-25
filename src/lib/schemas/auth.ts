import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const registerSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerCompanySchema = z
	.object({
		companyName: z.string().min(1, "Company name is required"),
		slug: z
			.string()
			.min(1, "Slug is required")
			.regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
		vat: z.string().min(1, "VAT number is required"),
		address: z.string().min(1, "Address is required"),
		country: z.string().min(1, "Country is required"),
		website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
		fullName: z.string().min(1, "Full name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		privacyAccepted: z.literal(true, {
			errorMap: () => ({ message: "You must accept the privacy policy" }),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

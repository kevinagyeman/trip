import { z } from "zod";

export const createTripRequestSchema = z
	.object({
		routes: z
			.array(
				z.object({
					pickup: z.string().min(1, "Pickup address is required"),
					destination: z.string().min(1, "Destination is required"),
					departureDate: z.string().optional(),
					departureTime: z.string().optional(),
					flightNumber: z.string().optional(),
				}),
			)
			.min(1, "At least one route is required"),
		language: z.enum(["en", "it"]),
		email: z.string().email("Valid email is required"),
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		phoneCountryCode: z.string().min(1, "Country code is required"),
		phoneNumber: z.string().min(1, "Phone number is required"),
		numberOfAdults: z.coerce.number().int().min(1, "At least 1 adult required"),
		areThereChildren: z.boolean(),
		numberOfChildren: z.coerce.number().int().min(0).optional(),
		childrenAges: z
			.array(
				z.object({
					age: z.string().min(1, "Age is required"),
					unit: z.enum(["years", "months", "days"]),
				}),
			)
			.optional(),
		numberOfChildSeats: z.coerce.number().int().min(0).optional(),
		additionalInfo: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.areThereChildren && !data.numberOfChildren) {
			ctx.addIssue({
				path: ["numberOfChildren"],
				code: z.ZodIssueCode.custom,
				message: "Number of children must be at least 1",
			});
		}
		if (data.areThereChildren && data.numberOfChildren) {
			const count = Number(data.numberOfChildren);
			for (let i = 0; i < count; i++) {
				if (!data.childrenAges?.[i]?.age?.trim()) {
					ctx.addIssue({
						path: ["childrenAges", i, "age"],
						code: z.ZodIssueCode.custom,
						message: "Age is required",
					});
				}
			}
		}
	});

export type CreateTripRequestFormValues = z.infer<
	typeof createTripRequestSchema
>;

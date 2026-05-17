import { z } from "zod";

export const quotationSchema = z.object({
	price: z.coerce
		.number({ invalid_type_error: "Price is required" })
		.positive("Price must be greater than 0"),
	currency: z.string(),
	priceType: z.enum(["each_way", "not_each_way"], {
		required_error: "Select price type",
	}),
	carSeatsStatus: z.enum(["included", "not_included", "not_applicable"], {
		required_error: "Select car seats option",
	}),
	additionalInfo: z.string().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;

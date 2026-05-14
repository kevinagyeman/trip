import { z } from "zod";

export const quotationSchema = z.object({
	price: z.coerce
		.number({ invalid_type_error: "Price is required" })
		.positive("Price must be greater than 0"),
	currency: z.string(),
	isPriceEachWay: z.boolean(),
	areCarSeatsIncluded: z.boolean(),
	additionalInfo: z.string().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;

import { z } from "zod";

export const createQuotationSchema = z.object({
	price: z.coerce
		.number({ invalid_type_error: "Price is required" })
		.positive("Price must be greater than 0"),
	isPriceEachWay: z.boolean(),
	areCarSeatsIncluded: z.boolean(),
	quotationAdditionalInfo: z.string().optional(),
	internalNotes: z.string().optional(),
});

export type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>;

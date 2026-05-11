import { z } from "zod";

export const driverSchema = z.object({
	name: z.string().min(1),
	surname: z.string().min(1),
	phoneCountryCode: z.string().min(1),
	phoneNumber: z.string().min(1),
	email: z.string().email(),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

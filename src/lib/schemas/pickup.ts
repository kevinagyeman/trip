import { z } from "zod";

export const pickupSchema = z.object({
	meetingPoint: z.string().min(1, "Required"),
	beThereAtDate: z.string().min(1, "Required"),
	beThereAtTime: z.string().min(1, "Required"),
	driverName: z.string().min(1, "Required"),
	driverPhoneCountryCode: z.string().min(1, "Required"),
	driverPhone: z.string().min(1, "Required"),
	additionalInfo: z.string(),
});

export type PickupFormValues = z.infer<typeof pickupSchema>;

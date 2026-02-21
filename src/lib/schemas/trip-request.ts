import { z } from "zod";

export const createTripRequestSchema = z
	.object({
		serviceType: z.enum(["both", "arrival", "departure"]),
		// Arrival
		arrivalAirport: z.string().optional(),
		destinationAddress: z.string().optional(),
		// Departure
		pickupAddress: z.string().optional(),
		departureAirport: z.string().optional(),
		// Travel info
		language: z.enum(["English", "Italian"]),
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		phone: z.string().min(1, "Phone number is required"),
		numberOfAdults: z.coerce.number().int().min(1, "At least 1 adult required"),
		areThereChildren: z.boolean(),
		numberOfChildren: z.coerce.number().int().min(0).optional(),
		ageOfChildren: z.string().optional(),
		numberOfChildSeats: z.coerce.number().int().min(0).optional(),
		additionalInfo: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.serviceType === "both" || data.serviceType === "arrival") {
			if (!data.arrivalAirport) {
				ctx.addIssue({
					path: ["arrivalAirport"],
					code: z.ZodIssueCode.custom,
					message: "Arrival airport is required",
				});
			}
			if (!data.destinationAddress) {
				ctx.addIssue({
					path: ["destinationAddress"],
					code: z.ZodIssueCode.custom,
					message: "Destination address is required",
				});
			}
		}
		if (data.serviceType === "both" || data.serviceType === "departure") {
			if (!data.pickupAddress) {
				ctx.addIssue({
					path: ["pickupAddress"],
					code: z.ZodIssueCode.custom,
					message: "Pickup address is required",
				});
			}
			if (!data.departureAirport) {
				ctx.addIssue({
					path: ["departureAirport"],
					code: z.ZodIssueCode.custom,
					message: "Departure airport is required",
				});
			}
		}
	});

export const confirmTripSchema = z.object({
	arrivalFlightDate: z.date().optional(),
	arrivalFlightTime: z.string().optional(),
	arrivalFlightNumber: z.string().optional(),
	departureFlightDate: z.date().optional(),
	departureFlightTime: z.string().optional(),
	departureFlightNumber: z.string().optional(),
});

export type CreateTripRequestFormValues = z.infer<typeof createTripRequestSchema>;
export type ConfirmTripFormValues = z.infer<typeof confirmTripSchema>;

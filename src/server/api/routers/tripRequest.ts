import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
	createTRPCRouter,
	protectedProcedure,
	adminProcedure,
} from "@/server/api/trpc";
import { TripRequestStatus } from "../../../../generated/prisma";

export const tripRequestRouter = createTRPCRouter({
	// USER: Create new trip request
	create: protectedProcedure
		.input(
			z.object({
				serviceType: z.enum(["both", "arrival", "departure"]),
				// Arrival info
				arrivalAirport: z.string().optional(),
				destinationAddress: z.string().optional(),
				arrivalFlightDate: z.date().optional(),
				arrivalFlightTime: z.string().optional(),
				arrivalFlightNumber: z.string().optional(),
				// Departure info
				pickupAddress: z.string().optional(),
				departureAirport: z.string().optional(),
				departureFlightDate: z.date().optional(),
				departureFlightTime: z.string().optional(),
				departureFlightNumber: z.string().optional(),
				// Travel info
				language: z.enum(["English", "Italian"]),
				firstName: z.string().min(1),
				lastName: z.string().min(1),
				phone: z.string().min(1),
				numberOfAdults: z.number().int().min(1),
				areThereChildren: z.boolean(),
				numberOfChildren: z.number().int().optional(),
				ageOfChildren: z.string().optional(),
				numberOfChildSeats: z.number().int().optional(),
				additionalInfo: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Validate arrival fields if service includes arrival
			if (input.serviceType === "both" || input.serviceType === "arrival") {
				if (!input.arrivalAirport || !input.destinationAddress) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Arrival airport and destination address are required for arrival service",
					});
				}
			}

			// Validate departure fields if service includes departure
			if (input.serviceType === "both" || input.serviceType === "departure") {
				if (!input.pickupAddress || !input.departureAirport) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Pickup address and departure airport are required for departure service",
					});
				}
			}

			return ctx.db.tripRequest.create({
				data: {
					...input,
					userId: ctx.session.user.id,
					status: TripRequestStatus.PENDING,
				},
			});
		}),

	// USER: Get own trip requests
	getMyRequests: protectedProcedure
		.input(
			z
				.object({
					status: z.nativeEnum(TripRequestStatus).optional(),
					limit: z.number().min(1).max(100).default(50),
					cursor: z.string().optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;

			const items = await ctx.db.tripRequest.findMany({
				where: {
					userId: ctx.session.user.id,
					...(input?.status && { status: input.status }),
				},
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				include: {
					quotations: {
						where: { status: { not: "DRAFT" } }, // Hide draft quotations
						orderBy: { createdAt: "desc" },
					},
				},
			});

			let nextCursor: string | undefined = undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem!.id;
			}

			return { items, nextCursor };
		}),

	// USER: Get single trip request with quotations
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				include: {
					quotations: {
						where: { status: { not: "DRAFT" } },
						orderBy: { createdAt: "desc" },
					},
				},
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Users can only see their own requests
			if (tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			return tripRequest;
		}),

	// ADMIN: Get all trip requests
	getAllRequests: adminProcedure
		.input(
			z
				.object({
					status: z.nativeEnum(TripRequestStatus).optional(),
					limit: z.number().min(1).max(100).default(50),
					cursor: z.string().optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;

			const items = await ctx.db.tripRequest.findMany({
				where: {
					...(input?.status && { status: input.status }),
				},
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				include: {
					user: {
						select: { id: true, name: true, email: true },
					},
					quotations: {
						orderBy: { createdAt: "desc" },
					},
				},
			});

			let nextCursor: string | undefined = undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem!.id;
			}

			return { items, nextCursor };
		}),

	// ADMIN: Get single request (with all quotations including drafts)
	getByIdAdmin: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				include: {
					user: {
						select: { id: true, name: true, email: true, image: true },
					},
					quotations: {
						orderBy: { createdAt: "desc" },
					},
				},
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return tripRequest;
		}),

	// ADMIN: Update trip request status
	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.nativeEnum(TripRequestStatus),
			})
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { status: input.status },
			});
		}),

	// USER: Confirm trip with flight details after accepting quotation
	confirm: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				arrivalFlightDate: z.date().optional(),
				arrivalFlightTime: z.string().optional(),
				arrivalFlightNumber: z.string().optional(),
				departureFlightDate: z.date().optional(),
				departureFlightTime: z.string().optional(),
				departureFlightNumber: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id },
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Verify user owns the trip request
			if (tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			// Update trip request with flight details and mark as confirmed
			return ctx.db.tripRequest.update({
				where: { id },
				data: {
					...data,
					isConfirmed: true,
				},
			});
		}),
});

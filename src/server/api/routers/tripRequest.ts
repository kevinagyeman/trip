import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
	createTRPCRouter,
	protectedProcedure,
	adminProcedure,
} from "@/server/api/trpc";
import { TripRequestStatus } from "../../../../generated/prisma";
import { sendEmail, ADMIN_EMAIL, APP_URL } from "@/server/email";
import { NewRequestEmail } from "@/emails/new-request";
import { TripConfirmedEmail } from "@/emails/trip-confirmed";
import { createElement } from "react";
import { format } from "date-fns";

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
			if (input.serviceType === "both" || input.serviceType === "arrival") {
				if (!input.arrivalAirport || !input.destinationAddress) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Arrival airport and destination address are required for arrival service",
					});
				}
			}

			if (input.serviceType === "both" || input.serviceType === "departure") {
				if (!input.pickupAddress || !input.departureAirport) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Pickup address and departure airport are required for departure service",
					});
				}
			}

			const tripRequest = await ctx.db.tripRequest.create({
				data: {
					...input,
					userId: ctx.session.user.id,
					status: TripRequestStatus.PENDING,
				},
			});

			// Notify admin of new request
			if (ADMIN_EMAIL) {
				await sendEmail({
					to: ADMIN_EMAIL,
					subject: `New trip request from ${input.firstName} ${input.lastName}`,
					react: createElement(NewRequestEmail, {
						requestId: tripRequest.id,
						userName: ctx.session.user.name ?? ctx.session.user.email ?? "",
						userEmail: ctx.session.user.email ?? "",
						serviceType: input.serviceType,
						firstName: input.firstName,
						lastName: input.lastName,
						phone: input.phone,
						numberOfAdults: input.numberOfAdults,
						adminUrl: `${APP_URL}/admin/requests/${tripRequest.id}`,
					}),
				});
			}

			return tripRequest;
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
						where: { status: { not: "DRAFT" } },
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
					user: { select: { id: true, name: true, email: true } },
					quotations: { orderBy: { createdAt: "desc" } },
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
					user: { select: { id: true, name: true, email: true, image: true } },
					quotations: { orderBy: { createdAt: "desc" } },
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

			const tripRequest = await ctx.db.tripRequest.findUnique({ where: { id } });

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			const updated = await ctx.db.tripRequest.update({
				where: { id },
				data: { ...data, isConfirmed: true },
			});

			// Notify admin of confirmed trip
			if (ADMIN_EMAIL) {
				await sendEmail({
					to: ADMIN_EMAIL,
					subject: `✈️ ${tripRequest.firstName} ${tripRequest.lastName} confirmed their trip`,
					react: createElement(TripConfirmedEmail, {
						customerName: `${tripRequest.firstName} ${tripRequest.lastName}`,
						customerEmail: ctx.session.user.email ?? "",
						serviceType: tripRequest.serviceType,
						arrivalFlightDate: data.arrivalFlightDate
							? format(data.arrivalFlightDate, "PPP")
							: undefined,
						arrivalFlightTime: data.arrivalFlightTime,
						arrivalFlightNumber: data.arrivalFlightNumber,
						departureFlightDate: data.departureFlightDate
							? format(data.departureFlightDate, "PPP")
							: undefined,
						departureFlightTime: data.departureFlightTime,
						departureFlightNumber: data.departureFlightNumber,
						adminUrl: `${APP_URL}/admin/requests/${id}`,
					}),
				});
			}

			return updated;
		}),
});

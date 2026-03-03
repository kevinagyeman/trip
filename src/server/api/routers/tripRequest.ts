import { NewRequestEmail } from "@/emails/new-request";
import { TripConfirmedEmail } from "@/emails/trip-confirmed";
import {
	adminProcedure,
	createTRPCRouter,
	customerProcedure,
	protectedProcedure,
} from "@/server/api/trpc";
import { ADMIN_EMAIL, APP_URL, sendEmail } from "@/server/email";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { createElement } from "react";
import { z } from "zod";
import { TripRequestStatus } from "../../../../generated/prisma";

const routeSchema = z.object({
	pickup: z.string().min(1),
	destination: z.string().min(1),
});

export const tripRequestRouter = createTRPCRouter({
	// USER: Create new trip request
	create: customerProcedure
		.input(
			z.object({
				routes: z.array(routeSchema).min(1),
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
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { routes, ...rest } = input;

			const tripRequest = await ctx.db.tripRequest.create({
				data: {
					...rest,
					routes: JSON.stringify(routes),
					userId: ctx.session.user.id,
					companyId: ctx.session.user.companyId ?? null,
					status: TripRequestStatus.PENDING,
				},
			});

			// Build route summary for email
			const firstRoute = routes[0]!;
			const routeSummary =
				routes.length === 1
					? `${firstRoute.pickup} → ${firstRoute.destination}`
					: `${firstRoute.pickup} → ${firstRoute.destination} (+${routes.length - 1} more)`;

			// Notify admin of new request
			if (ADMIN_EMAIL) {
				await sendEmail({
					to: ADMIN_EMAIL,
					subject: `New trip request from ${input.firstName} ${input.lastName}`,
					react: createElement(NewRequestEmail, {
						requestId: tripRequest.id,
						userName: ctx.session.user.name ?? ctx.session.user.email ?? "",
						userEmail: ctx.session.user.email ?? "",
						serviceType: routeSummary,
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
				.optional(),
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

			let nextCursor: string | undefined;
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

	// ADMIN: Get all trip requests (scoped to company)
	getAllRequests: adminProcedure
		.input(
			z
				.object({
					status: z.nativeEnum(TripRequestStatus).optional(),
					limit: z.number().min(1).max(100).default(50),
					cursor: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;
			const companyId = ctx.session.user.companyId;

			const items = await ctx.db.tripRequest.findMany({
				where: {
					...(input?.status && { status: input.status }),
					...(companyId ? { companyId } : {}),
				},
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				include: {
					user: { select: { id: true, name: true, email: true } },
					quotations: { orderBy: { createdAt: "desc" } },
				},
			});

			let nextCursor: string | undefined;
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
			const companyId = ctx.session.user.companyId;

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

			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			return tripRequest;
		}),

	// ADMIN: Update trip request status
	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.nativeEnum(TripRequestStatus),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { status: input.status },
			});
		}),

	// USER: Confirm trip with pickup details after accepting quotation
	confirm: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				pickupDate: z.date(),
				pickupTime: z.string(),
				flightNumber: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id },
			});

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

			// Build route summary for email
			type Route = { pickup: string; destination: string };
			const routes = JSON.parse(tripRequest.routes) as Route[];
			const firstRoute = routes[0]!;
			const routeSummary =
				routes.length === 1
					? `${firstRoute.pickup} → ${firstRoute.destination}`
					: `${firstRoute.pickup} → ${firstRoute.destination} (+${routes.length - 1} more)`;

			// Notify admin of confirmed trip
			if (ADMIN_EMAIL) {
				await sendEmail({
					to: ADMIN_EMAIL,
					subject: `🚗 ${tripRequest.firstName} ${tripRequest.lastName} confirmed their trip`,
					react: createElement(TripConfirmedEmail, {
						customerName: `${tripRequest.firstName} ${tripRequest.lastName}`,
						customerEmail: ctx.session.user.email ?? "",
						serviceType: routeSummary,
						arrivalFlightDate: format(data.pickupDate, "PPP"),
						arrivalFlightTime: data.pickupTime,
						arrivalFlightNumber: data.flightNumber,
						adminUrl: `${APP_URL}/admin/requests/${id}`,
					}),
				});
			}

			return updated;
		}),
});

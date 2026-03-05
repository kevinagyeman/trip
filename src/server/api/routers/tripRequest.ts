import { BookingConfirmedEmail } from "@/emails/booking-confirmed";
import { NewRequestEmail } from "@/emails/new-request";
import { TripConfirmedEmail } from "@/emails/trip-confirmed";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { resolveAdminEmails, APP_URL, sendEmail } from "@/server/email";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { createElement } from "react";
import { z } from "zod";
import { TripRequestStatus } from "../../../../generated/prisma";

const routeSchema = z.object({
	pickup: z.string().min(1),
	destination: z.string().min(1),
	departureDate: z.string().optional(),
	departureTime: z.string().optional(),
	flightNumber: z.string().optional(),
});

export const tripRequestRouter = createTRPCRouter({
	// PUBLIC: Create new trip request (anonymous)
	create: publicProcedure
		.input(
			z.object({
				companySlug: z.string().min(1),
				email: z.string().email(),
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
			const { routes, companySlug, email, ...rest } = input;

			// Look up company by slug
			const company = await ctx.db.company.findUnique({
				where: { slug: companySlug, isActive: true },
				select: { id: true },
			});
			if (!company) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Company not found",
				});
			}

			const tripRequest = await ctx.db.tripRequest.create({
				data: {
					...rest,
					routes: JSON.stringify(routes),
					customerEmail: email,
					companyId: company.id,
					status: TripRequestStatus.PENDING,
				},
			});

			// Build route summary for email
			const firstRoute = routes[0]!;
			const routeSummary =
				routes.length === 1
					? `${firstRoute.pickup} → ${firstRoute.destination}`
					: `${firstRoute.pickup} → ${firstRoute.destination} (+${routes.length - 1} more)`;

			// Notify all admins of the new request
			const notifyEmails = await resolveAdminEmails(tripRequest.companyId);
			await Promise.all(
				notifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `New trip request from ${input.firstName} ${input.lastName}`,
						react: createElement(NewRequestEmail, {
							requestId: tripRequest.id,
							userName: `${input.firstName} ${input.lastName}`,
							userEmail: email,
							serviceType: routeSummary,
							firstName: input.firstName,
							lastName: input.lastName,
							phone: input.phone,
							numberOfAdults: input.numberOfAdults,
							adminUrl: `${APP_URL}/admin/requests/${tripRequest.id}`,
						}),
					}),
				),
			);

			return {
				id: tripRequest.id,
				token: tripRequest.token,
				fromEmail: process.env.RESEND_FROM_EMAIL ?? "",
			};
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

	// ADMIN: Get stats (scoped to company)
	getStats: adminProcedure.query(async ({ ctx }) => {
		const companyId = ctx.session.user.companyId;
		const where = companyId ? { companyId } : {};

		const [total, pending, quoted, accepted, completed, rejected, cancelled] =
			await Promise.all([
				ctx.db.tripRequest.count({ where }),
				ctx.db.tripRequest.count({ where: { ...where, status: "PENDING" } }),
				ctx.db.tripRequest.count({ where: { ...where, status: "QUOTED" } }),
				ctx.db.tripRequest.count({ where: { ...where, status: "ACCEPTED" } }),
				ctx.db.tripRequest.count({ where: { ...where, status: "COMPLETED" } }),
				ctx.db.tripRequest.count({ where: { ...where, status: "REJECTED" } }),
				ctx.db.tripRequest.count({ where: { ...where, status: "CANCELLED" } }),
			]);

		return { total, pending, quoted, accepted, completed, rejected, cancelled };
	}),

	// ADMIN: Get all trip requests (scoped to company)
	getAllRequests: adminProcedure
		.input(
			z
				.object({
					status: z.nativeEnum(TripRequestStatus).optional(),
					search: z.string().optional(),
					limit: z.number().min(1).max(100).default(20),
					cursor: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 20;
			const cursor = input?.cursor;
			const companyId = ctx.session.user.companyId;
			const search = input?.search?.trim();

			const items = await ctx.db.tripRequest.findMany({
				where: {
					...(input?.status && { status: input.status }),
					...(companyId ? { companyId } : {}),
					...(search && {
						OR: [
							{ customerEmail: { contains: search, mode: "insensitive" } },
							{ firstName: { contains: search, mode: "insensitive" } },
							{ lastName: { contains: search, mode: "insensitive" } },
						],
					}),
				},
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				include: {
					user: { select: { id: true, name: true, email: true } },
					quotations: { orderBy: { createdAt: "desc" } },
					messages: { orderBy: { createdAt: "desc" }, take: 1 },
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

			// Notify all admins of confirmed trip
			const notifyEmailsConfirm = await resolveAdminEmails(
				tripRequest.companyId,
			);
			await Promise.all(
				notifyEmailsConfirm.map((to) =>
					sendEmail({
						to,
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
					}),
				),
			);

			return updated;
		}),

	// PUBLIC: Get trip request by token (for anonymous customers)
	getByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
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

			return { ...tripRequest, fromEmail: process.env.RESEND_FROM_EMAIL ?? "" };
		}),

	// PUBLIC: Update route details (departure date/time/flight) by token
	updateRoutes: publicProcedure
		.input(
			z.object({
				token: z.string(),
				routes: z.array(
					z.object({
						pickup: z.string(),
						destination: z.string(),
						departureDate: z.string().optional(),
						departureTime: z.string().optional(),
						flightNumber: z.string().optional(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				select: { id: true },
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await ctx.db.tripRequest.update({
				where: { token: input.token },
				data: { routes: JSON.stringify(input.routes) },
			});
		}),

	// ADMIN: Confirm trip with pickup details (admin-initiated)
	confirmByAdmin: adminProcedure
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

			const updated = await ctx.db.tripRequest.update({
				where: { id },
				data: {
					...data,
					isConfirmed: true,
					status: TripRequestStatus.ACCEPTED,
				},
			});

			// Build route summary for email
			type Route = { pickup: string; destination: string };
			const routes = JSON.parse(tripRequest.routes) as Route[];
			const firstRoute = routes[0]!;
			const routeSummary =
				routes.length === 1
					? `${firstRoute.pickup} → ${firstRoute.destination}`
					: `${firstRoute.pickup} → ${firstRoute.destination} (+${routes.length - 1} more)`;

			// Notify the customer
			await sendEmail({
				to: tripRequest.customerEmail,
				subject: `✅ Your trip is confirmed — ${format(data.pickupDate, "PPP")}`,
				react: createElement(BookingConfirmedEmail, {
					firstName: tripRequest.firstName,
					pickupDate: format(data.pickupDate, "PPP"),
					pickupTime: data.pickupTime,
					flightNumber: data.flightNumber,
					routeSummary,
					requestUrl: `${APP_URL}/request/${tripRequest.token}`,
				}),
			});

			return updated;
		}),
});

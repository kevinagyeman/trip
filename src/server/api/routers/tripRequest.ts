import { LOCALE_ENUM } from "@/lib/constants";
import type { TripEvent } from "@/lib/trip-events";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	sendDepartureDetailsRequestToCustomer,
	sendDepartureDetailsUpdatedToAdmins,
	sendNewTripRequestToAdmins,
	sendPickupInfoToCustomer,
	sendRequestReceivedToCustomer,
	sendTripConfirmedToCustomer,
} from "@/server/emails/trip-emails";
import { isEmailEnabled } from "@/server/email-preferences";
import { createNotificationsForAdmins } from "@/server/notifications";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Prisma, TripRequestStatus } from "../../../../generated/prisma";

const routeSchema = z.object({
	pickup: z.string().min(1),
	destination: z.string().min(1),
	type: z.enum(["airport_out", "airport_in", "standard"]).optional(),
	departureDate: z.string().optional(),
	departureTime: z.string().optional(),
	flightNumber: z.string().optional(),
});

export const tripRequestRouter = createTRPCRouter({
	// PUBLIC: Create trip request without a company (shareable link)
	createPublic: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				routes: z.array(routeSchema).min(1),
				language: z.enum(LOCALE_ENUM),
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
			const { routes, email, ...rest } = input;
			const tripRequest = await ctx.db.tripRequest.create({
				data: {
					...rest,
					customerEmail: email,
					status: TripRequestStatus.PENDING,
					privacyAcceptedAt: new Date(),
					routes: {
						create: routes.map((r, i) => ({
							position: i,
							type: r.type ?? "standard",
							pickup: r.pickup,
							destination: r.destination,
							scheduledDate: r.departureDate ?? null,
							scheduledTime: r.departureTime ?? null,
							flightNumber: r.flightNumber ?? null,
						})),
					},
				},
			});
			return { token: tripRequest.token };
		}),

	// PUBLIC: Create new trip request (anonymous)
	create: publicProcedure
		.input(
			z.object({
				companySlug: z.string().min(1),
				email: z.string().email(),
				routes: z.array(routeSchema).min(1),
				language: z.enum(LOCALE_ENUM),
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
					customerEmail: email,
					companyId: company.id,
					status: TripRequestStatus.PENDING,
					privacyAcceptedAt: new Date(),
					routes: {
						create: routes.map((r, i) => ({
							position: i,
							type: r.type ?? "standard",
							pickup: r.pickup,
							destination: r.destination,
							scheduledDate: r.departureDate ?? null,
							scheduledTime: r.departureTime ?? null,
							flightNumber: r.flightNumber ?? null,
						})),
					},
				},
			});

			const [adminEmailEnabled] = await Promise.all([
				isEmailEnabled(tripRequest.companyId, "newTripRequest"),
			]);

			await Promise.all([
				adminEmailEnabled
					? sendNewTripRequestToAdmins({
							id: tripRequest.id,
							companyId: tripRequest.companyId,
							firstName: tripRequest.firstName,
							lastName: tripRequest.lastName,
							orderNumber: tripRequest.orderNumber,
						})
					: Promise.resolve(),
				sendRequestReceivedToCustomer({
					customerEmail: email,
					firstName: tripRequest.firstName,
					lastName: tripRequest.lastName,
					orderNumber: tripRequest.orderNumber,
					token: tripRequest.token,
					language: tripRequest.language,
					companyId: tripRequest.companyId,
				}),
			]);

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
					quotations: { orderBy: { createdAt: "desc" } },
					routes: { orderBy: { position: "asc" } },
				},
			});

			let nextCursor: string | undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem?.id;
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
					quotations: { orderBy: { createdAt: "desc" } },
					routes: { orderBy: { position: "asc" } },
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
		const { companyId, role } = ctx.session.user;
		if (role === "ADMIN" && !companyId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "No company assigned",
			});
		}
		const where = companyId ? { companyId } : {};

		const quotationWhere = companyId
			? { status: "ACCEPTED" as const, tripRequest: { companyId } }
			: { status: "ACCEPTED" as const };

		const now = new Date();
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		const [
			total,
			pending,
			quoted,
			accepted,
			confirmed,
			completed,
			rejected,
			cancelled,
			revenueAgg,
			thisMonth,
			lastMonth,
			everQuoted,
			everAccepted,
			everConfirmed,
			notifiedQuotations,
		] = await Promise.all([
			ctx.db.tripRequest.count({ where }),
			ctx.db.tripRequest.count({ where: { ...where, status: "PENDING" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "QUOTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "ACCEPTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "CONFIRMED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "COMPLETED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "REJECTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "CANCELLED" } }),
			ctx.db.quotation.aggregate({
				_sum: { price: true },
				where: quotationWhere,
			}),
			ctx.db.tripRequest.count({
				where: { ...where, createdAt: { gte: thisMonthStart } },
			}),
			ctx.db.tripRequest.count({
				where: {
					...where,
					createdAt: { gte: lastMonthStart, lt: thisMonthStart },
				},
			}),
			ctx.db.tripRequest.count({
				where: { ...where, quotations: { some: {} } },
			}),
			ctx.db.tripRequest.count({
				where: {
					...where,
					status: { in: ["ACCEPTED", "CONFIRMED", "COMPLETED"] },
				},
			}),
			ctx.db.tripRequest.count({
				where: { ...where, status: { in: ["CONFIRMED", "COMPLETED"] } },
			}),
			ctx.db.quotation.findMany({
				where: {
					notifiedAt: { not: null },
					...(companyId ? { tripRequest: { companyId } } : {}),
				},
				select: {
					notifiedAt: true,
					tripRequest: { select: { createdAt: true } },
				},
			}),
		]);

		const avgResponseTimeHours =
			notifiedQuotations.length > 0
				? notifiedQuotations.reduce((sum, q) => {
						return (
							sum +
							(q.notifiedAt!.getTime() - q.tripRequest.createdAt.getTime()) /
								(1000 * 60 * 60)
						);
					}, 0) / notifiedQuotations.length
				: 0;

		return {
			total,
			pending,
			quoted,
			accepted,
			confirmed,
			completed,
			rejected,
			cancelled,
			revenue: revenueAgg._sum.price?.toNumber() ?? 0,
			thisMonth,
			lastMonth,
			avgResponseTimeHours,
			everQuoted,
			everAccepted,
			everConfirmed,
		};
	}),

	// ADMIN: Get all trip requests (scoped to company)
	getStatusCounts: adminProcedure.query(async ({ ctx }) => {
		const { companyId, role } = ctx.session.user;
		if (role === "ADMIN" && !companyId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "No company assigned",
			});
		}
		const counts = await ctx.db.tripRequest.groupBy({
			by: ["status"],
			where: companyId ? { companyId } : {},
			_count: true,
		});
		const map: Partial<Record<string, number>> = {};
		for (const c of counts) map[c.status] = c._count;
		return {
			pending: map.PENDING ?? 0,
			quoted: map.QUOTED ?? 0,
			accepted: map.ACCEPTED ?? 0,
			confirmed: map.CONFIRMED ?? 0,
			rejected: map.REJECTED ?? 0,
			completed: map.COMPLETED ?? 0,
			cancelled: map.CANCELLED ?? 0,
		};
	}),

	getAllRequests: adminProcedure
		.input(
			z
				.object({
					status: z.nativeEnum(TripRequestStatus).optional(),
					dateRange: z
						.enum(["today", "this_week", "next_week", "this_month"])
						.optional(),
					search: z.string().optional(),
					limit: z.number().min(1).max(100).default(20),
					cursor: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 20;
			const cursor = input?.cursor;
			const { companyId, role } = ctx.session.user;
			if (role === "ADMIN" && !companyId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "No company assigned",
				});
			}
			const search = input?.search?.trim();

			const dateRangeFilter = (() => {
				const range = input?.dateRange;
				if (!range) return undefined;
				const pad = (n: number) => String(n).padStart(2, "0");
				const fmt = (d: Date) =>
					`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
				const today = new Date();
				if (range === "today") {
					const s = fmt(today);
					return { gte: s, lte: s };
				}
				if (range === "this_week") {
					const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
					const start = new Date(today);
					start.setDate(today.getDate() - day);
					const end = new Date(start);
					end.setDate(start.getDate() + 6);
					return { gte: fmt(start), lte: fmt(end) };
				}
				if (range === "next_week") {
					const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
					const start = new Date(today);
					start.setDate(today.getDate() - day + 7);
					const end = new Date(start);
					end.setDate(start.getDate() + 6);
					return { gte: fmt(start), lte: fmt(end) };
				}
				if (range === "this_month") {
					const start = new Date(today.getFullYear(), today.getMonth(), 1);
					const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
					return { gte: fmt(start), lte: fmt(end) };
				}
				return undefined;
			})();

			const where: Prisma.TripRequestWhereInput = {};
			if (input?.status) where.status = input.status;
			if (companyId) where.companyId = companyId;
			if (dateRangeFilter)
				where.routes = { some: { scheduledDate: dateRangeFilter } };
			if (search) {
				const numSearch =
					Number.isFinite(Number(search.replace(/^0+/, "") || "0")) &&
					!Number.isNaN(Number(search))
						? [{ orderNumber: Number(search) }]
						: [];
				where.OR = [
					{ customerEmail: { contains: search } },
					{ firstName: { contains: search } },
					{ lastName: { contains: search } },
					...numSearch,
				];
			}

			const items = await ctx.db.tripRequest.findMany({
				where,
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				include: {
					user: { select: { id: true, name: true, email: true } },
					quotations: { orderBy: { createdAt: "desc" } },
					messages: { orderBy: { createdAt: "desc" }, take: 1 },
					routes: { orderBy: { position: "asc" } },
				},
			});

			let nextCursor: string | undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem?.id;
			}

			const itemsWithUnread = items.map((item) => ({
				...item,
				hasUnread:
					item.lastCustomerActivityAt !== null &&
					(item.adminViewedAt === null ||
						item.lastCustomerActivityAt > item.adminViewedAt),
			}));

			return { items: itemsWithUnread, nextCursor };
		}),

	// ADMIN: Get single request (with all quotations including drafts)
	getByIdAdmin: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const { companyId, role } = ctx.session.user;
			if (role === "ADMIN" && !companyId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "No company assigned",
				});
			}

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				include: {
					user: { select: { id: true, name: true, email: true, image: true } },
					quotations: { orderBy: { createdAt: "desc" } },
					company: { select: { estimateNotice: true, name: true } },
					routes: { orderBy: { position: "asc" } },
				},
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			const rawEvents: TripEvent[] = [];

			rawEvents.push({
				type: "request_submitted",
				actor: "customer",
				at: tripRequest.createdAt,
			});

			for (const q of tripRequest.quotations) {
				if (q.notifiedAt)
					rawEvents.push({
						type: "quotation_sent",
						actor: "admin",
						at: q.notifiedAt,
					});
				if (q.quotationViewedAt)
					rawEvents.push({
						type: "quotation_viewed",
						actor: "customer",
						at: q.quotationViewedAt,
					});
				if (q.respondedAt)
					rawEvents.push({
						type:
							q.status === "ACCEPTED"
								? "quotation_accepted"
								: "quotation_rejected",
						actor: "customer",
						at: q.respondedAt,
					});
			}

			if (tripRequest.confirmedAt)
				rawEvents.push({
					type: "trip_confirmed",
					actor: "admin",
					at: tripRequest.confirmedAt,
				});
			if (tripRequest.pickupInfoNotifiedAt)
				rawEvents.push({
					type: "pickup_info_sent",
					actor: "admin",
					at: tripRequest.pickupInfoNotifiedAt,
				});
			if (
				tripRequest.lastViewedAt &&
				tripRequest.confirmedAt &&
				tripRequest.lastViewedAt > tripRequest.confirmedAt
			)
				rawEvents.push({
					type: "confirmation_viewed",
					actor: "customer",
					at: tripRequest.lastViewedAt,
				});
			if (
				tripRequest.lastViewedAt &&
				tripRequest.pickupInfoNotifiedAt &&
				tripRequest.lastViewedAt > tripRequest.pickupInfoNotifiedAt
			)
				rawEvents.push({
					type: "pickup_info_viewed",
					actor: "customer",
					at: tripRequest.lastViewedAt,
				});

			const events = rawEvents.sort((a, b) => a.at.getTime() - b.at.getTime());

			return { ...tripRequest, events };
		}),

	// ADMIN: Update trip request status (guarded transitions)
	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.nativeEnum(TripRequestStatus),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const VALID_TRANSITIONS: Partial<
				Record<TripRequestStatus, TripRequestStatus[]>
			> = {
				PENDING: [
					TripRequestStatus.QUOTED,
					TripRequestStatus.CANCELLED,
					TripRequestStatus.COMPLETED,
				],
				QUOTED: [
					TripRequestStatus.ACCEPTED,
					TripRequestStatus.REJECTED,
					TripRequestStatus.CANCELLED,
					TripRequestStatus.COMPLETED,
				],
				ACCEPTED: [
					TripRequestStatus.CONFIRMED,
					TripRequestStatus.CANCELLED,
					TripRequestStatus.COMPLETED,
				],
				CONFIRMED: [TripRequestStatus.COMPLETED, TripRequestStatus.CANCELLED],
				COMPLETED: [],
				REJECTED: [
					TripRequestStatus.QUOTED,
					TripRequestStatus.CANCELLED,
					TripRequestStatus.COMPLETED,
				],
				CANCELLED: [],
			};

			const current = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				select: { status: true, companyId: true },
			});
			if (!current) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && current.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			const allowed = VALID_TRANSITIONS[current.status] ?? [];
			if (!allowed.includes(input.status)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot transition from ${current.status} to ${input.status}`,
				});
			}

			if (input.status === TripRequestStatus.CONFIRMED) {
				const missingDeparture = await ctx.db.route.findFirst({
					where: { tripRequestId: input.id, scheduledDate: null },
				});
				if (missingDeparture) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "All routes must have a scheduled date before confirming",
					});
				}
			}

			return ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { status: input.status },
			});
		}),

	// PUBLIC: Get trip request by token (for anonymous customers)
	getByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				include: {
					quotations: {
						where: { notifiedAt: { not: null } },
						orderBy: { createdAt: "desc" },
					},
					routes: { orderBy: { position: "asc" } },
					company: {
						select: { name: true, logoUrl: true },
					},
				},
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return { ...tripRequest, fromEmail: process.env.RESEND_FROM_EMAIL ?? "" };
		}),

	// PUBLIC: Mark trip as viewed by customer
	markAsViewed: publicProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const now = new Date();

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				select: {
					id: true,
					quotations: {
						where: { notifiedAt: { not: null }, quotationViewedAt: null },
						select: { id: true },
						take: 1,
					},
				},
			});

			if (!tripRequest) return;

			await ctx.db.tripRequest.update({
				where: { id: tripRequest.id },
				data: {
					lastViewedAt: now,
					lastCustomerActivityAt: now,
				},
			});

			if (tripRequest.quotations[0]) {
				await ctx.db.quotation.update({
					where: { id: tripRequest.quotations[0].id },
					data: { quotationViewedAt: now },
				});
			}
		}),

	markAsViewedByAdmin: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				select: { companyId: true },
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			await ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { adminViewedAt: new Date() },
			});
		}),

	// PUBLIC: Update scheduled date/time/flight by token
	updateRoutes: publicProcedure
		.input(
			z.object({
				token: z.string(),
				routes: z.array(
					z.object({
						scheduledDate: z.string().optional(),
						scheduledTime: z.string().optional(),
						flightNumber: z.string().optional(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				select: {
					id: true,
					companyId: true,
					orderNumber: true,
					firstName: true,
					lastName: true,
				},
			});

			if (!tripRequest) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await Promise.all([
				...input.routes.map((r, i) =>
					ctx.db.route.updateMany({
						where: { tripRequestId: tripRequest.id, position: i },
						data: {
							scheduledDate: r.scheduledDate || null,
							scheduledTime: r.scheduledTime || null,
							flightNumber: r.flightNumber || null,
						},
					}),
				),
				ctx.db.tripRequest.update({
					where: { id: tripRequest.id },
					data: { lastCustomerActivityAt: new Date() },
				}),
			]);

			void (async () => {
				if (await isEmailEnabled(tripRequest.companyId, "tripDetailsUpdated")) {
					await sendDepartureDetailsUpdatedToAdmins({
						id: tripRequest.id,
						companyId: tripRequest.companyId,
						orderNumber: tripRequest.orderNumber,
						firstName: tripRequest.firstName,
						lastName: tripRequest.lastName,
					});
				}
			})();

			void createNotificationsForAdmins(tripRequest.companyId, {
				type: "TRIP_DETAILS_UPDATED",
				tripRequestId: tripRequest.id,
				orderNumber: tripRequest.orderNumber,
				customerName: `${tripRequest.firstName} ${tripRequest.lastName}`,
			});
		}),

	// ADMIN: Update route departure details by request id
	updateInternalNotes: adminProcedure
		.input(z.object({ id: z.string(), internalNotes: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				select: { companyId: true },
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			return ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { internalNotes: input.internalNotes || null },
			});
		}),

	updateRoutesByAdmin: adminProcedure
		.input(
			z.object({
				id: z.string(),
				routes: z.array(
					z.object({
						pickup: z.string(),
						destination: z.string(),
						type: z.enum(["airport_out", "airport_in", "standard"]).optional(),
						scheduledDate: z.string().optional(),
						scheduledTime: z.string().optional(),
						flightNumber: z.string().optional(),
						meetingPoint: z.string().optional(),
						beThereAtDate: z.string().optional(),
						beThereAtTime: z.string().optional(),
						driverName: z.string().optional(),
						driverPhone: z.string().optional(),
						additionalInfo: z.string().optional(),
					}),
				),
				notify: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					companyId: true,
					customerEmail: true,
					firstName: true,
					lastName: true,
					orderNumber: true,
					token: true,
					language: true,
				},
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			await Promise.all([
				...input.routes.map((r, i) =>
					ctx.db.route.updateMany({
						where: { tripRequestId: input.id, position: i },
						data: {
							pickup: r.pickup,
							destination: r.destination,
							type: r.type ?? "standard",
							scheduledDate: r.scheduledDate || null,
							scheduledTime: r.scheduledTime || null,
							flightNumber: r.flightNumber || null,
							meetingPoint: r.meetingPoint || null,
							beThereAtDate: r.beThereAtDate || null,
							beThereAtTime: r.beThereAtTime || null,
							driverName: r.driverName || null,
							driverPhone: r.driverPhone || null,
							additionalInfo: r.additionalInfo || null,
						},
					}),
				),
				...(input.notify
					? [
							ctx.db.tripRequest.update({
								where: { id: input.id },
								data: { pickupInfoNotifiedAt: new Date() },
							}),
						]
					: []),
			]);

			if (input.notify) {
				void sendPickupInfoToCustomer({
					customerEmail: tripRequest.customerEmail,
					firstName: tripRequest.firstName,
					lastName: tripRequest.lastName,
					orderNumber: tripRequest.orderNumber,
					token: tripRequest.token,
					language: tripRequest.language,
					companyId: tripRequest.companyId,
				});
			}
		}),

	// ADMIN: Request departure details from customer
	requestDepartureDetails: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					companyId: true,
					customerEmail: true,
					firstName: true,
					lastName: true,
					orderNumber: true,
					token: true,
					language: true,
				},
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			await ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { departureDetailsRequestedAt: new Date() },
			});

			await sendDepartureDetailsRequestToCustomer({
				customerEmail: tripRequest.customerEmail,
				firstName: tripRequest.firstName,
				lastName: tripRequest.lastName,
				orderNumber: tripRequest.orderNumber,
				token: tripRequest.token,
				language: tripRequest.language,
				companyId: tripRequest.companyId,
			});
		}),

	// ADMIN: Confirm trip — locks customer edits and notifies customer
	confirmByAdmin: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.id },
			});

			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && tripRequest.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (tripRequest.status === "CONFIRMED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Trip is already confirmed",
				});
			}

			const updated = await ctx.db.tripRequest.update({
				where: { id: input.id },
				data: { status: "CONFIRMED", confirmedAt: new Date() },
			});

			await sendTripConfirmedToCustomer({
				customerEmail: tripRequest.customerEmail,
				firstName: tripRequest.firstName,
				lastName: tripRequest.lastName,
				orderNumber: tripRequest.orderNumber,
				token: tripRequest.token,
				language: tripRequest.language,
				companyId: tripRequest.companyId,
			});

			return updated;
		}),
});

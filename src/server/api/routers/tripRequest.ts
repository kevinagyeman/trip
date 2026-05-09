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
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { TripRequestStatus } from "../../../../generated/prisma";

const routeSchema = z.object({
	pickup: z.string().min(1),
	destination: z.string().min(1),
	type: z.enum(["airport_out", "airport_in", "standard", "airport"]).optional(),
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
				language: z.enum(["en", "it"]),
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
					routes: JSON.stringify(routes),
					customerEmail: email,
					companyId: company.id,
					status: TripRequestStatus.PENDING,
					privacyAcceptedAt: new Date(),
					routesList: {
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

			await Promise.all([
				sendNewTripRequestToAdmins({
					id: tripRequest.id,
					companyId: tripRequest.companyId,
					firstName: tripRequest.firstName,
					lastName: tripRequest.lastName,
					orderNumber: tripRequest.orderNumber,
				}),
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
					routesList: { orderBy: { position: "asc" } },
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
					routesList: { orderBy: { position: "asc" } },
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

		const [
			total,
			pending,
			quoted,
			accepted,
			confirmed,
			completed,
			rejected,
			cancelled,
		] = await Promise.all([
			ctx.db.tripRequest.count({ where }),
			ctx.db.tripRequest.count({ where: { ...where, status: "PENDING" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "QUOTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "ACCEPTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "CONFIRMED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "COMPLETED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "REJECTED" } }),
			ctx.db.tripRequest.count({ where: { ...where, status: "CANCELLED" } }),
		]);

		return {
			total,
			pending,
			quoted,
			accepted,
			confirmed,
			completed,
			rejected,
			cancelled,
		};
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
			const { companyId, role } = ctx.session.user;
			if (role === "ADMIN" && !companyId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "No company assigned",
				});
			}
			const search = input?.search?.trim();

			const items = await ctx.db.tripRequest.findMany({
				where: {
					...(input?.status && { status: input.status }),
					...(companyId ? { companyId } : {}),
					...(search && {
						OR: [
							{ customerEmail: { contains: search } },
							{ firstName: { contains: search } },
							{ lastName: { contains: search } },
							...(Number.isFinite(Number(search.replace(/^0+/, "") || "0")) &&
							!Number.isNaN(Number(search))
								? [{ orderNumber: Number(search) }]
								: []),
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
					routesList: { orderBy: { position: "asc" } },
				},
			});

			let nextCursor: string | undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem?.id;
			}

			return { items, nextCursor };
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
					routesList: { orderBy: { position: "asc" } },
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
					TripRequestStatus.REJECTED,
					TripRequestStatus.CANCELLED,
				],
				QUOTED: [
					TripRequestStatus.PENDING,
					TripRequestStatus.REJECTED,
					TripRequestStatus.CANCELLED,
				],
				ACCEPTED: [TripRequestStatus.CONFIRMED, TripRequestStatus.CANCELLED],
				CONFIRMED: [TripRequestStatus.COMPLETED, TripRequestStatus.CANCELLED],
				COMPLETED: [],
				REJECTED: [TripRequestStatus.PENDING],
				CANCELLED: [TripRequestStatus.PENDING],
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
				const full = await ctx.db.tripRequest.findUnique({
					where: { id: input.id },
					select: { pickupDate: true, pickupTime: true },
				});
				if (!full?.pickupDate || !full?.pickupTime) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Pickup date and time are required before confirming",
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
					quotations: { orderBy: { createdAt: "desc" } },
					routesList: { orderBy: { position: "asc" } },
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
			const trip = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				select: { status: true, confirmationViewedAt: true },
			});
			await ctx.db.tripRequest.updateMany({
				where: { token: input.token },
				data: {
					lastViewedAt: new Date(),
					...(trip?.status === "CONFIRMED" && !trip.confirmationViewedAt
						? { confirmationViewedAt: new Date() }
						: {}),
				},
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

			await Promise.all(
				input.routes.map((r, i) =>
					ctx.db.route.updateMany({
						where: { tripRequestId: tripRequest.id, position: i },
						data: {
							scheduledDate: r.scheduledDate || null,
							scheduledTime: r.scheduledTime || null,
							flightNumber: r.flightNumber || null,
						},
					}),
				),
			);

			void sendDepartureDetailsUpdatedToAdmins({
				id: tripRequest.id,
				companyId: tripRequest.companyId,
				orderNumber: tripRequest.orderNumber,
				firstName: tripRequest.firstName,
				lastName: tripRequest.lastName,
			});
		}),

	// ADMIN: Update route departure details by request id
	updateInternalNotes: adminProcedure
		.input(z.object({ id: z.string(), internalNotes: z.string() }))
		.mutation(async ({ ctx, input }) => {
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
						type: z
							.enum(["airport_out", "airport_in", "standard", "airport"])
							.optional(),
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

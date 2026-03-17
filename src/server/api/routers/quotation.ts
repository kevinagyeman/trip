import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	sendQuotationAcceptedToAdmins,
	sendQuotationRejectedToAdmins,
	sendQuotationToCustomer,
} from "@/server/emails/trip-emails";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	QuotationStatus,
	TripRequestStatus,
} from "../../../../generated/prisma";

export const quotationRouter = createTRPCRouter({
	// ADMIN: Save (create or update) the single quotation for a trip request
	save: adminProcedure
		.input(
			z.object({
				tripRequestId: z.string(),
				price: z.number().positive(),
				isPriceEachWay: z.boolean().default(false),
				areCarSeatsIncluded: z.boolean().default(false),
				quotationAdditionalInfo: z.string().optional(),
				internalNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { tripRequestId, ...data } = input;

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: tripRequestId },
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });

			const existing = await ctx.db.quotation.findFirst({
				where: { tripRequestId },
			});

			if (existing) {
				if (existing.status === QuotationStatus.ACCEPTED) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Cannot edit an accepted quotation",
					});
				}
				return ctx.db.quotation.update({
					where: { id: existing.id },
					data,
				});
			}

			return ctx.db.quotation.create({
				data: {
					...data,
					currency: "EUR",
					tripRequestId,
					status: QuotationStatus.PENDING,
					createdById: ctx.session.user.id,
				},
			});
		}),

	// ADMIN: Save quotation AND notify customer in one step
	saveAndSend: adminProcedure
		.input(
			z.object({
				tripRequestId: z.string(),
				price: z.number().positive(),
				isPriceEachWay: z.boolean().default(false),
				areCarSeatsIncluded: z.boolean().default(false),
				quotationAdditionalInfo: z.string().optional(),
				internalNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { tripRequestId, ...data } = input;

			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: tripRequestId },
				select: {
					id: true,
					token: true,
					firstName: true,
					lastName: true,
					customerEmail: true,
					orderNumber: true,
					companyId: true,
					language: true,
				},
			});
			if (!tripRequest) throw new TRPCError({ code: "NOT_FOUND" });

			const existing = await ctx.db.quotation.findFirst({
				where: { tripRequestId },
			});

			if (existing?.status === QuotationStatus.ACCEPTED) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot edit an accepted quotation",
				});
			}

			const now = new Date();

			const quotation = await ctx.db.$transaction(async (tx) => {
				const q = existing
					? await tx.quotation.update({
							where: { id: existing.id },
							data: {
								...data,
								status: QuotationStatus.PENDING,
								notifiedAt: now,
								respondedAt: null,
							},
						})
					: await tx.quotation.create({
							data: {
								...data,
								currency: "EUR",
								tripRequestId,
								status: QuotationStatus.PENDING,
								notifiedAt: now,
								createdById: ctx.session.user.id,
							},
						});

				await tx.tripRequest.update({
					where: { id: tripRequestId },
					data: { status: TripRequestStatus.QUOTED },
				});

				return q;
			});

			await sendQuotationToCustomer({
				customerEmail: tripRequest.customerEmail,
				firstName: tripRequest.firstName,
				lastName: tripRequest.lastName,
				orderNumber: tripRequest.orderNumber,
				token: tripRequest.token,
				language: tripRequest.language,
			});

			return quotation;
		}),

	// ADMIN: Notify customer — resend current quotation by email
	notify: adminProcedure
		.input(z.object({ tripRequestId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findFirst({
				where: { tripRequestId: input.tripRequestId },
				include: {
					tripRequest: {
						select: {
							token: true,
							firstName: true,
							lastName: true,
							customerEmail: true,
							orderNumber: true,
							language: true,
						},
					},
				},
			});

			if (!quotation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No quotation found for this request",
				});
			}
			if (quotation.status === QuotationStatus.ACCEPTED) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation already accepted",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: quotation.id },
					data: {
						notifiedAt: new Date(),
						status: QuotationStatus.PENDING,
						respondedAt: null,
					},
				});
				await tx.tripRequest.update({
					where: { id: input.tripRequestId },
					data: { status: TripRequestStatus.QUOTED },
				});
				return result;
			});

			await sendQuotationToCustomer({
				customerEmail: quotation.tripRequest.customerEmail,
				firstName: quotation.tripRequest.firstName,
				lastName: quotation.tripRequest.lastName,
				orderNumber: quotation.tripRequest.orderNumber,
				token: quotation.tripRequest.token,
				language: quotation.tripRequest.language,
			});

			return updated;
		}),

	// USER: Accept quotation (logged-in)
	accept: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: {
					tripRequest: {
						include: {
							user: { select: { email: true, name: true } },
							company: { select: { adminEmail: true } },
						},
					},
				},
			});

			if (!quotation) throw new TRPCError({ code: "NOT_FOUND" });
			if (quotation.tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			if (quotation.status !== QuotationStatus.PENDING) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be accepted",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.ACCEPTED, respondedAt: new Date() },
				});
				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.ACCEPTED },
				});
				return result;
			});

			await sendQuotationAcceptedToAdmins({
				id: quotation.tripRequestId,
				companyId: quotation.tripRequest.companyId,
				firstName: quotation.tripRequest.firstName,
				lastName: quotation.tripRequest.lastName,
				orderNumber: quotation.tripRequest.orderNumber,
			});

			return updated;
		}),

	// PUBLIC: Accept quotation by token (anonymous customers)
	acceptByToken: publicProcedure
		.input(z.object({ id: z.string(), token: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: {
					tripRequest: {
						include: {
							company: { select: { adminEmail: true } },
						},
					},
				},
			});

			if (!quotation) throw new TRPCError({ code: "NOT_FOUND" });
			if (quotation.tripRequest.token !== input.token) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			if (quotation.status !== QuotationStatus.PENDING) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be accepted",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.ACCEPTED, respondedAt: new Date() },
				});
				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.ACCEPTED },
				});
				return result;
			});

			await sendQuotationAcceptedToAdmins({
				id: quotation.tripRequestId,
				companyId: quotation.tripRequest.companyId,
				firstName: quotation.tripRequest.firstName,
				lastName: quotation.tripRequest.lastName,
				orderNumber: quotation.tripRequest.orderNumber,
			});

			return updated;
		}),

	// PUBLIC: Reject quotation by token (anonymous customers)
	rejectByToken: publicProcedure
		.input(z.object({ id: z.string(), token: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: {
					tripRequest: {
						include: {
							company: { select: { adminEmail: true } },
						},
					},
				},
			});

			if (!quotation) throw new TRPCError({ code: "NOT_FOUND" });
			if (quotation.tripRequest.token !== input.token) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			if (quotation.status !== QuotationStatus.PENDING) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be rejected",
				});
			}

			await ctx.db.$transaction(async (tx) => {
				await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.REJECTED, respondedAt: new Date() },
				});
				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.PENDING },
				});
			});

			await sendQuotationRejectedToAdmins({
				id: quotation.tripRequestId,
				companyId: quotation.tripRequest.companyId,
				firstName: quotation.tripRequest.firstName,
				lastName: quotation.tripRequest.lastName,
				orderNumber: quotation.tripRequest.orderNumber,
			});
		}),

	// ADMIN: Delete quotation (only if PENDING or REJECTED)
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
			});
			if (!quotation) throw new TRPCError({ code: "NOT_FOUND" });
			if (quotation.status === QuotationStatus.ACCEPTED) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot delete an accepted quotation",
				});
			}
			return ctx.db.quotation.delete({ where: { id: input.id } });
		}),
});

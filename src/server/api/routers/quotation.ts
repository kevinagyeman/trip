import { GenericEmail } from "@/emails/generic-email";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { APP_URL, resolveAdminEmails, sendEmail } from "@/server/email";
import { TRPCError } from "@trpc/server";
import { createElement } from "react";
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
				currency: z.string().default("EUR"),
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
					tripRequestId,
					status: QuotationStatus.PENDING,
					createdById: ctx.session.user.id,
				},
			});
		}),

	// ADMIN: Notify customer — send current quotation by email
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
					data: { notifiedAt: new Date() },
				});
				await tx.tripRequest.update({
					where: { id: input.tripRequestId },
					data: { status: TripRequestStatus.QUOTED },
				});
				return result;
			});

			const customerEmail = quotation.tripRequest.customerEmail;
			if (customerEmail) {
				const order = `#${String(quotation.tripRequest.orderNumber).padStart(7, "0")}`;
				await sendEmail({
					to: customerEmail,
					subject: `[${order}] QUOTATION READY | ${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
					react: createElement(GenericEmail, {
						data: {
							preview: "View quotation",
							title: `Dear ${quotation.tripRequest.firstName}, your quotation for request ${order} is ready.`,
							subtitle:
								"Review your quotation and accept it when you're ready.",
							buttonLabel: "View Quotation",
						},
						href: `${APP_URL}/request/${quotation.tripRequest.token}`,
					}),
				});
			}

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

			const acceptOrder = `#${String(quotation.tripRequest.orderNumber).padStart(7, "0")}`;
			const acceptCustomerName = `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`;
			const notifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			await Promise.all(
				notifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `[${acceptOrder}] QUOTATION ACCEPTED | ${acceptCustomerName}`,
						react: createElement(GenericEmail, {
							data: {
								preview: "View request",
								title: `${acceptCustomerName} accepted the quotation for request ${acceptOrder}.`,
								buttonLabel: "View Request",
							},
							href: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

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

			const acceptOrder = `#${String(quotation.tripRequest.orderNumber).padStart(7, "0")}`;
			const acceptCustomerName = `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`;
			const notifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			await Promise.all(
				notifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `[${acceptOrder}] QUOTATION ACCEPTED | ${acceptCustomerName}`,
						react: createElement(GenericEmail, {
							data: {
								preview: "View request",
								title: `${acceptCustomerName} accepted the quotation for request ${acceptOrder}.`,
								buttonLabel: "View Request",
							},
							href: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

			return updated;
		}),

	// ADMIN: Delete quotation (only if PENDING)
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
			});
			if (!quotation) throw new TRPCError({ code: "NOT_FOUND" });
			if (quotation.status !== QuotationStatus.PENDING) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot delete an accepted quotation",
				});
			}
			return ctx.db.quotation.delete({ where: { id: input.id } });
		}),
});

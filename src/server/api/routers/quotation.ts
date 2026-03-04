import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
	createTRPCRouter,
	protectedProcedure,
	adminProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	QuotationStatus,
	TripRequestStatus,
} from "../../../../generated/prisma";
import { sendEmail, resolveAdminEmails, APP_URL } from "@/server/email";
import { QuotationSentEmail } from "@/emails/quotation-sent";
import { QuotationResponseEmail } from "@/emails/quotation-response";
import { createElement } from "react";

export const quotationRouter = createTRPCRouter({
	// ADMIN: Create quotation (draft)
	create: adminProcedure
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
			const tripRequest = await ctx.db.tripRequest.findUnique({
				where: { id: input.tripRequestId },
			});

			if (!tripRequest) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Trip request not found",
				});
			}

			return ctx.db.quotation.create({
				data: {
					...input,
					createdById: ctx.session.user.id,
					status: QuotationStatus.DRAFT,
				},
			});
		}),

	// ADMIN: Update quotation (only drafts)
	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				price: z.number().positive().optional(),
				currency: z.string().optional(),
				isPriceEachWay: z.boolean().optional(),
				areCarSeatsIncluded: z.boolean().optional(),
				quotationAdditionalInfo: z.string().optional(),
				internalNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const quotation = await ctx.db.quotation.findUnique({ where: { id } });

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.status !== QuotationStatus.DRAFT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft quotations can be edited",
				});
			}

			return ctx.db.quotation.update({ where: { id }, data });
		}),

	// ADMIN: Send quotation to user
	send: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: {
					tripRequest: {
						select: {
							token: true,
							firstName: true,
							customerEmail: true,
						},
					},
				},
			});

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.status !== QuotationStatus.DRAFT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation already sent",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.SENT, sentAt: new Date() },
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.QUOTED },
				});

				return result;
			});

			// Send email notification to the customer
			const customerEmail = quotation.tripRequest.customerEmail;
			if (customerEmail) {
				await sendEmail({
					to: customerEmail,
					subject: `Your quotation is ready — ${quotation.currency} ${quotation.price}`,
					react: createElement(QuotationSentEmail, {
						firstName: quotation.tripRequest.firstName,
						price: quotation.price.toString(),
						currency: quotation.currency,
						isPriceEachWay: quotation.isPriceEachWay,
						areCarSeatsIncluded: quotation.areCarSeatsIncluded,
						additionalInfo: quotation.quotationAdditionalInfo ?? undefined,
						dashboardUrl: `${APP_URL}/request/${quotation.tripRequest.token}`,
					}),
				});
			}

			return updated;
		}),

	// USER: Accept quotation
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

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
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

			// Notify all admins
			const acceptNotifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			const acceptUser = quotation.tripRequest.user;
			await Promise.all(
				acceptNotifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `✅ Quotation accepted by ${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
						react: createElement(QuotationResponseEmail, {
							accepted: true,
							customerName: `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
							customerEmail: acceptUser?.email ?? quotation.tripRequest.customerEmail ?? "",
							price: quotation.price.toString(),
							currency: quotation.currency,
							adminUrl: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

			return updated;
		}),

	// USER: Reject quotation
	reject: protectedProcedure
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

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be rejected",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.REJECTED, respondedAt: new Date() },
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.REJECTED },
				});

				return result;
			});

			// Notify all admins
			const rejectNotifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			const rejectUser = quotation.tripRequest.user;
			await Promise.all(
				rejectNotifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `❌ Quotation rejected by ${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
						react: createElement(QuotationResponseEmail, {
							accepted: false,
							customerName: `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
							customerEmail: rejectUser?.email ?? quotation.tripRequest.customerEmail ?? "",
							price: quotation.price.toString(),
							currency: quotation.currency,
							adminUrl: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

			return updated;
		}),

	// ADMIN: Delete draft quotation
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
			});

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.status !== QuotationStatus.DRAFT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft quotations can be deleted",
				});
			}

			return ctx.db.quotation.delete({ where: { id: input.id } });
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

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.tripRequest.token !== input.token) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
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

			// Notify all admins
			const notifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			await Promise.all(
				notifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `✅ Quotation accepted by ${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
						react: createElement(QuotationResponseEmail, {
							accepted: true,
							customerName: `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
							customerEmail: quotation.tripRequest.customerEmail,
							price: quotation.price.toString(),
							currency: quotation.currency,
							adminUrl: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

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

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.tripRequest.token !== input.token) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be rejected",
				});
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				const result = await tx.quotation.update({
					where: { id: input.id },
					data: { status: QuotationStatus.REJECTED, respondedAt: new Date() },
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.REJECTED },
				});

				return result;
			});

			// Notify all admins
			const notifyEmails = await resolveAdminEmails(
				quotation.tripRequest.companyId,
			);
			await Promise.all(
				notifyEmails.map((to) =>
					sendEmail({
						to,
						subject: `❌ Quotation rejected by ${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
						react: createElement(QuotationResponseEmail, {
							accepted: false,
							customerName: `${quotation.tripRequest.firstName} ${quotation.tripRequest.lastName}`,
							customerEmail: quotation.tripRequest.customerEmail,
							price: quotation.price.toString(),
							currency: quotation.currency,
							adminUrl: `${APP_URL}/admin/requests/${quotation.tripRequestId}`,
						}),
					}),
				),
			);

			return updated;
		}),
});

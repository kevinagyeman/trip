import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
	createTRPCRouter,
	protectedProcedure,
	adminProcedure,
} from "@/server/api/trpc";
import { QuotationStatus, TripRequestStatus } from "../../../../generated/prisma";

export const quotationRouter = createTRPCRouter({
	// ADMIN: Create quotation (draft)
	create: adminProcedure
		.input(
			z.object({
				tripRequestId: z.string(),
				price: z.number().positive(),
				currency: z.string().default("USD"),
				description: z.string().optional(),
				validUntil: z.date().optional(),
				internalNotes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify trip request exists
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
				description: z.string().optional(),
				validUntil: z.date().optional(),
				internalNotes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			// Check if quotation is still a draft
			const quotation = await ctx.db.quotation.findUnique({
				where: { id },
			});

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (quotation.status !== QuotationStatus.DRAFT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft quotations can be edited",
				});
			}

			return ctx.db.quotation.update({
				where: { id },
				data,
			});
		}),

	// ADMIN: Send quotation to user
	send: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: { tripRequest: true },
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

			// Update quotation and trip request in transaction
			return ctx.db.$transaction(async (tx) => {
				const updated = await tx.quotation.update({
					where: { id: input.id },
					data: {
						status: QuotationStatus.SENT,
						sentAt: new Date(),
					},
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.QUOTED },
				});

				return updated;
			});
		}),

	// USER: Accept quotation
	accept: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: { tripRequest: true },
			});

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Verify user owns the trip request
			if (quotation.tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be accepted",
				});
			}

			// Check if expired
			if (quotation.validUntil && quotation.validUntil < new Date()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation has expired",
				});
			}

			return ctx.db.$transaction(async (tx) => {
				const updated = await tx.quotation.update({
					where: { id: input.id },
					data: {
						status: QuotationStatus.ACCEPTED,
						respondedAt: new Date(),
					},
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.ACCEPTED },
				});

				return updated;
			});
		}),

	// USER: Reject quotation
	reject: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const quotation = await ctx.db.quotation.findUnique({
				where: { id: input.id },
				include: { tripRequest: true },
			});

			if (!quotation) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Verify user owns the trip request
			if (quotation.tripRequest.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (quotation.status !== QuotationStatus.SENT) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Quotation cannot be rejected",
				});
			}

			return ctx.db.$transaction(async (tx) => {
				const updated = await tx.quotation.update({
					where: { id: input.id },
					data: {
						status: QuotationStatus.REJECTED,
						respondedAt: new Date(),
					},
				});

				await tx.tripRequest.update({
					where: { id: quotation.tripRequestId },
					data: { status: TripRequestStatus.REJECTED },
				});

				return updated;
			});
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

			return ctx.db.quotation.delete({
				where: { id: input.id },
			});
		}),
});

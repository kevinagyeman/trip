import { TripMessageEmail } from "@/emails/trip-message";
import {
	adminProcedure,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";
import { resolveAdminEmails, APP_URL, sendEmail } from "@/server/email";
import { TRPCError } from "@trpc/server";
import { createElement } from "react";
import { z } from "zod";

export const tripMessageRouter = createTRPCRouter({
	// PUBLIC: Get messages for a request by token (customer)
	getByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const request = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
				select: { id: true },
			});
			if (!request) throw new TRPCError({ code: "NOT_FOUND" });

			return ctx.db.tripMessage.findMany({
				where: { tripRequestId: request.id },
				orderBy: { createdAt: "asc" },
			});
		}),

	// ADMIN: Get messages for a request by ID
	getByRequestId: adminProcedure
		.input(z.object({ requestId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.tripMessage.findMany({
				where: { tripRequestId: input.requestId },
				orderBy: { createdAt: "asc" },
			});
		}),

	// PUBLIC: Customer sends a message
	sendAsCustomer: publicProcedure
		.input(z.object({ token: z.string(), body: z.string().min(1).max(2000) }))
		.mutation(async ({ ctx, input }) => {
			const request = await ctx.db.tripRequest.findUnique({
				where: { token: input.token },
			});
			if (!request) throw new TRPCError({ code: "NOT_FOUND" });

			const message = await ctx.db.tripMessage.create({
				data: {
					body: input.body,
					senderType: "CUSTOMER",
					senderName: `${request.firstName} ${request.lastName}`,
					tripRequestId: request.id,
				},
			});

			const adminEmails = await resolveAdminEmails(request.companyId);
			await Promise.all(
				adminEmails.map((to) =>
					sendEmail({
						to,
						subject: `💬 Message from ${request.firstName} ${request.lastName}`,
						react: createElement(TripMessageEmail, {
							senderName: `${request.firstName} ${request.lastName}`,
							requestUrl: `${APP_URL}/admin/requests/${request.id}`,
						}),
					}),
				),
			);

			return message;
		}),

	// ADMIN: Admin sends a message
	sendAsAdmin: adminProcedure
		.input(
			z.object({ requestId: z.string(), body: z.string().min(1).max(2000) }),
		)
		.mutation(async ({ ctx, input }) => {
			const request = await ctx.db.tripRequest.findUnique({
				where: { id: input.requestId },
			});
			if (!request) throw new TRPCError({ code: "NOT_FOUND" });

			const adminName =
				ctx.session.user.name ?? ctx.session.user.email ?? "Admin";

			const message = await ctx.db.tripMessage.create({
				data: {
					body: input.body,
					senderType: "ADMIN",
					senderName: adminName,
					tripRequestId: input.requestId,
				},
			});

			await sendEmail({
				to: request.customerEmail,
				subject: `💬 New message about your trip request`,
				react: createElement(TripMessageEmail, {
					senderName: adminName,
					requestUrl: `${APP_URL}/request/${request.token}`,
				}),
			});

			return message;
		}),
});

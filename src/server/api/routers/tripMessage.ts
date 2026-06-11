import {
	adminProcedure,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";
import {
	sendAdminMessageToCustomer,
	sendCustomerMessageToAdmins,
} from "@/server/emails/trip-emails";
import { isEmailEnabled } from "@/server/email-preferences";
import { createNotificationsForAdmins } from "@/server/notifications";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MessageSenderType } from "../../../../generated/prisma";

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
			const request = await ctx.db.tripRequest.findUnique({
				where: { id: input.requestId },
				select: { companyId: true },
			});
			if (!request) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && request.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

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
					senderType: MessageSenderType.CUSTOMER,
					senderName: `${request.firstName} ${request.lastName}`,
					tripRequestId: request.id,
				},
			});

			void (async () => {
				if (await isEmailEnabled(request.companyId, "customerMessage")) {
					await sendCustomerMessageToAdmins({
						id: request.id,
						companyId: request.companyId,
						firstName: request.firstName,
						lastName: request.lastName,
						orderNumber: request.orderNumber,
					});
				}
			})();

			await createNotificationsForAdmins(request.companyId, {
				type: "NEW_MESSAGE",
				tripRequestId: request.id,
				orderNumber: request.orderNumber,
				customerName: `${request.firstName} ${request.lastName}`,
			});

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
				select: {
					id: true,
					companyId: true,
					firstName: true,
					lastName: true,
					orderNumber: true,
					customerEmail: true,
					language: true,
					token: true,
				},
			});
			if (!request) throw new TRPCError({ code: "NOT_FOUND" });
			const { companyId } = ctx.session.user;
			if (companyId && request.companyId !== companyId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			const adminName =
				ctx.session.user.name ?? ctx.session.user.email ?? "Admin";

			const message = await ctx.db.tripMessage.create({
				data: {
					body: input.body,
					senderType: MessageSenderType.ADMIN,
					senderName: adminName,
					tripRequestId: input.requestId,
				},
			});

			void sendAdminMessageToCustomer({
				customerEmail: request.customerEmail,
				language: request.language,
				token: request.token,
				firstName: request.firstName,
				lastName: request.lastName,
				orderNumber: request.orderNumber,
				companyId: request.companyId,
			});

			return message;
		}),
});

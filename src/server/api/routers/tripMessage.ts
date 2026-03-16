import {
	adminProcedure,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";
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

			return ctx.db.tripMessage.create({
				data: {
					body: input.body,
					senderType: MessageSenderType.CUSTOMER,
					senderName: `${request.firstName} ${request.lastName}`,
					tripRequestId: request.id,
				},
			});
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

			return ctx.db.tripMessage.create({
				data: {
					body: input.body,
					senderType: MessageSenderType.ADMIN,
					senderName: adminName,
					tripRequestId: input.requestId,
				},
			});
		}),
});

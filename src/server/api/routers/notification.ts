import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

export const notificationRouter = createTRPCRouter({
	getAll: adminProcedure.query(async ({ ctx }) => {
		return ctx.db.notification.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: "desc" },
			take: 30,
		});
	}),

	getUnreadCount: adminProcedure.query(async ({ ctx }) => {
		return ctx.db.notification.count({
			where: { userId: ctx.session.user.id, read: false },
		});
	}),

	markRead: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.notification.updateMany({
				where: { id: input.id, userId: ctx.session.user.id },
				data: { read: true },
			});
		}),

	markAllRead: adminProcedure.mutation(async ({ ctx }) => {
		return ctx.db.notification.updateMany({
			where: { userId: ctx.session.user.id, read: false },
			data: { read: true },
		});
	}),
});

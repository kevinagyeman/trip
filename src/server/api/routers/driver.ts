import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { z } from "zod";

const driverInput = z.object({
	name: z.string().min(1),
	surname: z.string().min(1),
	phone: z.string().min(1),
	email: z.string().email(),
});

export const driverRouter = createTRPCRouter({
	getAll: adminProcedure.query(async ({ ctx }) => {
		const { companyId } = ctx.session.user;
		if (!companyId) return [];
		return ctx.db.driver.findMany({
			where: { companyId },
			orderBy: { name: "asc" },
		});
	}),

	create: adminProcedure.input(driverInput).mutation(async ({ ctx, input }) => {
		return ctx.db.driver.create({
			data: { ...input, companyId: ctx.session.user.companyId! },
		});
	}),

	update: adminProcedure
		.input(z.object({ id: z.string() }).merge(driverInput.partial()))
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.driver.update({
				where: { id, companyId: ctx.session.user.companyId! },
				data,
			});
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.driver.delete({
				where: { id: input.id, companyId: ctx.session.user.companyId! },
			});
		}),
});

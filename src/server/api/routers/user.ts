import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const userRouter = createTRPCRouter({
	changePassword: adminProcedure
		.input(
			z.object({
				currentPassword: z.string().min(1),
				newPassword: z.string().min(6),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({
				where: { id: ctx.session.user.id },
				select: { password: true },
			});

			if (!user?.password) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No password set for this account",
				});
			}

			const isValid = await bcrypt.compare(
				input.currentPassword,
				user.password,
			);
			if (!isValid) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Current password is incorrect",
				});
			}

			const hashed = await bcrypt.hash(input.newPassword, 10);
			await ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: { password: hashed },
			});
		}),
});

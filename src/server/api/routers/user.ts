import { LOCALE_ENUM } from "@/lib/constants";
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

	changeLanguage: adminProcedure
		.input(z.object({ language: z.enum(LOCALE_ENUM) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: { preferredLanguage: input.language },
			});
		}),

	updateEstimateNotice: adminProcedure
		.input(z.object({ notices: z.record(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			const { companyId } = ctx.session.user;
			if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });
			await ctx.db.company.update({
				where: { id: companyId },
				data: { estimateNotice: JSON.stringify(input.notices) },
			});
		}),

	changeEmail: adminProcedure
		.input(
			z.object({
				newEmail: z.string().email(),
				currentPassword: z.string().min(1),
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

			const existing = await ctx.db.user.findUnique({
				where: { email: input.newEmail },
				select: { id: true },
			});
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This email is already in use",
				});
			}

			await ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: { email: input.newEmail },
			});
		}),
});

import { createTRPCRouter, superAdminProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const companyRouter = createTRPCRouter({
	// SUPER_ADMIN: List all companies
	getAll: superAdminProcedure.query(async ({ ctx }) => {
		return ctx.db.company.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				_count: { select: { users: true, tripRequests: true } },
			},
		});
	}),

	// SUPER_ADMIN: Get a single company by id
	getById: superAdminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const company = await ctx.db.company.findUnique({
				where: { id: input.id },
				include: {
					users: { select: { id: true, name: true, email: true, role: true } },
					_count: { select: { tripRequests: true } },
				},
			});

			if (!company) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return company;
		}),

	// PUBLIC: Get company by slug (used for /book/[slug] page)
	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const company = await ctx.db.company.findUnique({
				where: { slug: input.slug, isActive: true },
				select: { id: true, name: true, slug: true, logoUrl: true },
			});

			if (!company) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return company;
		}),

	// SUPER_ADMIN: Create a company
	create: superAdminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				slug: z
					.string()
					.min(1)
					.regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
				adminEmail: z.string().email().optional(),
				logoUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.company.findUnique({
				where: { slug: input.slug },
			});

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A company with this slug already exists",
				});
			}

			return ctx.db.company.create({ data: input });
		}),

	// SUPER_ADMIN: Update a company
	update: superAdminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				adminEmail: z.string().email().optional().nullable(),
				logoUrl: z.string().url().optional().nullable(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.company.update({ where: { id }, data });
		}),

	// SUPER_ADMIN: Assign a user to a company
	assignUser: superAdminProcedure
		.input(
			z.object({
				userId: z.string(),
				companyId: z.string(),
				role: z.enum(["USER", "ADMIN"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.user.update({
				where: { id: input.userId },
				data: { companyId: input.companyId, role: input.role },
			});
		}),

	// SUPER_ADMIN: Remove a user from a company
	removeUser: superAdminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.user.update({
				where: { id: input.userId },
				data: { companyId: null, role: "USER" },
			});
		}),
});

import {
	createTRPCRouter,
	superAdminProcedure,
	adminProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	EMAIL_PREFERENCE_DEFAULTS,
	type EmailPreferences,
} from "@/server/email-preferences";
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
				select: {
					id: true,
					name: true,
					slug: true,
					logoUrl: true,
				},
			});

			if (!company) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return company;
		}),

	// ADMIN: Get own company slug (for booking link)
	getMySlug: adminProcedure.query(async ({ ctx }) => {
		const companyId = ctx.session.user.companyId;
		if (!companyId) return null;
		return ctx.db.company.findUnique({
			where: { id: companyId },
			select: { slug: true },
		});
	}),

	// ADMIN: Update own company details
	updateMyCompany: adminProcedure
		.input(
			z.object({
				name: z.string().min(1).optional(),
				vat: z.string().optional(),
				phone: z.string().optional(),
				address: z.string().optional(),
				country: z.string().optional(),
				website: z
					.string()
					.url("Enter a valid URL")
					.optional()
					.or(z.literal("")),
				brandColor: z
					.string()
					.regex(/^#[0-9a-fA-F]{6}$/)
					.optional()
					.or(z.literal(""))
					.nullable(),
				logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
				coverPhotoUrl: z.string().url().optional().or(z.literal("")).nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const companyId = ctx.session.user.companyId;
			if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });
			return ctx.db.company.update({
				where: { id: companyId },
				data: {
					...input,
					website: input.website || null,
					logoUrl: input.logoUrl || null,
					coverPhotoUrl: input.coverPhotoUrl || null,
					brandColor: input.brandColor || null,
				},
			});
		}),

	// ADMIN: Get own company email preferences
	getEmailPreferences: adminProcedure.query(async ({ ctx }) => {
		const companyId = ctx.session.user.companyId;
		if (!companyId) return EMAIL_PREFERENCE_DEFAULTS;

		const company = await ctx.db.company.findUnique({
			where: { id: companyId },
			select: { emailPreferences: true },
		});

		const stored = (company?.emailPreferences ??
			{}) as Partial<EmailPreferences>;
		return { ...EMAIL_PREFERENCE_DEFAULTS, ...stored };
	}),

	// ADMIN: Update own company banner (per-language JSON)
	updateBanner: adminProcedure
		.input(z.object({ messages: z.record(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			const companyId = ctx.session.user.companyId;
			if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });
			const hasAny = Object.values(input.messages).some((v) => v.trim() !== "");
			return ctx.db.company.update({
				where: { id: companyId },
				data: { bannerMessage: hasAny ? JSON.stringify(input.messages) : null },
			});
		}),

	// ADMIN: Update own company email preferences
	updateEmailPreferences: adminProcedure
		.input(
			z.object({
				newTripRequest: z.boolean(),
				quotationAccepted: z.boolean(),
				quotationRejected: z.boolean(),
				customerMessage: z.boolean(),
				tripDetailsUpdated: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const companyId = ctx.session.user.companyId;
			if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });
			return ctx.db.company.update({
				where: { id: companyId },
				data: { emailPreferences: input },
			});
		}),

	// SUPER_ADMIN: Update a company (activate/deactivate)
	update: superAdminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				logoUrl: z.string().url().optional().nullable(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.company.update({ where: { id }, data });
		}),
});

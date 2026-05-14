import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const companyRouter = createTRPCRouter({
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
});

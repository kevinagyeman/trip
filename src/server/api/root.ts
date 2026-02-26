import { postRouter } from "@/server/api/routers/post";
import { tripRequestRouter } from "@/server/api/routers/tripRequest";
import { quotationRouter } from "@/server/api/routers/quotation";
import { companyRouter } from "@/server/api/routers/company";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	tripRequest: tripRequestRouter,
	quotation: quotationRouter,
	company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

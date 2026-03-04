import { tripRequestRouter } from "@/server/api/routers/tripRequest";
import { quotationRouter } from "@/server/api/routers/quotation";
import { companyRouter } from "@/server/api/routers/company";
import { tripMessageRouter } from "@/server/api/routers/tripMessage";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
	tripRequest: tripRequestRouter,
	quotation: quotationRouter,
	company: companyRouter,
	tripMessage: tripMessageRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

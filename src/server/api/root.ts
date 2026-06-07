import { tripRequestRouter } from "@/server/api/routers/tripRequest";
import { quotationRouter } from "@/server/api/routers/quotation";
import { companyRouter } from "@/server/api/routers/company";
import { tripMessageRouter } from "@/server/api/routers/tripMessage";
import { userRouter } from "@/server/api/routers/user";
import { driverRouter } from "@/server/api/routers/driver";
import { notificationRouter } from "@/server/api/routers/notification";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
	tripRequest: tripRequestRouter,
	quotation: quotationRouter,
	company: companyRouter,
	tripMessage: tripMessageRouter,
	user: userRouter,
	driver: driverRouter,
	notification: notificationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

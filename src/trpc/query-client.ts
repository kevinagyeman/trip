import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";
import Decimal from "decimal.js";

SuperJSON.registerCustom<Decimal, string>(
	{
		isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
		serialize: (v) => v.toJSON(),
		deserialize: (v) => new Decimal(v),
	},
	"decimal.js",
);

export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 30 * 1000,
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});

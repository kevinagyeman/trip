"use client";

import { Car, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
	routeType?: string | null;
	n: number;
}

export function RouteTypeLabel({ routeType, n }: Props) {
	const t = useTranslations("common");
	return (
		<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
			{routeType === "airport_in" ? (
				<PlaneLanding className="h-3.5 w-3.5" />
			) : routeType === "airport_out" ? (
				<PlaneTakeoff className="h-3.5 w-3.5" />
			) : (
				<Car className="h-3.5 w-3.5" />
			)}
			{t("routeN", { n })}
		</div>
	);
}

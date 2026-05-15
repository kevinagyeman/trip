"use client";

import { Car, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
	routeType?: string | null;
	n: number;
}

export function RouteTypeLabel({ routeType, n }: Props) {
	const t = useTranslations("common");
	const iconSize = "h-4 w-4";
	return (
		<div className="flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-muted-foreground mb-2">
			{routeType === "airport_in" ? (
				<PlaneLanding className={iconSize} />
			) : routeType === "airport_out" ? (
				<PlaneTakeoff className={iconSize} />
			) : (
				<Car className={iconSize} />
			)}
			{t("routeN", { n })}
		</div>
	);
}

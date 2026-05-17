"use client";

import { Car, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
	routeType?: string | null;
	n: number;
}

export function RouteTypeLabel({ routeType, n }: Props) {
	const t = useTranslations("common");
	const iconSize = "h-4 w-4 text-blue-900 dark:text-blue-200";
	const routeStyle =
		"p-1.5 rounded-sm border border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30";

	return (
		<div className="flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-muted-foreground mb-2">
			{routeType === "airport_in" ? (
				<div className={routeStyle}>
					<PlaneLanding className={iconSize} />
				</div>
			) : routeType === "airport_out" ? (
				<div className={routeStyle}>
					<PlaneTakeoff className={iconSize} />
				</div>
			) : (
				<div className={routeStyle}>
					<Car className={iconSize} />
				</div>
			)}
			{t("routeN", { n })}
		</div>
	);
}

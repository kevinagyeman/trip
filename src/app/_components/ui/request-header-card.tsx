"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildStatusLabels, STATUS_COLORS } from "@/lib/trip-utils";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface RequestHeaderCardProps {
	orderNumber: number;
	firstName: string;
	lastName: string;
	status: string;
	headerActions?: ReactNode;
}

export function RequestHeaderCard({
	orderNumber,
	firstName,
	lastName,
	status,
	headerActions,
}: RequestHeaderCardProps) {
	const t = useTranslations("requestDetail");
	const statusLabels = buildStatusLabels(t as (key: string) => string);

	return (
		<Card className="gap-0">
			<CardContent>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-0.5">
						<p className="text-xs font-medium text-muted-foreground">
							#{String(orderNumber).padStart(7, "0")}
						</p>
						<h2 className="text-2xl font-bold">
							{firstName} {lastName}
						</h2>
					</div>
					<div className="flex flex-shrink-0 flex-wrap items-center gap-2">
						<Badge className={`${STATUS_COLORS[status]} text-sm`}>
							{statusLabels[status] ?? status}
						</Badge>
						{headerActions}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

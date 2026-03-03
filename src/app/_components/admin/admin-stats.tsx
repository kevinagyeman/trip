"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function AdminStats() {
	const t = useTranslations("adminDashboard");
	const { data, isLoading } = api.tripRequest.getStats.useQuery();

	const stats = [
		{
			label: t("statTotal"),
			value: data?.total ?? 0,
			className: "text-foreground",
		},
		{
			label: t("statPending"),
			value: data?.pending ?? 0,
			className: "text-yellow-600 dark:text-yellow-400",
		},
		{
			label: t("statQuoted"),
			value: data?.quoted ?? 0,
			className: "text-blue-600 dark:text-blue-400",
		},
		{
			label: t("statAccepted"),
			value: data?.accepted ?? 0,
			className: "text-green-600 dark:text-green-400",
		},
		{
			label: t("statCompleted"),
			value: data?.completed ?? 0,
			className: "text-gray-600 dark:text-gray-400",
		},
		{
			label: t("statCancelled"),
			value: (data?.rejected ?? 0) + (data?.cancelled ?? 0),
			className: "text-red-600 dark:text-red-400",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader className="pb-2 pt-4">
						<CardTitle className="text-xs font-medium text-muted-foreground">
							{stat.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="pb-4">
						<p className={`text-3xl font-bold ${stat.className}`}>
							{isLoading ? "—" : stat.value}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

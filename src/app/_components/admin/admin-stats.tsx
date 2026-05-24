"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

function pct(num: number, den: number): string {
	if (den === 0) return "—";
	return `${Math.round((num / den) * 100)}%`;
}

function formatHours(h: number): string {
	if (h === 0) return "—";
	if (h < 1) return `${Math.round(h * 60)}m`;
	if (h < 24) return `${Math.round(h)}h`;
	return `${Math.round(h / 24)}d`;
}

function formatEur(value: number): string {
	return `${Math.round(value)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
}

export function AdminStats() {
	const t = useTranslations("adminDashboard");
	const { data, isLoading } = api.tripRequest.getStats.useQuery();

	const d = data;

	const revenue = d?.revenue ?? 0;
	const revenueFormatted = isLoading ? "—" : formatEur(revenue);

	const monthGrowth = d ? d.thisMonth - d.lastMonth : 0;
	const GrowthIcon =
		monthGrowth > 0 ? TrendingUp : monthGrowth < 0 ? TrendingDown : Minus;
	const growthColor =
		monthGrowth > 0
			? "text-emerald-600 dark:text-emerald-400"
			: monthGrowth < 0
				? "text-red-600 dark:text-red-400"
				: "text-muted-foreground";

	const counts = [
		{
			label: t("statTotal"),
			value: d?.total ?? 0,
			className: "text-foreground",
		},
		{
			label: t("statPending"),
			value: d?.pending ?? 0,
			className: "text-yellow-600 dark:text-yellow-400",
		},
		{
			label: t("statQuoted"),
			value: d?.quoted ?? 0,
			className: "text-blue-600 dark:text-blue-400",
		},
		{
			label: t("statAccepted"),
			value: d?.accepted ?? 0,
			className: "text-green-600 dark:text-green-400",
		},
		{
			label: t("statConfirmed"),
			value: d?.confirmed ?? 0,
			className: "text-emerald-600 dark:text-emerald-400",
		},
		{
			label: t("statCompleted"),
			value: d?.completed ?? 0,
			className: "text-gray-600 dark:text-gray-400",
		},
		{
			label: t("statRejected"),
			value: d?.rejected ?? 0,
			className: "text-red-600 dark:text-red-400",
		},
		{
			label: t("statCancelled"),
			value: d?.cancelled ?? 0,
			className: "text-orange-600 dark:text-orange-400",
		},
	];

	return (
		<div className="space-y-6">
			{/* Revenue */}
			<Card>
				<CardHeader className="pb-2 pt-4">
					<CardTitle className="font-medium text-muted-foreground">
						{t("statRevenue")}
					</CardTitle>
				</CardHeader>
				<CardContent className="pb-4">
					<p className="text-5xl font-bold">
						{isLoading ? "—" : revenueFormatted}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{t("statRevenueNote")}
					</p>
				</CardContent>
			</Card>

			{/* Conversion funnel */}
			<div>
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					{t("sectionFunnel")}
				</h2>
				<div className="flex flex-col gap-4 lg:grid lg:grid-cols-4">
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statAcceptanceRate")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-5xl font-bold text-green-600 dark:text-green-400">
								{isLoading
									? "—"
									: pct(d?.everAccepted ?? 0, d?.everQuoted ?? 0)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("statAcceptanceRateNote")}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statConfirmRate")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
								{isLoading
									? "—"
									: pct(d?.everConfirmed ?? 0, d?.everAccepted ?? 0)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("statConfirmRateNote")}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statCompletionRate")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
								{isLoading
									? "—"
									: pct(d?.completed ?? 0, d?.everConfirmed ?? 0)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("statCompletionRateNote")}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statCancellationRate")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-5xl font-bold text-red-600 dark:text-red-400">
								{isLoading
									? "—"
									: pct(
											(d?.cancelled ?? 0) + (d?.rejected ?? 0),
											d?.total ?? 0,
										)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("statCancellationRateNote")}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Averages & health */}
			<div>
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					{t("sectionHealth")}
				</h2>
				<div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statAvgResponseTime")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-5xl font-bold">
								{isLoading ? "—" : formatHours(d?.avgResponseTimeHours ?? 0)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("statAvgResponseTimeNote")}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2 pt-4">
							<CardTitle className="font-medium text-muted-foreground">
								{t("statMonthlyGrowth")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pb-4">
							<div className="flex items-end gap-2">
								<p className={`text-5xl font-bold ${growthColor}`}>
									{isLoading ? "—" : (d?.thisMonth ?? 0)}
								</p>
								{!isLoading && (
									<GrowthIcon className={`mb-1 h-6 w-6 ${growthColor}`} />
								)}
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								{isLoading
									? ""
									: t("statMonthlyGrowthNote", { last: d?.lastMonth ?? 0 })}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Raw counts */}
			<div>
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					{t("sectionCounts")}
				</h2>
				<div className="flex flex-col gap-4 lg:grid lg:grid-cols-4">
					{counts.map((stat) => (
						<Card key={stat.label}>
							<CardHeader className="pb-2 pt-4">
								<CardTitle className="font-medium text-muted-foreground">
									{stat.label}
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-4">
								<p className={`text-5xl font-bold ${stat.className}`}>
									{isLoading ? "—" : stat.value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

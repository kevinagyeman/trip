"use client";

import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildStatusLabels, STATUS_COLORS } from "@/lib/trip-utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { ArrowRight, Loader2, MoveRight, Tag, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

type DateRange = "today" | "this_week" | "next_week" | "this_month";

function getRelativeDays(dateStr: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const date = new Date(`${dateStr}T12:00:00`);
	date.setHours(0, 0, 0, 0);
	return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function AllTripRequests() {
	const t = useTranslations("adminRequests");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const { data: myCompany } = api.company.getMySlug.useQuery();
	const { data: counts } = api.tripRequest.getStatusCounts.useQuery();
	const [statusFilter, setStatusFilter] = useState<TripRequestStatus | "ALL">(
		"ALL",
	);
	const [dateRange, setDateRange] = useState<DateRange | "ALL">("ALL");
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const handleSearch = (value: string) => {
		setSearch(value);
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		api.tripRequest.getAllRequests.useInfiniteQuery(
			{
				status: statusFilter === "ALL" ? undefined : statusFilter,
				dateRange: dateRange === "ALL" ? undefined : dateRange,
				search: debouncedSearch || undefined,
				limit: 20,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const items = data?.pages.flatMap((p) => p.items) ?? [];

	return (
		<div className="space-y-4 pb-8">
			{/* Summary strip */}
			{counts && (
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => {
							setStatusFilter("PENDING");
							setDateRange("ALL");
						}}
						className="flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-900 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
						{counts.pending} {t("statusPending")}
					</button>
					<button
						type="button"
						onClick={() => {
							setStatusFilter("QUOTED");
							setDateRange("ALL");
						}}
						className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
						{counts.quoted} {t("statusQuoted")}
					</button>
					<button
						type="button"
						onClick={() => {
							setStatusFilter("CONFIRMED");
							setDateRange("ALL");
						}}
						className="flex items-center gap-1.5 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-green-500" />
						{counts.confirmed} {t("statusConfirmed")}
					</button>
				</div>
			)}

			{/* Filters */}
			<div className="flex flex-wrap gap-3">
				<CustomInput
					className="w-full"
					placeholder={t("searchPlaceholder")}
					inputProps={{
						value: search,
						onChange: (e) => handleSearch(e.target.value),
					}}
				/>
				<CustomSelect
					value={statusFilter}
					onValueChange={(v) => setStatusFilter(v as TripRequestStatus | "ALL")}
					placeholder={t("filterByStatus")}
					options={[
						{ value: "ALL", label: t("allRequests") },
						{ value: "PENDING", label: t("statusPending") },
						{ value: "QUOTED", label: t("statusQuoted") },
						{ value: "ACCEPTED", label: t("statusAccepted") },
						{ value: "CONFIRMED", label: t("statusConfirmed") },
						{ value: "REJECTED", label: t("statusRejected") },
						{ value: "COMPLETED", label: t("statusCompleted") },
						{ value: "CANCELLED", label: t("statusCancelled") },
					]}
				/>
				<CustomSelect
					value={dateRange}
					onValueChange={(v) => setDateRange(v as DateRange | "ALL")}
					placeholder={t("filterByDate")}
					options={[
						{ value: "ALL", label: t("allDates") },
						{ value: "today", label: t("today") },
						{ value: "this_week", label: t("thisWeek") },
						{ value: "next_week", label: t("nextWeek") },
						{ value: "this_month", label: t("thisMonth") },
					]}
				/>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : !items.length ? (
				myCompany?.slug ? (
					<CopyLinkCard
						url={`/book/${myCompany.slug}`}
						title={t("noRequests")}
						subtitle={t("noRequestsDesc")}
					/>
				) : (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							{t("noRequests")}
						</CardContent>
					</Card>
				)
			) : (
				<>
					{items.map((request) => (
						<Card key={request.id}>
							<CardContent>
								<div className="flex items-start justify-between gap-3 min-w-0">
									<div className="space-y-2 min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<p className="text-muted-foreground text-xs">
												#{String(request.orderNumber).padStart(7, "0")}
											</p>
											<Badge
												className={`px-1.5 py-0 text-xs font-medium ${STATUS_COLORS[request.status]}`}
											>
												{statusLabels[request.status] ?? request.status}
											</Badge>
											{request.hasUnread && (
												<span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
											)}
										</div>

										<div className="text-sm min-w-0">
											<p className="truncate font-semibold">
												{request.firstName} {request.lastName}
											</p>
											<p className="truncate text-muted-foreground">
												{request.user?.email ?? request.customerEmail}
											</p>
										</div>

										<div className="space-y-0.5 text-xs min-w-0">
											{request.routes.map((route, i) => {
												const isScheduled = !!route.scheduledDate;
												const diff = route.scheduledDate
													? getRelativeDays(route.scheduledDate)
													: null;

												return (
													<div
														key={i}
														className="flex items-center gap-1 text-muted-foreground"
													>
														<span
															title={
																isScheduled
																	? t("pickupPlanned")
																	: t("pickupNotPlanned")
															}
															className={`h-1.5 w-1.5 rounded-full shrink-0 ${
																isScheduled
																	? "bg-green-500"
																	: "bg-muted-foreground/30"
															}`}
														/>
														<span className="truncate">{route.pickup}</span>
														<MoveRight className="h-3 w-3 shrink-0" />
														<span className="truncate">
															{route.destination}
														</span>
														{route.scheduledDate && (
															<>
																<span className="shrink-0 text-muted-foreground/50">
																	·
																</span>
																<span className="shrink-0 tabular-nums">
																	{format(
																		new Date(`${route.scheduledDate}T12:00:00`),
																		"d MMM",
																	)}
																</span>
																{diff !== null && diff >= 0 && diff <= 14 && (
																	<span
																		className={`shrink-0 font-medium ${
																			diff === 0
																				? "text-red-500"
																				: diff === 1
																					? "text-orange-500"
																					: "text-muted-foreground"
																		}`}
																	>
																		(
																		{diff === 0
																			? t("relativeToday")
																			: diff === 1
																				? t("relativeTomorrow")
																				: t("relativeInDays", { days: diff })}
																		)
																	</span>
																)}
															</>
														)}
													</div>
												);
											})}
										</div>

										<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Users className="h-3 w-3 shrink-0" />
												{(request.numberOfAdults ?? 0) +
													(request.numberOfChildren ?? 0)}
											</span>
											{(() => {
												const q = request.quotations.find(
													(q) => q.notifiedAt !== null,
												);
												if (!q) return null;
												return (
													<span className="flex items-center gap-1">
														<Tag className="h-3 w-3 shrink-0" />
														{q.price.toString()} {q.currency}
													</span>
												);
											})()}
										</div>
									</div>
									<Button
										asChild
										variant="secondary"
										size="icon"
										className="shrink-0 self-center"
									>
										<Link href={`/admin/requests/${request.id}`}>
											<ArrowRight />
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}

					{hasNextPage && (
						<div className="flex justify-center pt-2">
							<Button
								variant="outline"
								onClick={() => void fetchNextPage()}
								disabled={isFetchingNextPage}
							>
								{isFetchingNextPage ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									t("loadMore")
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

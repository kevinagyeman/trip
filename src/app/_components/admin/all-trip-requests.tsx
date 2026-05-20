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
						{
							value: "PENDING",
							label: `${t("statusPending")}${counts ? ` (${counts.pending})` : ""}`,
						},
						{
							value: "QUOTED",
							label: `${t("statusQuoted")}${counts ? ` (${counts.quoted})` : ""}`,
						},
						{
							value: "ACCEPTED",
							label: `${t("statusAccepted")}${counts ? ` (${counts.accepted})` : ""}`,
						},
						{
							value: "CONFIRMED",
							label: `${t("statusConfirmed")}${counts ? ` (${counts.confirmed})` : ""}`,
						},
						{
							value: "REJECTED",
							label: `${t("statusRejected")}${counts ? ` (${counts.rejected})` : ""}`,
						},
						{
							value: "COMPLETED",
							label: `${t("statusCompleted")}${counts ? ` (${counts.completed})` : ""}`,
						},
						{
							value: "CANCELLED",
							label: `${t("statusCancelled")}${counts ? ` (${counts.cancelled})` : ""}`,
						},
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
				{(statusFilter !== "ALL" || dateRange !== "ALL" || search) && (
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setStatusFilter("ALL");
							setDateRange("ALL");
							setSearch("");
							setDebouncedSearch("");
						}}
					>
						{t("resetFilters")}
					</Button>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
					{t("legendPickupSet")}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
					{t("legendPickupNotSet")}
				</span>
				<span className="flex items-center gap-1.5">
					<Users className="h-3 w-3 shrink-0" />
					{t("legendPassengers")}
				</span>
				<span className="flex items-center gap-1.5">
					<Tag className="h-3 w-3 shrink-0" />
					{t("legendPrice")}
				</span>
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
						<Card key={request.id} className="relative">
							{/* {request.hasUnread && (
							<span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-background" />
						)} */}
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
										</div>

										<div className="text-sm min-w-0">
											<p className="truncate font-semibold">
												{request.firstName} {request.lastName}
											</p>
											<p className="truncate text-muted-foreground">
												{request.user?.email ?? request.customerEmail}
											</p>
										</div>

										<div className="space-y-1 text-xs min-w-0">
											{request.routes.map((route, i) => {
												const isScheduled = !!(
													route.meetingPoint ??
													route.beThereAtDate ??
													route.driverName
												);
												const diff = route.scheduledDate
													? getRelativeDays(route.scheduledDate)
													: null;

												return (
													<div
														key={i}
														className="flex items-center gap-1 text-muted-foreground"
													>
														<span
															className={`h-2 w-2 rounded-full shrink-0 ${
																isScheduled
																	? "bg-sky-500"
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

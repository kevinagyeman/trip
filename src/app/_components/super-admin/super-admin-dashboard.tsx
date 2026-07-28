"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { FileText, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminDashboard() {
	const t = useTranslations("superAdmin");
	const { data: companies, isLoading } = api.company.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-7 w-48" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="rounded-lg border p-4 space-y-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-32 rounded-full" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
							<Skeleton className="h-4 w-24" />
							<div className="flex gap-3">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-16" />
							</div>
							<Skeleton className="h-8 w-full rounded-md" />
						</div>
					))}
				</div>
			</div>
		);
	}

	const pending = companies?.filter((c) => !c.isActive) ?? [];
	const active = companies?.filter((c) => c.isActive) ?? [];

	return (
		<div className="container mx-auto space-y-8 p-4">
			<div className="flex justify-end">
				<Link href="/super-admin/requests">
					<Button variant="outline" size="sm">
						<FileText className="h-4 w-4" />
						{t("viewRequests")}
					</Button>
				</Link>
			</div>

			{/* Pending approvals */}
			{pending.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold">{t("pendingApproval")}</h2>
						<Badge variant="destructive">{pending.length}</Badge>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{pending.map((company) => (
							<Card
								key={company.id}
								className="border-yellow-400 dark:border-yellow-600"
							>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-base">{company.name}</CardTitle>
									<Badge variant="secondary">{t("pendingBadge")}</Badge>
								</CardHeader>
								<CardContent>
									<p className="mb-3 font-mono text-xs text-muted-foreground">
										/{company.slug}
									</p>
									<div className="mb-4 flex gap-3 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Users className="h-3.5 w-3.5" />
											{company._count.users}
										</span>
									</div>
									<Link href={`/super-admin/companies/${company.id}`}>
										<Button size="sm" className="w-full">
											{t("reviewAndActivate")}
										</Button>
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Active companies */}
			<div className="space-y-3">
				{active.length > 0 && (
					<h2 className="text-lg font-semibold">{t("activeCompanies")}</h2>
				)}
				{!companies || companies.length === 0 ? (
					<p className="text-muted-foreground">No companies yet.</p>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{active.map((company) => (
							<Card
								key={company.id}
								className="transition-shadow hover:shadow-md"
							>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-base">{company.name}</CardTitle>
									<Badge>{t("active")}</Badge>
								</CardHeader>
								<CardContent>
									<p className="mb-3 font-mono text-xs text-muted-foreground">
										/{company.slug}
									</p>
									<div className="mb-4 flex gap-3 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Users className="h-3.5 w-3.5" />
											{company._count.users}
										</span>
										<span className="flex items-center gap-1">
											<FileText className="h-3.5 w-3.5" />
											{company._count.tripRequests}
										</span>
									</div>
									<Link href={`/super-admin/companies/${company.id}`}>
										<Button variant="outline" size="sm" className="w-full">
											{t("manage")}
										</Button>
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

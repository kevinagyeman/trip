"use client";

import { api } from "@/trpc/react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Building2, Users, FileText, Plus } from "lucide-react";

export function SuperAdminDashboard() {
	const t = useTranslations("superAdmin");
	const { data: companies, isLoading } = api.company.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<p className="text-muted-foreground">{t("loading")}</p>
			</div>
		);
	}

	const pending = companies?.filter((c) => !c.isActive) ?? [];
	const active = companies?.filter((c) => c.isActive) ?? [];

	return (
		<div className="container mx-auto px-4 py-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("title")}</h1>
					<p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
				</div>
				<Link href="/super-admin/companies/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						{t("newCompany")}
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
									<CardTitle className="text-lg">{company.name}</CardTitle>
									<Badge variant="secondary">{t("pendingBadge")}</Badge>
								</CardHeader>
								<CardContent>
									<p className="mb-3 font-mono text-sm text-muted-foreground">
										/{company.slug}
									</p>
									<div className="mb-4 flex gap-4 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Users className="h-4 w-4" />
											{company._count.users} {t("users")}
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
					<Card>
						<CardContent className="py-12 text-center">
							<Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="text-muted-foreground">{t("noCompanies")}</p>
							<Link href="/super-admin/companies/new">
								<Button className="mt-4">
									<Plus className="mr-2 h-4 w-4" />
									{t("createFirstCompany")}
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{active.map((company) => (
							<Card
								key={company.id}
								className="transition-shadow hover:shadow-md"
							>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-lg">{company.name}</CardTitle>
									<Badge>{t("active")}</Badge>
								</CardHeader>
								<CardContent>
									<p className="mb-3 font-mono text-sm text-muted-foreground">
										/{company.slug}
									</p>
									<div className="mb-4 flex gap-4 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Users className="h-4 w-4" />
											{company._count.users} {t("users")}
										</span>
										<span className="flex items-center gap-1">
											<FileText className="h-4 w-4" />
											{company._count.tripRequests} {t("requests")}
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

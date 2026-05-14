"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import {
	Building2,
	ExternalLink,
	FileText,
	Globe,
	Hash,
	Loader2,
	MapPin,
	Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function CompanyDetail({ id }: { id: string }) {
	const t = useTranslations("superAdmin");
	const utils = api.useUtils();
	const { data: company, isLoading } = api.company.getById.useQuery({ id });

	const updateCompany = api.company.update.useMutation({
		onSuccess: () => void utils.company.getById.invalidate({ id }),
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!company) {
		return <p className="text-muted-foreground">{t("notFound")}</p>;
	}

	return (
		<div className="space-y-6">
			{/* Company header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold">{company.name}</h1>
					<p className="font-mono text-sm text-muted-foreground">
						/{company.slug}
					</p>
				</div>
				<div className="flex gap-2">
					<Badge variant={company.isActive ? "default" : "secondary"}>
						{company.isActive ? t("active") : t("inactive")}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							updateCompany.mutate({ id, isActive: !company.isActive })
						}
					>
						{company.isActive ? t("deactivate") : t("activate")}
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<Users className="h-8 w-8 text-muted-foreground" />
						<p className="text-2xl font-bold">{company.users.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<FileText className="h-8 w-8 text-muted-foreground" />
						<p className="text-2xl font-bold">{company._count.tripRequests}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<Globe className="h-8 w-8 text-muted-foreground" />
						<p className="font-mono text-sm text-muted-foreground">
							/{company.slug}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Company details */}
			{(company.vat ??
				company.address ??
				company.country ??
				company.website) && (
				<Card>
					<CardContent className="space-y-2 pt-4 text-sm">
						{company.vat && (
							<div className="flex items-center gap-2">
								<Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span>{company.vat}</span>
							</div>
						)}
						{company.address && (
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span>{company.address}</span>
							</div>
						)}
						{company.country && (
							<div className="flex items-center gap-2">
								<Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span>{company.country}</span>
							</div>
						)}
						{company.website && (
							<div className="flex items-center gap-2">
								<ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
								<a
									href={company.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									{company.website}
								</a>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Users */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Users className="h-4 w-4" />
						{t("companyUsers")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{company.users.length === 0 ? (
						<p className="text-sm text-muted-foreground">{t("noUsers")}</p>
					) : (
						<div className="divide-y">
							{company.users.map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between py-2"
								>
									<div>
										<p className="text-sm font-medium">
											{user.name ?? user.email}
										</p>
										<p className="text-xs text-muted-foreground">
											{user.email}
										</p>
									</div>
									<Badge variant="outline">{user.role}</Badge>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

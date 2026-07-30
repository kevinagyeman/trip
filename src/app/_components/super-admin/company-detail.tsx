"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { ExternalLink, FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyDetail({ id }: { id: string }) {
	const utils = api.useUtils();
	const { data: company, isLoading } = api.company.getById.useQuery({ id });

	const updateCompany = api.company.update.useMutation({
		onSuccess: () => void utils.company.getById.invalidate({ id }),
	});

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-4 w-64" />
			</div>
		);
	}

	if (!company) {
		return <p className="text-muted-foreground">Not found</p>;
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">{company.name}</h1>
					<p className="font-mono text-sm text-muted-foreground">
						/{company.slug}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={company.isActive ? "default" : "secondary"}>
						{company.isActive ? "Active" : "Inactive"}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							updateCompany.mutate({ id, isActive: !company.isActive })
						}
						disabled={updateCompany.isPending}
					>
						{company.isActive ? "Deactivate" : "Activate"}
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
				<span className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					{company.users.length} users
				</span>
				<Link
					href={`/super-admin/requests?company=${id}`}
					className="flex items-center gap-1 hover:text-foreground"
				>
					<FileText className="h-4 w-4" />
					{company._count.tripRequests} trip requests
				</Link>
			</div>

			{/* Company details */}
			{(company.vat ??
				company.address ??
				company.country ??
				company.website) && (
				<div className="space-y-1 rounded-lg border p-4 text-sm">
					{company.vat && <p>{company.vat}</p>}
					{company.address && <p>{company.address}</p>}
					{company.country && <p>{company.country}</p>}
					{company.website && (
						<a
							href={company.website}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 text-primary hover:underline"
						>
							<ExternalLink className="h-3.5 w-3.5" />
							{company.website}
						</a>
					)}
				</div>
			)}

			{/* Users */}
			<div className="rounded-lg border">
				<div className="border-b px-4 py-2 text-sm font-medium">Users</div>
				{company.users.length === 0 ? (
					<p className="p-4 text-sm text-muted-foreground">
						No users assigned yet.
					</p>
				) : (
					<div className="divide-y">
						{company.users.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between px-4 py-2"
							>
								<div>
									<p className="text-sm font-medium">
										{user.name ?? user.email}
									</p>
									<p className="text-xs text-muted-foreground">{user.email}</p>
								</div>
								<Badge variant="outline">{user.role}</Badge>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

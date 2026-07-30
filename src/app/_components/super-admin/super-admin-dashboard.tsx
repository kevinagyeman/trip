"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminDashboard() {
	const { data: companies, isLoading } = api.company.getAll.useQuery();

	return (
		<div className="container mx-auto space-y-4 p-4">
			<div className="flex justify-end">
				<Link href="/super-admin/requests">
					<Button variant="outline" size="sm">
						<FileText className="h-4 w-4" />
						View Requests
					</Button>
				</Link>
			</div>

			{isLoading ? (
				<div className="divide-y rounded-lg border">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4 px-4 py-3">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-10" />
							<Skeleton className="h-4 w-16 rounded-full" />
							<Skeleton className="h-8 w-20 rounded-md ml-auto" />
						</div>
					))}
				</div>
			) : !companies || companies.length === 0 ? (
				<p className="text-muted-foreground">No companies yet.</p>
			) : (
				<div className="divide-y rounded-lg border">
					{companies.map((company) => (
						<div
							key={company.id}
							className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
						>
							<div className="min-w-0 flex-1">
								<div className="font-medium">{company.name}</div>
								<div className="font-mono text-xs text-muted-foreground">
									/{company.slug}
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<span className="flex items-center gap-1 text-sm text-muted-foreground">
									<Users className="h-3.5 w-3.5" />
									{company._count.users}
								</span>
								<span className="flex items-center gap-1 text-sm text-muted-foreground">
									<FileText className="h-3.5 w-3.5" />
									{company._count.tripRequests}
								</span>
								<Badge variant={company.isActive ? "default" : "secondary"}>
									{company.isActive ? "Active" : "Inactive"}
								</Badge>
								<Link href={`/super-admin/companies/${company.id}`}>
									<Button variant="outline" size="sm">
										Manage
									</Button>
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AllTripRequests() {
	const [statusFilter, setStatusFilter] = useState<
		TripRequestStatus | "ALL"
	>("ALL");

	const { data, isLoading } = api.tripRequest.getAllRequests.useQuery({
		status: statusFilter === "ALL" ? undefined : statusFilter,
	});

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Select
					value={statusFilter}
					onValueChange={(v) => setStatusFilter(v as TripRequestStatus | "ALL")}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Requests</SelectItem>
						<SelectItem value="PENDING">Pending</SelectItem>
						<SelectItem value="QUOTED">Quoted</SelectItem>
						<SelectItem value="ACCEPTED">Accepted</SelectItem>
						<SelectItem value="REJECTED">Rejected</SelectItem>
						<SelectItem value="COMPLETED">Completed</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{!data?.items.length ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						No requests found.
					</CardContent>
				</Card>
			) : (
				data.items.map((request) => (
					<Card key={request.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle>{request.destination}</CardTitle>
									<p className="text-sm text-muted-foreground">
										{request.user.name || request.user.email}
									</p>
									<p className="text-xs text-muted-foreground">
										{format(new Date(request.startDate), "MMM dd")} -{" "}
										{format(new Date(request.endDate), "MMM dd, yyyy")}
									</p>
								</div>
								<Badge>{request.status}</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									<p>{request.passengerCount} passenger(s)</p>
									<p className="text-muted-foreground">
										{request.quotations.length} quotation(s)
									</p>
								</div>
								<Button asChild>
									<Link href={`/admin/requests/${request.id}`}>Manage</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
}

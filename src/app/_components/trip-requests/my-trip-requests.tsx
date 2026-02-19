"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-500",
	QUOTED: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	REJECTED: "bg-red-500",
	COMPLETED: "bg-gray-500",
	CANCELLED: "bg-gray-400",
};

export function MyTripRequests() {
	const { data, isLoading } = api.tripRequest.getMyRequests.useQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data?.items.length) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					No trip requests yet. Create your first one!
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{data.items.map((request) => (
				<Card key={request.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle>{request.destination}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{format(new Date(request.startDate), "MMM dd")} -{" "}
									{format(new Date(request.endDate), "MMM dd, yyyy")}
								</p>
							</div>
							<Badge className={statusColors[request.status]}>
								{request.status}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="text-sm">
								<p>{request.passengerCount} passenger(s)</p>
								{request.quotations.length > 0 && (
									<p className="text-green-600 font-medium mt-1">
										{request.quotations.length} quotation(s) received
									</p>
								)}
							</div>
							<Button asChild variant="outline">
								<Link href={`/dashboard/requests/${request.id}`}>
									View Details
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

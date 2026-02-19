"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function TripRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const utils = api.useUtils();
	const { data: request, isLoading } = api.tripRequest.getById.useQuery({
		id: requestId,
	});

	const acceptQuotation = api.quotation.accept.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getById.invalidate({ id: requestId });
			await utils.tripRequest.getMyRequests.invalidate();
		},
	});

	const rejectQuotation = api.quotation.reject.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getById.invalidate({ id: requestId });
			await utils.tripRequest.getMyRequests.invalidate();
		},
	});

	if (isLoading) return <div>Loading...</div>;
	if (!request) return <div>Not found</div>;

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				Back
			</Button>

			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<CardTitle className="text-2xl">{request.destination}</CardTitle>
						<Badge>{request.status}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Start Date</p>
							<p className="font-medium">
								{format(new Date(request.startDate), "PPP")}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">End Date</p>
							<p className="font-medium">
								{format(new Date(request.endDate), "PPP")}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Passengers</p>
							<p className="font-medium">{request.passengerCount}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Created</p>
							<p className="font-medium">
								{format(new Date(request.createdAt), "PPP")}
							</p>
						</div>
					</div>
					{request.description && (
						<div>
							<p className="text-sm text-muted-foreground">Description</p>
							<p className="mt-1">{request.description}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{request.quotations.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold">Quotations</h2>
					{request.quotations.map((quotation) => (
						<Card key={quotation.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<CardTitle>
										{quotation.currency} {quotation.price.toString()}
									</CardTitle>
									<Badge>{quotation.status}</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{quotation.description && (
									<div>
										<p className="text-sm text-muted-foreground">Description</p>
										<p className="mt-1">{quotation.description}</p>
									</div>
								)}
								{quotation.validUntil && (
									<p className="text-sm text-muted-foreground">
										Valid until:{" "}
										{format(new Date(quotation.validUntil), "PPP")}
									</p>
								)}
								{quotation.status === "SENT" && (
									<div className="flex gap-2">
										<Button
											onClick={() => acceptQuotation.mutate({ id: quotation.id })}
											disabled={acceptQuotation.isPending}
										>
											Accept Quotation
										</Button>
										<Button
											variant="destructive"
											onClick={() => rejectQuotation.mutate({ id: quotation.id })}
											disabled={rejectQuotation.isPending}
										>
											Reject
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

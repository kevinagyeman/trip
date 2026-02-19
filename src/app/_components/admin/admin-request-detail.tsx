"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CreateQuotationForm } from "./create-quotation-form";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const utils = api.useUtils();
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data: request, isLoading } =
		api.tripRequest.getByIdAdmin.useQuery({ id: requestId });

	const updateStatus = api.tripRequest.updateStatus.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	const sendQuotation = api.quotation.send.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
		},
	});

	const deleteQuotation = api.quotation.delete.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
		},
	});

	if (isLoading) return <div>Loading...</div>;
	if (!request) return <div>Not found</div>;

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				Back to Dashboard
			</Button>

			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">{request.destination}</CardTitle>
							<p className="text-sm text-muted-foreground">
								Requested by: {request.user.name || request.user.email}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Select
								value={request.status}
								onValueChange={(value) =>
									updateStatus.mutate({
										id: requestId,
										status: value as TripRequestStatus,
									})
								}
							>
								<SelectTrigger className="w-[150px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="QUOTED">Quoted</SelectItem>
									<SelectItem value="ACCEPTED">Accepted</SelectItem>
									<SelectItem value="REJECTED">Rejected</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
									<SelectItem value="CANCELLED">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
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

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">Quotations</h2>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>Create Quotation</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Quotation</DialogTitle>
							</DialogHeader>
							<CreateQuotationForm
								tripRequestId={requestId}
								onSuccess={() => setDialogOpen(false)}
							/>
						</DialogContent>
					</Dialog>
				</div>

				{request.quotations.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							No quotations yet.
						</CardContent>
					</Card>
				) : (
					request.quotations.map((quotation) => (
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
								{quotation.internalNotes && (
									<div>
										<p className="text-sm text-muted-foreground">
											Internal Notes
										</p>
										<p className="mt-1 text-sm">{quotation.internalNotes}</p>
									</div>
								)}
								{quotation.validUntil && (
									<p className="text-sm">
										Valid until:{" "}
										{format(new Date(quotation.validUntil), "PPP")}
									</p>
								)}
								<div className="flex gap-2">
									{quotation.status === "DRAFT" && (
										<>
											<Button
												onClick={() =>
													sendQuotation.mutate({ id: quotation.id })
												}
												disabled={sendQuotation.isPending}
											>
												Send to Customer
											</Button>
											<Button
												variant="destructive"
												onClick={() =>
													deleteQuotation.mutate({ id: quotation.id })
												}
												disabled={deleteQuotation.isPending}
											>
												Delete Draft
											</Button>
										</>
									)}
									{quotation.sentAt && (
										<p className="text-sm text-muted-foreground">
											Sent: {format(new Date(quotation.sentAt), "PPP")}
										</p>
									)}
									{quotation.respondedAt && (
										<p className="text-sm text-muted-foreground">
											Responded: {format(new Date(quotation.respondedAt), "PPP")}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}

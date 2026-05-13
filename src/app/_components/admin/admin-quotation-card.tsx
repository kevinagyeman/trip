"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AdminQuotationCard({ requestId }: { requestId: string }) {
	const t = useTranslations("adminDetail");
	const utils = api.useUtils();

	const { data: request } = api.tripRequest.getByIdAdmin.useQuery({
		id: requestId,
	});

	const [confirmOpen, setConfirmOpen] = useState(false);

	const invalidate = async () => {
		await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
	};

	const confirmTrip = api.tripRequest.confirmByAdmin.useMutation({
		onSuccess: async () => {
			setConfirmOpen(false);
			await invalidate();
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	const requestDepartureDetails =
		api.tripRequest.requestDepartureDetails.useMutation({
			onSuccess: invalidate,
		});

	if (!request) return null;

	const quotation = request.quotations[0];
	const isQuotationAccepted = quotation?.status === "ACCEPTED";
	const isQuotationRejected = quotation?.status === "REJECTED";
	const isQuotationSent = !!quotation?.notifiedAt;

	const estimateNotice = (() => {
		try {
			const n = JSON.parse(request.company?.estimateNotice ?? "{}") as Record<
				string,
				string
			>;
			return n[request.language] ?? n.en ?? "";
		} catch {
			return "";
		}
	})();

	return (
		<SectionCard
			title={
				<div className="flex items-center gap-2">
					<span>{t("quotation")}</span>
					{quotation && (
						<Badge
							className={
								isQuotationAccepted
									? "bg-green-500"
									: isQuotationRejected
										? "bg-red-500"
										: isQuotationSent
											? "bg-blue-500"
											: "bg-muted text-muted-foreground"
							}
						>
							{isQuotationAccepted
								? t("statusAccepted")
								: isQuotationRejected
									? t("statusRejected")
									: isQuotationSent
										? t("quotationSentLabel")
										: t("quotationDraftLabel")}
						</Badge>
					)}
				</div>
			}
			contentClassName="space-y-4 pt-0"
		>
			{isQuotationAccepted ? (
				<>
					<div className="flex items-start justify-between">
						<div>
							<p className="text-2xl font-bold">
								{quotation!.currency} {quotation!.price.toString()}
							</p>
							{quotation!.isPriceEachWay && (
								<p className="text-sm text-muted-foreground">
									{t("priceEachWay")}
								</p>
							)}
						</div>
					</div>
					{quotation!.quotationAdditionalInfo && (
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								{t("additionalInfoCustomer")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-sm">
								{quotation!.quotationAdditionalInfo}
							</p>
						</div>
					)}
					{request.status !== "CONFIRMED" && (
						<div className="flex flex-wrap items-start gap-3">
							<div className="flex flex-col gap-1">
								<LoadingButton
									size="sm"
									variant="outline"
									isLoading={requestDepartureDetails.isPending}
									onClick={() =>
										requestDepartureDetails.mutate({ id: requestId })
									}
								>
									{t("requestDetails")}
								</LoadingButton>
								{request.departureDetailsRequestedAt && (
									<p className="text-xs text-muted-foreground">
										{t("notifiedDate", {
											date: format(
												new Date(request.departureDetailsRequestedAt),
												"d MMM yyyy",
											),
											time: format(
												new Date(request.departureDetailsRequestedAt),
												"HH:mm",
											),
										})}
									</p>
								)}
							</div>
							<Button size="sm" onClick={() => setConfirmOpen(true)}>
								{t("confirmTrip")}
							</Button>
						</div>
					)}
					<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{t("confirmModalTitle")}</DialogTitle>
								<DialogDescription>{t("confirmModalDesc")}</DialogDescription>
							</DialogHeader>
							<DialogFooter className="gap-2">
								<Button variant="outline" onClick={() => setConfirmOpen(false)}>
									{t("confirmModalCancel")}
								</Button>
								<LoadingButton
									isLoading={confirmTrip.isPending}
									onClick={() => confirmTrip.mutate({ id: requestId })}
								>
									{t("confirmModalConfirm")}
								</LoadingButton>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</>
			) : (
				<QuotationForm
					requestId={requestId}
					isRejected={isQuotationRejected}
					quotation={quotation}
					estimateNotice={estimateNotice}
					onSuccess={invalidate}
				/>
			)}
		</SectionCard>
	);
}

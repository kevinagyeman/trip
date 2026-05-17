"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { AppDialog } from "@/app/_components/ui/app-dialog";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
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
						<span
							className={
								isQuotationAccepted
									? "text-green-500"
									: isQuotationRejected
										? "text-red-500"
										: "text-blue-500"
							}
						>
							{isQuotationAccepted
								? t("statusAccepted")
								: isQuotationRejected
									? t("statusRejected")
									: t("quotationSentLabel")}
						</span>
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
								<p className="text-base">{t("priceEachWay")}</p>
							)}
						</div>
					</div>
					{quotation!.quotationAdditionalInfo && (
						<div>
							<p className="text-base text-muted-foreground">
								{t("additionalInfoCustomer")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-base">
								{quotation!.quotationAdditionalInfo}
							</p>
						</div>
					)}
					{request.status !== "CONFIRMED" && (
						<div className="flex flex-wrap items-start gap-3">
							<Button size="sm" onClick={() => setConfirmOpen(true)}>
								{t("confirmTrip")}
							</Button>
							<div className="flex flex-col gap-1">
								<LoadingButton
									size="sm"
									isLoading={requestDepartureDetails.isPending}
									onClick={() =>
										requestDepartureDetails.mutate({ id: requestId })
									}
								>
									{t("requestDetails")}
								</LoadingButton>
							</div>
						</div>
					)}
					<AppDialog
						open={confirmOpen}
						onOpenChange={setConfirmOpen}
						title={t("confirmModalTitle")}
						onSave={() => confirmTrip.mutate({ id: requestId })}
						isLoading={confirmTrip.isPending}
						saveLabel={t("confirmModalConfirm")}
					>
						<p className="text-muted-foreground">{t("confirmModalDesc")}</p>
					</AppDialog>
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

"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { AppDialog } from "@/app/_components/ui/app-dialog";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import type { QuotationFormValues } from "@/lib/schemas/quotation";
import { api } from "@/trpc/react";
import {
	BellDot,
	CalendarCheck,
	DollarSign,
	FileQuestionMark,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AlertBanner } from "../ui/alert-banner";

const QUOTATION_FORM_ID = "admin-quotation-form";

export function AdminQuotationCard({ requestId }: { requestId: string }) {
	const t = useTranslations("adminDetail");
	const utils = api.useUtils();

	const { data: request } = api.tripRequest.getByIdAdmin.useQuery({
		id: requestId,
	});

	const [quotationOpen, setQuotationOpen] = useState(false);
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

	const saveAndSend = api.quotation.saveAndSend.useMutation({
		onSuccess: async () => {
			setQuotationOpen(false);
			await invalidate();
		},
	});

	const notifyQuotation = api.quotation.notify.useMutation({
		onSuccess: invalidate,
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

	function buildMutationInput(values: QuotationFormValues) {
		return {
			tripRequestId: requestId,
			price: values.price,
			currency: values.currency,
			isPriceEachWay: values.priceType === "each_way",
			areCarSeatsIncluded:
				values.carSeatsStatus === "included"
					? true
					: values.carSeatsStatus === "not_included"
						? false
						: null,
			quotationAdditionalInfo: values.additionalInfo || undefined,
		};
	}

	const isLocked = ["CONFIRMED", "COMPLETED", "CANCELLED"].includes(
		request.status,
	);

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
								{quotation!.price.toString()}{" "}
								<span className="text-sm">{quotation!.currency}</span>
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
					{!isLocked && (
						<div className="flex flex-wrap items-start gap-3">
							<Button
								size="sm"
								onClick={() => setConfirmOpen(true)}
								variant={"success"}
							>
								<CalendarCheck />
								{t("confirmTrip")}
							</Button>
							<LoadingButton
								size="sm"
								isLoading={requestDepartureDetails.isPending}
								onClick={() =>
									requestDepartureDetails.mutate({ id: requestId })
								}
							>
								<FileQuestionMark />
								{t("requestDetails")}
							</LoadingButton>
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
				<>
					{quotation && (
						<>
							<div>
								<p className="text-2xl font-bold">
									{quotation.price.toString()}{" "}
									<span className="text-sm">{quotation.currency}</span>
								</p>
								<p className="text-base">
									{quotation.isPriceEachWay
										? t("priceEachWay")
										: t("priceTypeNotEachWay")}
								</p>
								{quotation.areCarSeatsIncluded !== null && (
									<p className="text-base">
										{quotation.areCarSeatsIncluded
											? t("carSeatsIncluded")
											: t("carSeatsNotIncluded")}
									</p>
								)}
							</div>
							{quotation.quotationAdditionalInfo && (
								<div>
									<p className="text-base text-muted-foreground">
										{t("additionalInfoCustomer")}
									</p>
									<p className="mt-1 whitespace-pre-wrap text-base">
										{quotation.quotationAdditionalInfo}
									</p>
								</div>
							)}
						</>
					)}

					{isQuotationRejected && (
						<AlertBanner
							variant="error"
							title={t("quotationRejectedAdminTitle")}
							description={t("quotationRejectedAdminNotice")}
						/>
					)}

					<div className="flex flex-wrap gap-3">
						<Button size="sm" onClick={() => setQuotationOpen(true)}>
							<DollarSign />
							{quotation ? t("editQuotation") : t("createQuotation")}
						</Button>
						{quotation?.notifiedAt && !isQuotationRejected && (
							<LoadingButton
								size="sm"
								isLoading={notifyQuotation.isPending}
								onClick={() =>
									notifyQuotation.mutate({ tripRequestId: requestId })
								}
							>
								<BellDot />
								{t("resendNotification")}
							</LoadingButton>
						)}
					</div>

					<AppDialog
						open={quotationOpen}
						onOpenChange={setQuotationOpen}
						title={quotation ? t("editQuotation") : t("createQuotation")}
						onSave={() => {
							(
								document.getElementById(
									QUOTATION_FORM_ID,
								) as HTMLFormElement | null
							)?.requestSubmit();
						}}
						isLoading={saveAndSend.isPending}
						saveLabel={t("saveAndNotifyCustomer")}
					>
						<QuotationForm
							formId={QUOTATION_FORM_ID}
							quotation={quotation}
							estimateNotice={estimateNotice}
							onSubmit={(values) =>
								saveAndSend.mutate(buildMutationInput(values))
							}
						/>
					</AppDialog>
				</>
			)}
		</SectionCard>
	);
}

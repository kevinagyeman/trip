"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const quotationSchema = z.object({
	price: z.coerce
		.number({ invalid_type_error: "Price is required" })
		.positive("Price must be greater than 0"),
	isPriceEachWay: z.boolean(),
	areCarSeatsIncluded: z.boolean(),
	additionalInfo: z.string().optional(),
	internalNotes: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

type QuotationData = {
	price: { toNumber: () => number } | number;
	isPriceEachWay: boolean;
	areCarSeatsIncluded: boolean;
	quotationAdditionalInfo: string | null;
	internalNotes: string | null;
	notifiedAt: Date | null;
	status: string;
	respondedAt: Date | null;
};

type Props = {
	requestId: string;
	isRejected: boolean;
	quotation: QuotationData | null | undefined;
	onSuccess: () => void;
};

export function QuotationForm({
	requestId,
	isRejected,
	quotation,
	onSuccess,
}: Props) {
	const t = useTranslations("adminDetail");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<QuotationFormValues>({
		resolver: zodResolver(quotationSchema),
		defaultValues: {
			price: undefined,
			isPriceEachWay: false,
			areCarSeatsIncluded: false,
			additionalInfo: "",
			internalNotes: "",
		},
	});

	useEffect(() => {
		if (quotation) {
			reset({
				price:
					typeof quotation.price === "number"
						? quotation.price
						: quotation.price.toNumber(),
				isPriceEachWay: quotation.isPriceEachWay,
				areCarSeatsIncluded: quotation.areCarSeatsIncluded,
				additionalInfo: quotation.quotationAdditionalInfo ?? "",
				internalNotes: quotation.internalNotes ?? "",
			});
		}
	}, [
		quotation?.price,
		quotation?.isPriceEachWay,
		quotation?.areCarSeatsIncluded,
		quotation?.quotationAdditionalInfo,
		quotation?.internalNotes,
	]);

	const saveQuotation = api.quotation.save.useMutation({ onSuccess });
	const saveAndSend = api.quotation.saveAndSend.useMutation({ onSuccess });
	const notifyQuotation = api.quotation.notify.useMutation({ onSuccess });

	function buildMutationInput(values: QuotationFormValues) {
		return {
			tripRequestId: requestId,
			price: values.price,
			isPriceEachWay: values.isPriceEachWay,
			areCarSeatsIncluded: values.areCarSeatsIncluded,
			quotationAdditionalInfo: values.additionalInfo || undefined,
			internalNotes: values.internalNotes || undefined,
		};
	}

	return (
		<form className="space-y-4">
			{/* Rejected banner */}
			{isRejected && (
				<AlertBanner
					variant="error"
					title={t("quotationStatusRejected")}
					description={
						quotation?.respondedAt
							? format(new Date(quotation.respondedAt), "PPP")
							: undefined
					}
				/>
			)}

			{/* Price */}
			<div className="w-48">
				<CustomInput
					labelText={t("price")}
					inputType="number"
					placeholder={t("pricePlaceholder")}
					inputProps={{ step: "0.01", min: "0", ...register("price") }}
					error={errors.price?.message}
				/>
			</div>

			{/* Checkboxes */}
			<div className="space-y-2">
				<CustomCheckbox
					label={t("isPriceEachWay")}
					inputProps={{ ...register("isPriceEachWay") }}
				/>
				<CustomCheckbox
					label={t("areCarSeatsIncluded")}
					inputProps={{ ...register("areCarSeatsIncluded") }}
				/>
			</div>

			{/* Additional info */}
			<CustomTextArea
				labelText={t("additionalInfoCustomer")}
				placeholder={t("additionalInfoPlaceholder")}
				rows={4}
				textAreaProps={{ ...register("additionalInfo") }}
			/>

			{/* Internal notes */}
			<CustomTextArea
				labelText={t("internalNotes")}
				placeholder={t("internalNotesPlaceholder")}
				rows={2}
				textAreaProps={{ ...register("internalNotes") }}
			/>

			{/* Actions */}
			<div className="flex flex-wrap items-center gap-3">
				<Button
					type="button"
					disabled={saveAndSend.isPending}
					onClick={handleSubmit((values) =>
						saveAndSend.mutate(buildMutationInput(values)),
					)}
				>
					{saveAndSend.isPending
						? t("sending")
						: isRejected
							? t("reviseAndResend")
							: t("saveAndSend")}
				</Button>

				<Button
					type="button"
					variant="outline"
					disabled={saveQuotation.isPending}
					onClick={handleSubmit((values) =>
						saveQuotation.mutate(buildMutationInput(values)),
					)}
				>
					{saveQuotation.isPending ? t("saving") : t("saveQuotation")}
				</Button>

				{quotation?.notifiedAt && !isRejected && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={notifyQuotation.isPending}
						onClick={() => notifyQuotation.mutate({ tripRequestId: requestId })}
					>
						{notifyQuotation.isPending
							? t("notifying")
							: t("resendNotification")}
					</Button>
				)}

				{quotation?.notifiedAt && (
					<p className="text-sm text-muted-foreground">
						{t("notifiedDate", {
							date: format(new Date(quotation.notifiedAt), "PPP"),
						})}
					</p>
				)}
			</div>
		</form>
	);
}

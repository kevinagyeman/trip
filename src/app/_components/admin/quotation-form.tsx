"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currencies";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const quotationSchema = z.object({
	price: z.coerce
		.number({ invalid_type_error: "Price is required" })
		.positive("Price must be greater than 0"),
	currency: z.string(),
	isPriceEachWay: z.boolean(),
	areCarSeatsIncluded: z.boolean(),
	additionalInfo: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

type QuotationData = {
	price: { toNumber: () => number } | number;
	currency: string;
	isPriceEachWay: boolean;
	areCarSeatsIncluded: boolean;
	quotationAdditionalInfo: string | null;
	notifiedAt: Date | null;
	status: string;
	respondedAt: Date | null;
};

type Props = {
	requestId: string;
	isRejected: boolean;
	quotation: QuotationData | null | undefined;
	estimateNotice?: string | null;
	onSuccess: () => void;
};

export function QuotationForm({
	requestId,
	isRejected,
	quotation,
	estimateNotice,
	onSuccess,
}: Props) {
	const t = useTranslations("adminDetail");

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<QuotationFormValues>({
		resolver: zodResolver(quotationSchema),
		defaultValues: {
			price: undefined,
			currency: "EUR",
			isPriceEachWay: false,
			areCarSeatsIncluded: false,
			additionalInfo: estimateNotice ?? "",
		},
	});

	useEffect(() => {
		if (quotation) {
			reset({
				price:
					typeof quotation.price === "object"
						? quotation.price.toNumber()
						: quotation.price,
				currency: quotation.currency ?? "EUR",
				isPriceEachWay: quotation.isPriceEachWay,
				areCarSeatsIncluded: quotation.areCarSeatsIncluded,
				additionalInfo: quotation.quotationAdditionalInfo ?? "",
			});
		}
	}, [
		quotation?.price,
		quotation?.currency,
		quotation?.isPriceEachWay,
		quotation?.areCarSeatsIncluded,
		quotation?.quotationAdditionalInfo,
	]);

	const saveQuotation = api.quotation.save.useMutation({ onSuccess });
	const saveAndSend = api.quotation.saveAndSend.useMutation({ onSuccess });
	const notifyQuotation = api.quotation.notify.useMutation({ onSuccess });

	function buildMutationInput(values: QuotationFormValues) {
		return {
			tripRequestId: requestId,
			price: values.price,
			currency: values.currency,
			isPriceEachWay: values.isPriceEachWay,
			areCarSeatsIncluded: values.areCarSeatsIncluded,
			quotationAdditionalInfo: values.additionalInfo || undefined,
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
							? format(new Date(quotation.respondedAt), "d MMM yyyy")
							: undefined
					}
				/>
			)}

			{/* Price + Currency */}
			<div className="flex items-end gap-2">
				<div className="w-36">
					<CustomInput
						labelText={t("price")}
						inputType="number"
						placeholder={t("pricePlaceholder")}
						inputProps={{ step: "0.01", min: "0", ...register("price") }}
						error={errors.price?.message}
					/>
				</div>
				<Controller
					name="currency"
					control={control}
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger className="w-[110px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{CURRENCIES.map((c) => (
									<SelectItem key={c.value} value={c.value}>
										{c.value}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
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
				rows={4}
				textAreaProps={{ ...register("additionalInfo") }}
			/>

			{/* Actions */}
			<div className="flex flex-wrap items-center gap-3">
				<LoadingButton
					type="button"
					size="sm"
					variant={"default"}
					isLoading={saveAndSend.isPending}
					onClick={handleSubmit((values) =>
						saveAndSend.mutate(buildMutationInput(values)),
					)}
				>
					{isRejected ? t("reviseAndResend") : t("saveAndSend")}
				</LoadingButton>

				<LoadingButton
					type="button"
					isLoading={saveQuotation.isPending}
					onClick={handleSubmit((values) =>
						saveQuotation.mutate(buildMutationInput(values)),
					)}
				></LoadingButton>

				{quotation?.notifiedAt && !isRejected && (
					<LoadingButton
						type="button"
						size="sm"
						isLoading={notifyQuotation.isPending}
						onClick={() => notifyQuotation.mutate({ tripRequestId: requestId })}
					>
						{t("resendNotification")}
					</LoadingButton>
				)}

				{quotation?.notifiedAt && (
					<p className="text-sm text-muted-foreground">
						{t("notifiedDate", {
							date: format(new Date(quotation.notifiedAt), "d MMM yyyy"),
							time: format(new Date(quotation.notifiedAt), "HH:mm"),
						})}
					</p>
				)}
			</div>
		</form>
	);
}

"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
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
import {
	quotationSchema,
	type QuotationFormValues,
} from "@/lib/schemas/quotation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

type QuotationData = {
	price: { toNumber: () => number } | number;
	currency: string;
	isPriceEachWay: boolean;
	areCarSeatsIncluded: boolean | null;
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

	function buildDefaultValues() {
		if (quotation) {
			return {
				price:
					typeof quotation.price === "object"
						? quotation.price.toNumber()
						: quotation.price,
				currency: quotation.currency ?? "EUR",
				priceType: (quotation.isPriceEachWay
					? "each_way"
					: "not_each_way") as QuotationFormValues["priceType"],
				carSeatsStatus: (quotation.areCarSeatsIncluded === true
					? "included"
					: quotation.areCarSeatsIncluded === false
						? "not_included"
						: "not_applicable") as QuotationFormValues["carSeatsStatus"],
				additionalInfo: quotation.quotationAdditionalInfo ?? "",
			};
		}
		return {
			price: undefined,
			currency: "EUR",
			priceType: undefined,
			carSeatsStatus: undefined,
			additionalInfo: estimateNotice ?? "",
		};
	}

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<QuotationFormValues>({
		resolver: zodResolver(quotationSchema),
		defaultValues: buildDefaultValues(),
	});

	useEffect(() => {
		reset(buildDefaultValues());
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	return (
		<form className="space-y-4">
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

			{/* Price type */}
			<Controller
				name="priceType"
				control={control}
				render={({ field }) => (
					<CustomSelect
						labelText={t("priceTypeLabel")}
						placeholder={t("priceTypePlaceholder")}
						value={field.value ?? ""}
						options={[
							{ value: "each_way", label: t("priceTypeEachWay") },
							{ value: "not_each_way", label: t("priceTypeNotEachWay") },
						]}
						onValueChange={field.onChange}
						error={errors.priceType?.message}
					/>
				)}
			/>

			{/* Car seats */}
			<Controller
				name="carSeatsStatus"
				control={control}
				render={({ field }) => (
					<CustomSelect
						labelText={t("carSeatsStatusLabel")}
						placeholder={t("carSeatsStatusPlaceholder")}
						value={field.value ?? ""}
						options={[
							{ value: "included", label: t("carSeatsIncluded") },
							{ value: "not_included", label: t("carSeatsNotIncluded") },
							{ value: "not_applicable", label: t("carSeatsNotApplicable") },
						]}
						onValueChange={field.onChange}
						error={errors.carSeatsStatus?.message}
					/>
				)}
			/>

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
			</div>
		</form>
	);
}

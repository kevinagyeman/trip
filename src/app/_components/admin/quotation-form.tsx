"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
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
	quotation: QuotationData | null | undefined;
	estimateNotice?: string | null;
	formId: string;
	onSubmit: (values: QuotationFormValues) => void;
};

export function QuotationForm({
	quotation,
	estimateNotice,
	formId,
	onSubmit,
}: Props) {
	const t = useTranslations("adminDetail");
	const params = useParams<{ locale: string }>();

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

	return (
		<form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
			{/* Price + Currency */}
			<div className="flex items-end gap-2">
				<div className="flex-1">
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
			<div className="space-y-1">
				<CustomTextArea
					labelText={t("additionalInfoCustomer")}
					rows={4}
					textAreaProps={{ ...register("additionalInfo") }}
				/>
				<Link
					href={`/${params.locale}/admin/settings#estimate-notice`}
					target="_blank"
					className="text-xs text-muted-foreground underline underline-offset-3"
				>
					{t("editPrefilledMessage")}
				</Link>
			</div>
		</form>
	);
}

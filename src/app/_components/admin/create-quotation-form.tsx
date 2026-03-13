"use client";

import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	createQuotationSchema,
	type CreateQuotationFormValues,
} from "@/lib/schemas/quotation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const DEFAULT_ADDITIONAL_INFO = ``;

interface CreateQuotationFormProps {
	tripRequestId: string;
}

export function CreateQuotationForm({
	tripRequestId,
}: CreateQuotationFormProps) {
	const router = useRouter();
	const utils = api.useUtils();
	const t = useTranslations("quotation");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateQuotationFormValues>({
		resolver: zodResolver(createQuotationSchema),
		defaultValues: {
			isPriceEachWay: false,
			areCarSeatsIncluded: false,
			quotationAdditionalInfo: DEFAULT_ADDITIONAL_INFO,
			internalNotes: "",
		},
	});

	const createQuotation = api.quotation.create.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: tripRequestId });
			router.push(`/admin/requests/${tripRequestId}`);
		},
	});

	const onSubmit = (values: CreateQuotationFormValues) => {
		createQuotation.mutate({
			tripRequestId,
			price: values.price,
			currency: "EUR",
			isPriceEachWay: values.isPriceEachWay,
			areCarSeatsIncluded: values.areCarSeatsIncluded,
			quotationAdditionalInfo: values.quotationAdditionalInfo || undefined,
			internalNotes: values.internalNotes || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="w-48">
				<CustomInput
					labelText={t("price")}
					inputType="number"
					placeholder={t("pricePlaceholder")}
					error={errors.price?.message}
					inputProps={{ ...register("price"), step: "0.01", min: "0" }}
				/>
			</div>

			<CustomCheckbox
				label={t("isPriceEachWay")}
				inputProps={{ ...register("isPriceEachWay") }}
			/>

			<CustomCheckbox
				label={t("areCarSeatsIncluded")}
				inputProps={{ ...register("areCarSeatsIncluded") }}
			/>

			<div>
				<Label>{t("additionalInfo")}</Label>
				<Textarea
					{...register("quotationAdditionalInfo")}
					placeholder={t("additionalInfoPlaceholder")}
					rows={8}
				/>
			</div>

			<div>
				<Label>{t("internalNotes")}</Label>
				<Textarea
					{...register("internalNotes")}
					placeholder={t("internalNotesPlaceholder")}
					rows={3}
				/>
			</div>

			<Button
				type="submit"
				disabled={createQuotation.isPending}
				className="w-full"
			>
				{createQuotation.isPending ? t("creating") : t("createButton")}
			</Button>

			{createQuotation.error && (
				<p className="text-sm text-destructive">
					{createQuotation.error.message}
				</p>
			)}
		</form>
	);
}

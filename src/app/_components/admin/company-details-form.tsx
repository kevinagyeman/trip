"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { COUNTRIES } from "@/lib/countries";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type CompanyDetailsValues = {
	name: string;
	vat: string;
	address: string;
	country: string;
	website: string;
};

export function CompanyDetailsForm({
	initialValues,
}: {
	initialValues: {
		name: string;
		vat?: string | null;
		address?: string | null;
		country?: string | null;
		website?: string | null;
	};
}) {
	const t = useTranslations("settings");
	const [success, setSuccess] = useState(false);

	const { register, handleSubmit, watch, setValue, reset } =
		useForm<CompanyDetailsValues>({
			defaultValues: {
				name: initialValues.name,
				vat: initialValues.vat ?? "",
				address: initialValues.address ?? "",
				country: initialValues.country ?? "",
				website: initialValues.website ?? "",
			},
		});

	useEffect(() => {
		reset({
			name: initialValues.name,
			vat: initialValues.vat ?? "",
			address: initialValues.address ?? "",
			country: initialValues.country ?? "",
			website: initialValues.website ?? "",
		});
	}, [initialValues.name]);

	const updateMyCompany = api.company.updateMyCompany.useMutation({
		onSuccess: () => setSuccess(true),
		onError: () => setSuccess(false),
	});

	const onSubmit = (values: CompanyDetailsValues) => {
		setSuccess(false);
		updateMyCompany.mutate(values);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
			<CustomInput
				labelText={t("companyName")}
				inputProps={{
					...register("name"),
					readOnly: true,
					disabled: true,
				}}
			/>
			<CustomInput
				labelText={t("vat")}
				inputProps={{
					...register("vat"),
					readOnly: true,
					disabled: true,
				}}
			/>
			<CustomInput
				labelText={t("address")}
				placeholder={t("addressPlaceholder")}
				inputProps={{ ...register("address") }}
			/>
			<CustomSelect
				labelText={t("country")}
				placeholder={t("countryPlaceholder")}
				value={watch("country")}
				onValueChange={(v) => setValue("country", v)}
				options={COUNTRIES.map((c) => ({ value: c, label: c }))}
			/>
			<CustomInput
				labelText={t("website")}
				inputType="url"
				placeholder="https://yourcompany.com"
				inputProps={{ ...register("website") }}
			/>
			{updateMyCompany.error && (
				<p className="text-sm text-destructive">
					{updateMyCompany.error.message}
				</p>
			)}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("saved")}
				</p>
			)}
			<LoadingButton type="submit" isLoading={updateMyCompany.isPending} />
		</form>
	);
}

"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { COUNTRIES } from "@/lib/countries";
import { CURRENCIES } from "@/lib/currencies";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type CompanyDetailsValues = {
	name: string;
	vat: string;
	phoneCountryCode: string;
	phoneNumber: string;
	address: string;
	country: string;
	website: string;
	brandColor: string;
	logoUrl: string;
	coverPhotoUrl: string;
	currency: string;
};

export function CompanyDetailsForm({
	initialValues,
}: {
	initialValues: {
		name: string;
		vat?: string | null;
		phone?: string | null;
		address?: string | null;
		country?: string | null;
		website?: string | null;
		brandColor?: string | null;
		logoUrl?: string | null;
		coverPhotoUrl?: string | null;
		currency?: string | null;
	};
}) {
	const t = useTranslations("settings");
	const [success, setSuccess] = useState(false);

	const { register, handleSubmit, watch, setValue, reset } =
		useForm<CompanyDetailsValues>({
			defaultValues: {
				name: initialValues.name,
				vat: initialValues.vat ?? "",
				phoneCountryCode:
					initialValues.phone?.match(/^(\+\d+)\s/)?.[1] ?? "+39",
				phoneNumber: initialValues.phone?.match(/^(\+\d+)\s(.+)$/)?.[2] ?? "",
				address: initialValues.address ?? "",
				country: initialValues.country ?? "",
				website: initialValues.website ?? "",
				brandColor: initialValues.brandColor ?? "#000000",
				logoUrl: initialValues.logoUrl ?? "",
				coverPhotoUrl: initialValues.coverPhotoUrl ?? "",
				currency: initialValues.currency ?? "EUR",
			},
		});

	useEffect(() => {
		reset({
			name: initialValues.name,
			vat: initialValues.vat ?? "",
			phoneCountryCode: initialValues.phone?.match(/^(\+\d+)\s/)?.[1] ?? "+39",
			phoneNumber: initialValues.phone?.match(/^(\+\d+)\s(.+)$/)?.[2] ?? "",
			address: initialValues.address ?? "",
			country: initialValues.country ?? "",
			website: initialValues.website ?? "",
			brandColor: initialValues.brandColor ?? "#000000",
			logoUrl: initialValues.logoUrl ?? "",
			coverPhotoUrl: initialValues.coverPhotoUrl ?? "",
			currency: initialValues.currency ?? "EUR",
		});
	}, [initialValues.name]);

	const updateMyCompany = api.company.updateMyCompany.useMutation({
		onSuccess: () => setSuccess(true),
		onError: () => setSuccess(false),
	});

	const onSubmit = (values: CompanyDetailsValues) => {
		setSuccess(false);
		const { phoneCountryCode, phoneNumber, ...rest } = values;
		const phone = phoneNumber ? `${phoneCountryCode} ${phoneNumber}` : "";
		updateMyCompany.mutate({ ...rest, phone });
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
			<PhoneInput
				labelText={t("phone")}
				countryCode={watch("phoneCountryCode")}
				onCountryCodeChange={(v) => setValue("phoneCountryCode", v)}
				phoneNumber={watch("phoneNumber")}
				onPhoneNumberChange={(v) => setValue("phoneNumber", v)}
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
				options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
			/>
			<CustomSelect
				labelText={t("currency")}
				placeholder={t("currencyPlaceholder")}
				value={watch("currency")}
				onValueChange={(v) => setValue("currency", v)}
				options={CURRENCIES}
			/>
			<CustomInput
				labelText={t("website")}
				inputType="url"
				placeholder="https://yourcompany.com"
				inputProps={{ ...register("website") }}
			/>
			<CustomInput
				labelText={t("logoUrl")}
				inputType="url"
				placeholder="https://yourcompany.com/logo.png"
				inputProps={{ ...register("logoUrl") }}
			/>
			{watch("logoUrl") && (
				<div className="mx-auto w-fit rounded-xl border p-4 bg-white">
					<Image
						src={watch("logoUrl")}
						alt="Logo preview"
						width={200}
						height={80}
						unoptimized
						className="h-20 object-contain"
					/>
				</div>
			)}
			<CustomInput
				labelText={t("coverPhotoUrl")}
				inputType="url"
				placeholder="https://yourcompany.com/cover.jpg"
				inputProps={{ ...register("coverPhotoUrl") }}
				hint={t("coverPhotoUrlHint")}
			/>
			{watch("coverPhotoUrl") && (
				<div className="relative w-full overflow-hidden rounded-xl aspect-[16/9] border">
					<Image
						src={watch("coverPhotoUrl")}
						alt="Cover preview"
						fill
						unoptimized
						className="object-cover"
					/>
				</div>
			)}
			<div className="space-y-2">
				<label className="text-sm font-medium">{t("brandColor")}</label>
				<div className="flex items-center gap-3">
					<input
						type="color"
						value={watch("brandColor")}
						onChange={(e) => setValue("brandColor", e.target.value)}
						className="h-10 w-16 cursor-pointer rounded-md border border-input bg-transparent p-1"
					/>
					<input
						type="text"
						{...register("brandColor")}
						className="h-10 w-28 rounded-md border border-input bg-transparent px-3 font-mono text-sm"
						placeholder="#000000"
						maxLength={7}
					/>
				</div>
			</div>
			{updateMyCompany.error && (
				<p className="text-sm text-destructive">
					{updateMyCompany.error.message}
				</p>
			)}
			<LoadingButton type="submit" isLoading={updateMyCompany.isPending} />
		</form>
	);
}

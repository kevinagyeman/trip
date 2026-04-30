"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import CustomInput from "@/app/_components/ui/custom-input";
import {
	registerCompanySchema,
	type RegisterCompanyFormValues,
} from "@/lib/schemas/auth";
import { COUNTRIES } from "@/lib/countries";

export function RegisterCompanyForm() {
	const t = useTranslations("registerCompany");
	const locale = useLocale();
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterCompanyFormValues>({
		resolver: zodResolver(registerCompanySchema),
	});

	const onSubmit = async (values: RegisterCompanyFormValues) => {
		setServerError("");
		try {
			const response = await fetch("/api/auth/register-company", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...values, locale }),
			});
			const data = await response.json();
			if (!response.ok) {
				setServerError(data.error || t("error"));
			} else {
				router.push("/register-company/pending");
			}
		} catch {
			setServerError(t("unexpectedError"));
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{t("title")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Company Information */}
				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("companySection")}
					</p>

					<CustomInput
						labelText={`${t("companyName")} *`}
						inputType="text"
						placeholder={t("companyNamePlaceholder")}
						error={errors.companyName?.message}
						inputProps={{ ...register("companyName"), disabled: isSubmitting }}
					/>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<CustomInput
							labelText={`${t("slug")} *`}
							inputType="text"
							placeholder={t("slugPlaceholder")}
							error={errors.slug?.message}
							inputProps={{ ...register("slug"), disabled: isSubmitting }}
						/>
						<CustomInput
							labelText={`${t("vat")} *`}
							inputType="text"
							placeholder={t("vatPlaceholder")}
							error={errors.vat?.message}
							inputProps={{ ...register("vat"), disabled: isSubmitting }}
						/>
					</div>
					<p className="text-xs text-muted-foreground">{t("slugHint")}</p>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<CustomInput
							labelText={`${t("address")} *`}
							inputType="text"
							placeholder={t("addressPlaceholder")}
							error={errors.address?.message}
							inputProps={{ ...register("address"), disabled: isSubmitting }}
						/>
						<div className="space-y-1">
							<label className="text-sm font-medium">{t("country")} *</label>
							<select
								{...register("country")}
								disabled={isSubmitting}
								className="w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
							>
								<option value="">{t("countryPlaceholder")}</option>
								{COUNTRIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
							{errors.country && (
								<p className="text-xs text-destructive">
									{errors.country.message}
								</p>
							)}
						</div>
					</div>

					<CustomInput
						labelText={t("website")}
						inputType="url"
						placeholder="https://yourcompany.com"
						error={errors.website?.message}
						inputProps={{ ...register("website"), disabled: isSubmitting }}
					/>
				</div>

				{/* Admin Account */}
				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("accountSection")}
					</p>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<CustomInput
							labelText={`${t("fullName")} *`}
							inputType="text"
							placeholder={t("fullNamePlaceholder")}
							error={errors.fullName?.message}
							inputProps={{ ...register("fullName"), disabled: isSubmitting }}
						/>
						<CustomInput
							labelText={`${t("email")} *`}
							inputType="email"
							placeholder="you@company.com"
							error={errors.email?.message}
							inputProps={{ ...register("email"), disabled: isSubmitting }}
						/>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<CustomInput
							labelText={`${t("password")} *`}
							inputType="password"
							error={errors.password?.message}
							inputProps={{ ...register("password"), disabled: isSubmitting }}
						/>
						<CustomInput
							labelText={`${t("confirmPassword")} *`}
							inputType="password"
							error={errors.confirmPassword?.message}
							inputProps={{
								...register("confirmPassword"),
								disabled: isSubmitting,
							}}
						/>
					</div>
				</div>

				{/* Privacy policy */}
				<div className="space-y-1">
					<label className="flex items-start gap-2 text-sm">
						<input
							type="checkbox"
							className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
							disabled={isSubmitting}
							{...register("privacyAccepted")}
						/>
						<span className="text-muted-foreground">
							{t("privacyAccept")}{" "}
							<a
								href="https://www.iubenda.com/privacy-policy/61494361"
								className="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed text-primary hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								Privacy Policy
							</a>
						</span>
					</label>
					{errors.privacyAccepted && (
						<p className="text-xs text-destructive">{t("privacyMustAccept")}</p>
					)}
				</div>

				{serverError && (
					<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
						{serverError}
					</div>
				)}

				<LoadingButton
					type="submit"
					className="w-full"
					isLoading={isSubmitting}
				>
					{t("register")}
				</LoadingButton>

				<p className="text-center text-sm text-muted-foreground">
					{t("alreadyHaveAccount")}{" "}
					<Link href="/auth/signin" className="text-primary hover:underline">
						{t("signIn")}
					</Link>
				</p>
			</form>
		</div>
	);
}

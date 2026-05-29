"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PageCenter } from "@/app/_components/ui/page-center";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signInSchema, type SignInFormValues } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Zap } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawCallback = searchParams.get("callbackUrl");
	const verified = searchParams.get("verified") === "true";
	const registered = searchParams.get("registered") === "true";
	const t = useTranslations("auth");
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (values: SignInFormValues) => {
		setServerError("");
		try {
			const result = await signIn("credentials", {
				email: values.email,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				setServerError(
					result.error.includes("verify")
						? t("verifyEmail")
						: t("invalidCredentials"),
				);
			} else if (result?.ok) {
				if (rawCallback?.startsWith("/")) {
					router.push(rawCallback);
				} else {
					const session = await getSession();
					const role = session?.user?.role;
					const dest =
						role === "ADMIN" || role === "SUPER_ADMIN"
							? "/admin"
							: "/dashboard";
					router.push(dest);
				}
				router.refresh();
			}
		} catch {
			setServerError(t("unexpectedError"));
		}
	};

	return (
		<PageCenter>
			<div className="w-full max-w-sm">
				<div className="mb-8">
					<h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("signInSubtitle")}
					</p>
				</div>

				{verified && (
					<div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
						<p className="text-sm text-green-800">{t("emailVerified")}</p>
					</div>
				)}
				{registered && (
					<div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
						<p className="text-sm text-blue-800">{t("registrationSuccess")}</p>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<CustomInput
						labelText={t("email")}
						inputType="email"
						placeholder="your@email.com"
						error={errors.email?.message}
						inputProps={{ ...register("email"), disabled: isSubmitting }}
					/>

					<CustomInput
						labelText={t("password")}
						inputType="password"
						placeholder="Password"
						error={errors.password?.message}
						inputProps={{ ...register("password"), disabled: isSubmitting }}
					/>

					{serverError && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{serverError}
						</div>
					)}

					<LoadingButton
						type="submit"
						variant={"default"}
						className="w-full"
						isLoading={isSubmitting}
					>
						{t("signIn")} <LogIn />
					</LoadingButton>
					<div className="text-center text-sm">
						<Link
							href="/auth/forgot-password"
							className="text-muted-foreground hover:underline"
						>
							{t("forgotPasswordLink")}
						</Link>
					</div>

					<div className="rounded-lg border p-4 text-center text-sm">
						<p className="mb-2 text-muted-foreground">{t("isYourCompany")}</p>
						<Button
							variant="secondary"
							className="w-full"
							type="button"
							asChild
						>
							<Link href="/register-company">
								<Zap /> {t("registerCompanyLink")}
							</Link>
						</Button>
					</div>
				</form>
			</div>
		</PageCenter>
	);
}

export default function SignInPage() {
	return (
		<Suspense>
			<SignInForm />
		</Suspense>
	);
}

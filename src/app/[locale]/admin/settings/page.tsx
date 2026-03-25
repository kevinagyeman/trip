import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/app/_components/admin/change-password-form";
import { ChangeEmailForm } from "@/app/_components/admin/change-email-form";

export default async function AdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (!session?.user) redirect("/");
	if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
		redirect("/dashboard");
	}

	const t = await getTranslations("settings");

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
			<div className="flex flex-col gap-6 max-w-lg">
				<Card>
					<CardHeader>
						<CardTitle>{t("changeEmailTitle")}</CardTitle>
					</CardHeader>
					<CardContent>
						<ChangeEmailForm currentEmail={session.user.email ?? ""} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>{t("changePasswordTitle")}</CardTitle>
					</CardHeader>
					<CardContent>
						<ChangePasswordForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

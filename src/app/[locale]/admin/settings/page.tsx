import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { env } from "@/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/app/_components/admin/change-password-form";
import { ChangeEmailForm } from "@/app/_components/admin/change-email-form";
import { ChangeLanguageForm } from "@/app/_components/admin/change-language-form";
import { BookingLinkCard } from "@/app/_components/admin/booking-link-card";
import { EstimateNoticeForm } from "@/app/_components/admin/estimate-notice-form";
import { DriversManager } from "@/app/_components/admin/drivers-manager";

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

	const [dbUser, company] = await Promise.all([
		db.user.findUnique({
			where: { id: session.user.id },
			select: { preferredLanguage: true },
		}),
		session.user.companyId
			? db.company.findUnique({
					where: { id: session.user.companyId },
					select: { slug: true, estimateNotice: true },
				})
			: null,
	]);

	const bookingUrl = company?.slug
		? `${env.APP_URL}/book/${company.slug}`
		: null;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
			<div className="flex flex-col gap-6 max-w-lg">
				{bookingUrl && <BookingLinkCard url={bookingUrl} />}
				<Card>
					<CardContent className="pt-6">
						<DriversManager />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>{t("languageTitle")}</CardTitle>
					</CardHeader>
					<CardContent>
						<ChangeLanguageForm
							currentLanguage={dbUser?.preferredLanguage ?? "en"}
						/>
					</CardContent>
				</Card>
				{company && (
					<Card>
						<CardHeader>
							<CardTitle>{t("estimateNoticeTitle")}</CardTitle>
						</CardHeader>
						<CardContent>
							<EstimateNoticeForm currentValue={company.estimateNotice ?? ""} />
						</CardContent>
					</Card>
				)}
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

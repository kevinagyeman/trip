import { BookingLinkCard } from "@/app/_components/admin/booking-link-card";
import { ChangeEmailForm } from "@/app/_components/admin/change-email-form";
import { ChangeLanguageForm } from "@/app/_components/admin/change-language-form";
import { ChangePasswordForm } from "@/app/_components/admin/change-password-form";
import { DriversManager } from "@/app/_components/admin/drivers-manager";
import { EstimateNoticeForm } from "@/app/_components/admin/estimate-notice-form";
import { SectionCard } from "@/app/_components/ui/section-card";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

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
				{session.user.role !== "SUPER_ADMIN" && <DriversManager />}
				<SectionCard title={t("languageTitle")}>
					<ChangeLanguageForm
						currentLanguage={dbUser?.preferredLanguage ?? "en"}
					/>
				</SectionCard>
				{company && (
					<SectionCard title={t("estimateNoticeTitle")}>
						<EstimateNoticeForm currentValue={company.estimateNotice ?? ""} />
					</SectionCard>
				)}
				<SectionCard title={t("changeEmailTitle")} subtitle={t("emailNotice")}>
					<ChangeEmailForm currentEmail={session.user.email ?? ""} />
				</SectionCard>
				<SectionCard title={t("changePasswordTitle")}>
					<ChangePasswordForm />
				</SectionCard>
			</div>
		</div>
	);
}

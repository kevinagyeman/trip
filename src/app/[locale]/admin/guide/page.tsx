import { GuideBookingLink } from "@/app/_components/admin/guide-booking-link";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function GuidePage() {
	const session = await auth();
	if (!session?.user) redirect("/");
	const role = session.user.role;
	if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

	const t = await getTranslations("guide");

	const company = session.user.companyId
		? await db.company.findUnique({
				where: { id: session.user.companyId },
				select: { slug: true },
			})
		: null;
	const bookingUrl = company?.slug
		? `${env.APP_URL}/book/${company.slug}`
		: null;

	return (
		<div className="container mx-auto max-w-3xl px-4 py-10">
			<h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
			<p className="mb-10 text-muted-foreground">{t("subtitle")}</p>

			<div className="space-y-10">
				{/* 1. Overview */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s1Title")}</h2>
					<p className="text-sm text-muted-foreground">{t("s1Body")}</p>
				</section>

				{/* 2. Customer Flow */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s2Title")}</h2>
					<ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
						<li>
							{t("s2Step1")}
							{bookingUrl && (
								<div className="mt-2 ml-4">
									<p className="text-xs text-muted-foreground mb-1">
										{t("yourBookingLink")}
									</p>
									<GuideBookingLink url={bookingUrl} />
								</div>
							)}
						</li>
						<li>{t("s2Step2")}</li>
						<li>{t("s2Step3")}</li>
						<li>{t("s2Step4")}</li>
						<li>{t("s2Step5")}</li>
					</ol>
				</section>

				{/* 3. Admin Flow */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s3Title")}</h2>
					<ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
						<li>{t("s3Step1")}</li>
						<li>{t("s3Step2")}</li>
						<li>{t("s3Step3")}</li>
						<li>{t("s3Step4")}</li>
						<li>{t("s3Step5")}</li>
					</ol>
				</section>

				{/* 4. Statuses */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s4Title")}</h2>
					<div className="space-y-2 text-sm">
						{(
							[
								"PENDING",
								"QUOTED",
								"ACCEPTED",
								"CONFIRMED",
								"COMPLETED",
								"REJECTED",
								"CANCELLED",
							] as const
						).map((status) => (
							<div key={status} className="flex gap-2">
								<span className="font-mono font-medium w-24 shrink-0">
									{status}
								</span>
								<span className="text-muted-foreground">
									{t(`status${status}`)}
								</span>
							</div>
						))}
					</div>
				</section>

				{/* 5. Emails */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s5Title")}</h2>
					<ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
						<li>{t("s5Email1")}</li>
						<li>{t("s5Email2")}</li>
						<li>{t("s5Email3")}</li>
						<li>{t("s5Email4")}</li>
						<li>{t("s5Email5")}</li>
					</ul>
				</section>

				{/* 6. Tips */}
				<section>
					<h2 className="mb-3 text-xl font-semibold">{t("s6Title")}</h2>
					<ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
						<li>{t("s6Tip1")}</li>
						<li>{t("s6Tip2")}</li>
						<li>{t("s6Tip3")}</li>
						<li>{t("s6Tip4")}</li>
					</ul>
				</section>
			</div>
		</div>
	);
}

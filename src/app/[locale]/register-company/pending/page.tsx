import { PageCenter } from "@/app/_components/ui/page-center";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PendingApprovalPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("registerCompany");

	return (
		<PageCenter>
			<div className="mx-auto max-w-2xl py-8">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
						</div>
						<CardTitle className="text-2xl">{t("pendingTitle")}</CardTitle>
						<CardDescription>{t("pendingSubtitle")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-center text-sm text-muted-foreground">
						<p>{t("pendingDesc")}</p>
						<p>{t("pendingContact")}</p>
					</CardContent>
				</Card>
			</div>
		</PageCenter>
	);
}

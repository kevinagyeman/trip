import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";

export default async function PendingApprovalPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("registerCompany");

	return (
		<div className="min-h-[calc(100vh-65px)] p-4">
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
		</div>
	);
}

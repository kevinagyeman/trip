import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock } from "lucide-react";

export default async function PendingApprovalPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("registerCompany");

	return (
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
						<Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
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
	);
}

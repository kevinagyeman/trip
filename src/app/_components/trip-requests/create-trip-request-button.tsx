import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function CreateTripRequestButton() {
	const t = await getTranslations("dashboard");
	return (
		<Link href="/dashboard/requests/new">
			<Button>{t("newTripRequest")}</Button>
		</Link>
	);
}

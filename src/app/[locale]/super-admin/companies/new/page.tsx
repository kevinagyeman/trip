import { CreateCompanyForm } from "@/app/_components/super-admin/create-company-form";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function NewCompanyPage() {
	const t = await getTranslations("superAdmin");

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="mb-6">
				<Link href="/super-admin">
					<Button variant="ghost" size="sm">
						← {t("backToDashboard")}
					</Button>
				</Link>
			</div>
			<h1 className="mb-6 text-2xl font-bold">{t("createCompany")}</h1>
			<CreateCompanyForm />
		</div>
	);
}

import { RegisterCompanyForm } from "@/app/_components/register/register-company-form";
import { PageCenter } from "@/app/_components/ui/page-center";
import { auth } from "@/server/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function RegisterCompanyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (session) redirect("/dashboard");

	return (
		<PageCenter>
			<div className="w-full max-w-2xl py-8">
				<RegisterCompanyForm />
			</div>
		</PageCenter>
	);
}

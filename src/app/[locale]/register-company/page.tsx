import { RegisterCompanyForm } from "@/app/_components/register/register-company-form";
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
		<div className="min-h-[calc(100vh-65px)] p-4">
			<div className="mx-auto max-w-2xl py-8">
				<RegisterCompanyForm />
			</div>
		</div>
	);
}

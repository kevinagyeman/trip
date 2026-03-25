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
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<RegisterCompanyForm />
		</div>
	);
}

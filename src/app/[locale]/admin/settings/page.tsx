import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/app/_components/admin/change-password-form";

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

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Settings</h1>
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
				</CardHeader>
				<CardContent>
					<ChangePasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}

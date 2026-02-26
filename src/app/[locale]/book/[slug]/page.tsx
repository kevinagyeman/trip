import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function BookingPortalPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const t = await getTranslations("booking");

	const company = await db.company.findUnique({
		where: { slug, isActive: true },
		select: { name: true, slug: true, logoUrl: true },
	});

	if (!company) {
		notFound();
	}

	return (
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full max-w-md space-y-6 text-center">
				{company.logoUrl && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={company.logoUrl}
						alt={company.name}
						className="mx-auto h-20 w-auto object-contain"
					/>
				)}

				<div>
					<h1 className="text-3xl font-bold">{company.name}</h1>
					<p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
				</div>

				<div className="space-y-3">
					<Link href={`/auth/register?company=${slug}`} className="block">
						<Button size="lg" className="w-full">
							{t("createAccount")}
						</Button>
					</Link>
					<Link href="/auth/signin" className="block">
						<Button size="lg" variant="outline" className="w-full">
							{t("signIn")}
						</Button>
					</Link>
				</div>

				<p className="text-xs text-muted-foreground">{t("poweredBy")}</p>
			</div>
		</div>
	);
}

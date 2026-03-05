import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import {
	Bell,
	CheckCircle,
	Globe,
	MessageSquare,
	Send,
	Shield,
	Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();

	if (session?.user) {
		if (session.user.role === "SUPER_ADMIN") redirect("/super-admin");
		if (session.user.role === "ADMIN") redirect("/admin");
		redirect("/dashboard");
	}

	return <LandingPage />;
}

function LandingPage() {
	const t = useTranslations("landing");

	const features = [
		{ icon: Send, title: t("feature1Title"), description: t("feature1Desc") },
		{
			icon: CheckCircle,
			title: t("feature2Title"),
			description: t("feature2Desc"),
		},
		{ icon: Bell, title: t("feature3Title"), description: t("feature3Desc") },
		{
			icon: MessageSquare,
			title: t("feature4Title"),
			description: t("feature4Desc"),
		},
		{ icon: Globe, title: t("feature5Title"), description: t("feature5Desc") },
		{ icon: Shield, title: t("feature6Title"), description: t("feature6Desc") },
	];

	const steps = [
		{ title: t("step1Title"), description: t("step1Desc") },
		{ title: t("step2Title"), description: t("step2Desc") },
		{ title: t("step3Title"), description: t("step3Desc") },
	];

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-28 text-white">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
					<div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
				</div>

				<div className="relative mx-auto max-w-4xl text-center">
					<span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
						<Zap className="h-3.5 w-3.5" />
						{t("heroBadge")}
					</span>
					<h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
						{t("heroHeadline")}{" "}
						<span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
							{t("heroHeadlineHighlight")}
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
						{t("heroSubtitle")}
					</p>
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<Link href="/auth/signin">
							<Button
								size="lg"
								className="bg-blue-500 px-8 text-base hover:bg-blue-600"
							>
								{t("ctaStart")}
							</Button>
						</Link>
						<Link href="/auth/signin">
							<Button
								size="lg"
								variant="outline"
								className="border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/10"
							>
								{t("ctaSignIn")}
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="bg-background px-6 py-24">
				<div className="mx-auto max-w-5xl">
					<div className="mb-14 text-center">
						<h2 className="mb-3 text-3xl font-bold">{t("featuresTitle")}</h2>
						<p className="text-muted-foreground">{t("featuresSubtitle")}</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((f) => (
							<div
								key={f.title}
								className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
							>
								<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
									<f.icon className="h-5 w-5" />
								</div>
								<h3 className="mb-2 font-semibold">{f.title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{f.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="bg-muted/40 px-6 py-24">
				<div className="mx-auto max-w-4xl">
					<div className="mb-14 text-center">
						<h2 className="mb-3 text-3xl font-bold">{t("stepsTitle")}</h2>
						<p className="text-muted-foreground">{t("stepsSubtitle")}</p>
					</div>

					<div className="relative grid gap-8 sm:grid-cols-3">
						<div className="absolute left-1/6 right-1/6 top-6 hidden h-px bg-border sm:block" />
						{steps.map((step, i) => (
							<div key={step.title} className="relative text-center">
								<div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 bg-background text-sm font-bold text-blue-500">
									{i + 1}
								</div>
								<h3 className="mb-2 font-semibold">{step.title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="bg-blue-600 px-6 py-20 text-white">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="mb-4 text-3xl font-bold">{t("ctaBannerTitle")}</h2>
					<p className="mb-8 text-blue-100">{t("ctaBannerSubtitle")}</p>
					<Link href="/auth/signin">
						<Button
							size="lg"
							className="bg-white px-10 text-base text-blue-600 hover:bg-blue-50"
						>
							{t("ctaBannerButton")}
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

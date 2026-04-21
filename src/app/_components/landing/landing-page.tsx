import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
	ArrowRight,
	Bell,
	CheckCircle,
	Globe,
	MessageSquare,
	Send,
	Shield,
	Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function LandingPage() {
	const t = await getTranslations("landing");

	return (
		<div className="flex flex-col">
			{/* ── Hero ── */}
			<section className="px-6 pb-0 pt-20 sm:pt-28">
				<div className="mx-auto max-w-4xl text-center">
					<span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						<Zap className="h-3 w-3" />
						{t("heroBadge")}
					</span>
					<h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
						{t("heroHeadline")}{" "}
						<span className="text-primary">{t("heroHeadlineHighlight")}</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
						{t("heroSubtitle")}
					</p>
					<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Link href="/auth/signin">
							<Button size="lg" className="gap-2 px-8 text-base">
								{t("ctaStart")} <ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link href="/auth/signin">
							<Button size="lg" variant="outline" className="px-8 text-base">
								{t("ctaSignIn")}
							</Button>
						</Link>
					</div>
				</div>

				{/* Product screenshot */}
				<div className="mx-auto mt-16 max-w-6xl">
					{/* Desktop — landscape */}
					<div className="hidden overflow-hidden rounded-t-2xl border-x-2 border-t-2 shadow-2xl sm:block">
						<Image
							src="/dashboard-light.png"
							alt="dantrip dashboard"
							width={1400}
							height={800}
							className="block w-full dark:hidden"
							priority
						/>
						<Image
							src="/dashboard-dark.png"
							alt="dantrip dashboard"
							width={1400}
							height={800}
							className="hidden w-full dark:block"
							priority
						/>
					</div>
					{/* Mobile — portrait */}
					<div className="overflow-hidden rounded-t-2xl border-x-2 border-t-2 shadow-2xl sm:hidden">
						<Image
							src="/dashboard-mobile-light.png"
							alt="dantrip dashboard mobile"
							width={390}
							height={680}
							className="block w-full dark:hidden"
							priority
						/>
						<Image
							src="/dashboard-mobile-dark.png"
							alt="dantrip dashboard mobile"
							width={390}
							height={680}
							className="hidden w-full dark:block"
							priority
						/>
					</div>
				</div>
			</section>

			{/* ── Trust bar ── */}
			<section className="border-y bg-muted/40 px-6 py-12">
				<div className="mx-auto max-w-5xl">
					<p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						{t("trustLabel")}
					</p>
					<div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale">
						{[
							"Transfero",
							"EuroRide",
							"AlpineShuttle",
							"VIP Transit",
							"SwiftMove",
						].map((name) => (
							<Image
								key={name}
								src={`https://placehold.co/110x36/64748b/ffffff?text=${encodeURIComponent(name)}`}
								alt={name}
								width={110}
								height={36}
								className="h-8 w-auto"
								unoptimized
							/>
						))}
					</div>
				</div>
			</section>

			{/* ── Feature spotlight 1 ── */}
			<section className="px-6 py-28">
				<div className="mx-auto max-w-6xl">
					<div className="grid items-center gap-16 lg:grid-cols-2">
						<div>
							<span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
								{t("spotlight1Label")}
							</span>
							<h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
								{t("spotlight1Title")}
							</h2>
							<p className="mb-8 text-lg leading-relaxed text-muted-foreground">
								{t("spotlight1Desc")}
							</p>
							<ul className="space-y-3">
								{[
									t("spotlight1Point1"),
									t("spotlight1Point2"),
									t("spotlight1Point3"),
								].map((point) => (
									<li key={point} className="flex items-start gap-3 text-sm">
										<CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
										<span>{point}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="overflow-hidden rounded-2xl border-2 shadow-xl">
							<Image
								src="/numbers-light.png"
								alt="Request portal"
								width={700}
								height={500}
								className="block w-full dark:hidden"
								unoptimized
							/>
							<Image
								src="/numbers-dark.png"
								alt="Request portal"
								width={700}
								height={500}
								className="hidden w-full dark:block"
								unoptimized
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ── Feature spotlight 2 (reversed) ── */}
			<section className="bg-muted/40 px-6 py-28">
				<div className="mx-auto max-w-6xl">
					<div className="grid items-center gap-16 lg:grid-cols-2">
						<div className="order-2 overflow-hidden rounded-2xl border-2 shadow-xl lg:order-1">
							<Image
								src="/quote-light.png"
								alt="Quotation builder"
								width={700}
								height={500}
								className="block w-full dark:hidden"
								unoptimized
							/>
							<Image
								src="/quote-dark.png"
								alt="Quotation builder"
								width={700}
								height={500}
								className="hidden w-full dark:block"
								unoptimized
							/>
						</div>
						<div className="order-1 lg:order-2">
							<span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
								{t("spotlight2Label")}
							</span>
							<h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
								{t("spotlight2Title")}
							</h2>
							<p className="mb-8 text-lg leading-relaxed text-muted-foreground">
								{t("spotlight2Desc")}
							</p>
							<ul className="space-y-3">
								{[
									t("spotlight2Point1"),
									t("spotlight2Point2"),
									t("spotlight2Point3"),
								].map((point) => (
									<li key={point} className="flex items-start gap-3 text-sm">
										<CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
										<span>{point}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ── Feature spotlight 3 ── */}
			<section className="px-6 py-28">
				<div className="mx-auto max-w-6xl">
					<div className="grid items-center gap-16 lg:grid-cols-2">
						<div>
							<span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
								{t("spotlight3Label")}
							</span>
							<h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
								{t("spotlight3Title")}
							</h2>
							<p className="mb-8 text-lg leading-relaxed text-muted-foreground">
								{t("spotlight3Desc")}
							</p>
							<ul className="space-y-3">
								{[
									t("spotlight3Point1"),
									t("spotlight3Point2"),
									t("spotlight3Point3"),
								].map((point) => (
									<li key={point} className="flex items-start gap-3 text-sm">
										<CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
										<span>{point}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="overflow-hidden rounded-2xl border-2 shadow-xl">
							<Image
								src="/messages-light.png"
								alt="Messaging and notifications"
								width={700}
								height={500}
								className="block w-full dark:hidden"
								unoptimized
							/>
							<Image
								src="/messages-dark.png"
								alt="Messaging and notifications"
								width={700}
								height={500}
								className="hidden w-full dark:block"
								unoptimized
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ── Stats ── */}
			<section className="border-y bg-muted/40 px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
						{[
							{ value: t("stat1Value"), label: t("stat1Label") },
							{ value: t("stat2Value"), label: t("stat2Label") },
							{ value: t("stat3Value"), label: t("stat3Label") },
							{ value: t("stat4Value"), label: t("stat4Label") },
						].map((stat) => (
							<div key={stat.label} className="text-center">
								<p className="mb-1 text-4xl font-bold tracking-tight">
									{stat.value}
								</p>
								<p className="text-sm text-muted-foreground">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Features grid ── */}
			<section className="px-6 py-28">
				<div className="mx-auto max-w-5xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							{t("featuresTitle")}
						</h2>
						<p className="text-lg text-muted-foreground">
							{t("featuresSubtitle")}
						</p>
					</div>
					<div className="grid gap-px overflow-hidden rounded-2xl border-2 bg-border sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: Send,
								title: t("feature1Title"),
								desc: t("feature1Desc"),
							},
							{
								icon: CheckCircle,
								title: t("feature2Title"),
								desc: t("feature2Desc"),
							},
							{
								icon: Bell,
								title: t("feature3Title"),
								desc: t("feature3Desc"),
							},
							{
								icon: MessageSquare,
								title: t("feature4Title"),
								desc: t("feature4Desc"),
							},
							{
								icon: Globe,
								title: t("feature5Title"),
								desc: t("feature5Desc"),
							},
							{
								icon: Shield,
								title: t("feature6Title"),
								desc: t("feature6Desc"),
							},
						].map((f) => (
							<div
								key={f.title}
								className="flex flex-col gap-4 bg-background p-8"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
									<f.icon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="mb-1.5 font-semibold">{f.title}</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{f.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── How it works ── */}
			<section className="bg-muted/40 px-6 py-28">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							{t("stepsTitle")}
						</h2>
						<p className="text-lg text-muted-foreground">
							{t("stepsSubtitle")}
						</p>
					</div>
					<div className="relative grid gap-10 sm:grid-cols-3">
						<div className="absolute left-1/6 right-1/6 top-5 hidden h-px bg-border sm:block" />
						{[
							{ title: t("step1Title"), desc: t("step1Desc") },
							{ title: t("step2Title"), desc: t("step2Desc") },
							{ title: t("step3Title"), desc: t("step3Desc") },
						].map((step, i) => (
							<div key={step.title} className="relative text-center">
								<div className="relative z-10 mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
									{i + 1}
								</div>
								<h3 className="mb-2 font-semibold">{step.title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{step.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Final CTA ── */}
			<section className="px-6 py-28">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl">
						{t("ctaBannerTitle")}
					</h2>
					<p className="mb-10 text-lg text-muted-foreground">
						{t("ctaBannerSubtitle")}
					</p>
					<Link href="/auth/signin">
						<Button size="lg" className="gap-2 px-10 text-base">
							{t("ctaBannerButton")} <ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

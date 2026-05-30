import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function PricingPage() {
	const t = await getTranslations("pricing");

	const features: string[] = [
		t("feature1"),
		t("feature2"),
		t("feature3"),
		t("feature4"),
		t("feature5"),
		t("feature6"),
		t("feature7"),
		t("feature8"),
		t("feature9"),
	];

	return (
		<div className="flex flex-col">
			{/* ── Hero ── */}
			<section className="px-6 py-24 text-center">
				<div className="mx-auto max-w-2xl">
					<span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						<Zap className="h-3 w-3" />
						{t("badge")}
					</span>
					<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
						{t("title")}
					</h1>
					<p className="text-lg text-muted-foreground">{t("subtitle")}</p>
				</div>
			</section>

			{/* ── Plan card ── */}
			<section className="px-6 pb-28">
				<div className="mx-auto max-w-sm">
					<div className="rounded-2xl border-2 border-primary bg-background p-8 shadow-xl">
						<div className="mb-6">
							<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
								{t("planLabel")}
							</p>
							<div className="flex items-end gap-2">
								<span className="text-5xl font-bold tracking-tight">
									{t("planPrice")}
								</span>
								<span className="mb-1.5 text-muted-foreground">
									{t("planPriceSuffix")}
								</span>
							</div>
							<p className="mt-3 text-sm text-muted-foreground">
								{t("planDesc")}
							</p>
						</div>

						<Link href="/register-company" className="block">
							<Button className="w-full" size="lg">
								{t("cta")} <ArrowRight className="h-4 w-4" />
							</Button>
						</Link>

						<ul className="mt-8 space-y-3">
							{features.map((f) => (
								<li key={f} className="flex items-start gap-3 text-sm">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span>{f}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* ── FAQ / reassurance ── */}
			<section className="border-t bg-muted/40 px-6 py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="mb-4 text-2xl font-bold tracking-tight">
						{t("faqTitle")}
					</h2>
					<p className="text-muted-foreground">{t("faqDesc")}</p>
					<div className="mt-8">
						<Link href="/register-company">
							<Button variant="outline" size="lg">
								{t("cta")} <Zap className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}

"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";

export function Footer() {
	const t = useTranslations("footer");

	return (
		<footer className="mt-auto border-t bg-background">
			<div className="container mx-auto flex flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
				<p>
					© {new Date().getFullYear()} dantrip.com. {t("allRightsReserved")}
				</p>
				<div className="flex items-center gap-4">
					<a
						href="https://www.iubenda.com/privacy-policy/61494361"
						className="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed hover:text-foreground transition-colors"
						title="Privacy Policy"
					>
						{t("privacyPolicy")}
					</a>
					<a
						href="https://www.iubenda.com/privacy-policy/61494361/cookie-policy"
						className="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed hover:text-foreground transition-colors"
						title="Cookie Policy"
					>
						{t("cookiePolicy")}
					</a>
				</div>
			</div>
			<Script src="https://cdn.iubenda.com/iubenda.js" strategy="lazyOnload" />
		</footer>
	);
}

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "fr", "de", "it"],
	defaultLocale: "en",
	localePrefix: "never",
});

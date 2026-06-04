import { LOCALE_ENUM } from "@/lib/constants";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: LOCALE_ENUM,
	defaultLocale: "en",
	localePrefix: "never",
});

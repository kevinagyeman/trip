import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "dantrip.com",
	description: "Request trips and manage quotations",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={geist.variable} suppressHydrationWarning>
			<head>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-KQZTYP1ESD"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-KQZTYP1ESD');
					`}
				</Script>
				<Script
					src="https://embeds.iubenda.com/widgets/0512a527-10f7-42e5-bf61-c41481af9bb2.js"
					strategy="afterInteractive"
				/>
			</head>
			<body>
				<TRPCReactProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}

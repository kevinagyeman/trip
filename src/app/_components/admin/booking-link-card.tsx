"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Check, Copy } from "lucide-react";

export function BookingLinkCard({ url }: { url: string }) {
	const t = useTranslations("settings");
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("bookingLinkTitle")}</CardTitle>
				<CardDescription>{t("bookingLinkDesc")}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
					<span className="flex-1 truncate font-mono text-sm">{url}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopy}
						className="shrink-0"
					>
						{copied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy className="h-4 w-4" />
						)}
						<span className="ml-1">{copied ? t("copied") : t("copyLink")}</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

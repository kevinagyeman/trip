"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function GuideBookingLink({ url }: { url: string }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="mt-2 flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
			<span className="flex-1 truncate font-mono text-xs">{url}</span>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleCopy}
				className="shrink-0 h-7 px-2"
			>
				{copied ? (
					<Check className="h-3.5 w-3.5 text-green-500" />
				) : (
					<Copy className="h-3.5 w-3.5" />
				)}
			</Button>
		</div>
	);
}

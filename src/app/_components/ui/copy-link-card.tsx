"use client";

import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyLinkCard({
	url,
	title,
	subtitle,
}: {
	url: string;
	title?: string;
	subtitle?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [resolvedUrl, setResolvedUrl] = useState(url);

	useEffect(() => {
		setResolvedUrl(
			url.startsWith("http") ? url : `${window.location.origin}${url}`,
		);
	}, [url]);

	async function handleCopy() {
		await navigator.clipboard.writeText(resolvedUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<SectionCard title={title} subtitle={subtitle}>
			<div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-1">
				<span className="flex-1 truncate font-mono text-xs">{resolvedUrl}</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className="shrink-0"
				>
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>
		</SectionCard>
	);
}

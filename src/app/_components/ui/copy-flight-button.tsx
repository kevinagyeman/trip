"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyFlightButton({ flightNumber }: { flightNumber: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		void navigator.clipboard.writeText(flightNumber).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	};

	return (
		<Button
			type="button"
			size="xs"
			variant={"outline"}
			onClick={handleCopy}
			title="Copy flight number"
			className="text-base font-normal"
		>
			{flightNumber}
			{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
		</Button>
	);
}

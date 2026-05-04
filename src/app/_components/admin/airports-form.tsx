"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ITALIAN_AIRPORTS, formatAirport } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export function AirportsForm({
	currentAirports,
}: {
	currentAirports: string[];
}) {
	const t = useTranslations("settings");
	const [selected, setSelected] = useState<string[]>(currentAirports);
	const [saved, setSaved] = useState(false);

	const updateAirports = api.company.updateAirports.useMutation({
		onSuccess: () => setSaved(true),
	});

	const toggle = (airport: string) => {
		setSaved(false);
		setSelected((prev) =>
			prev.includes(airport)
				? prev.filter((a) => a !== airport)
				: [...prev, airport],
		);
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">{t("airportsDesc")}</p>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{ITALIAN_AIRPORTS.map((airport) => {
					const value = formatAirport(airport);
					return (
						<div key={airport.iata} className="flex items-center gap-2">
							<Checkbox
								id={airport.iata}
								checked={selected.includes(value)}
								onCheckedChange={() => toggle(value)}
							/>
							<Label
								htmlFor={airport.iata}
								className="cursor-pointer font-normal"
							>
								{value}
							</Label>
						</div>
					);
				})}
			</div>
			<Button
				onClick={() => updateAirports.mutate({ airports: selected })}
				disabled={updateAirports.isPending}
				size="sm"
			>
				{updateAirports.isPending
					? t("saving")
					: saved
						? t("airportsSaved")
						: t("saveAirports")}
			</Button>
			{updateAirports.error && (
				<p className="text-sm text-destructive">
					{updateAirports.error.message}
				</p>
			)}
		</div>
	);
}

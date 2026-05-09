"use client";

import { SectionCard } from "@/app/_components/ui/section-card";
import { useTranslations } from "next-intl";

interface PassengersCardProps {
	numberOfAdults: number;
	areThereChildren: boolean;
	numberOfChildren?: number | null;
	ageOfChildren?: string | null;
	numberOfChildSeats?: number | null;
	additionalInfo?: string | null;
	title?: string;
}

export function PassengersCard({
	numberOfAdults,
	areThereChildren,
	numberOfChildren,
	ageOfChildren,
	numberOfChildSeats,
	additionalInfo,
	title,
}: PassengersCardProps) {
	const t = useTranslations("requestDetail");

	return (
		<SectionCard
			title={title ?? t("passengers")}
			contentClassName="space-y-1.5 pt-0 text-sm"
		>
			<p>
				<span className="text-muted-foreground">{t("adults")}: </span>
				<span className="font-medium">{numberOfAdults}</span>
			</p>
			{areThereChildren && numberOfChildren != null && (
				<p>
					<span className="text-muted-foreground">
						{t("numberOfChildren")}:{" "}
					</span>
					<span className="font-medium">{numberOfChildren}</span>
				</p>
			)}
			{areThereChildren && ageOfChildren && (
				<p>
					<span className="text-muted-foreground">{t("agesOfChildren")}: </span>
					<span className="font-medium">{ageOfChildren}</span>
				</p>
			)}
			{areThereChildren && numberOfChildSeats != null && (
				<p>
					<span className="text-muted-foreground">
						{t("childSeatsNeeded")}:{" "}
					</span>
					<span className="font-medium">{numberOfChildSeats}</span>
				</p>
			)}
			{additionalInfo && (
				<p>
					<span className="text-muted-foreground">
						{t("additionalInformation")}:{" "}
					</span>
					<span className="font-medium">{additionalInfo}</span>
				</p>
			)}
		</SectionCard>
	);
}

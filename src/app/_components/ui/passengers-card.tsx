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

	const totalPassengers =
		numberOfAdults + (areThereChildren ? (numberOfChildren ?? 0) : 0);

	return (
		<SectionCard
			title={title ?? t("passengers")}
			contentClassName="space-y-1.5 pt-0 text-sm"
		>
			<p>
				<span className="text-muted-foreground text-base">
					{t("totalPassengers")}:{" "}
				</span>
				<span className="font-medium text-base">{totalPassengers}</span>
			</p>
			<p>
				<span className="text-muted-foreground text-base">{t("adults")}: </span>
				<span className="font-medium text-base">{numberOfAdults}</span>
			</p>
			{areThereChildren && numberOfChildren != null && (
				<p>
					<span className="text-muted-foreground text-base">
						{t("numberOfChildren")}:{" "}
					</span>
					<span className="font-medium text-base">{numberOfChildren}</span>
				</p>
			)}
			{areThereChildren && ageOfChildren && (
				<p>
					<span className="text-muted-foreground text-base">
						{t("agesOfChildren")}:{" "}
					</span>
					<span className="font-medium text-base">{ageOfChildren}</span>
				</p>
			)}
			{areThereChildren && numberOfChildSeats != null && (
				<p>
					<span className="text-muted-foreground text-base">
						{t("childSeatsNeeded")}:{" "}
					</span>
					<span className="font-medium text-base">{numberOfChildSeats}</span>
				</p>
			)}
			{additionalInfo && (
				<p>
					<span className="text-muted-foreground text-base">
						{t("additionalInformation")}:{" "}
					</span>
					<span className="font-medium text-base">{additionalInfo}</span>
				</p>
			)}
		</SectionCard>
	);
}

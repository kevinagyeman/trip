"use client";

import { TripMessageThread } from "@/app/_components/trip-requests/trip-message-thread";
import { SectionCard } from "@/app/_components/ui/section-card";
import { useTranslations } from "next-intl";

export function AdminMessagesCard({
	requestId,
	disabled,
}: {
	requestId: string;
	disabled?: boolean;
}) {
	const t = useTranslations("messages");

	return (
		<SectionCard title={t("title")}>
			<TripMessageThread
				mode="admin"
				requestId={requestId}
				disabled={disabled}
			/>
		</SectionCard>
	);
}

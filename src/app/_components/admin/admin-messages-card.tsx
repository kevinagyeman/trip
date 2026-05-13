"use client";

import { TripMessageThread } from "@/app/_components/trip-requests/trip-message-thread";
import { SectionCard } from "@/app/_components/ui/section-card";

export function AdminMessagesCard({ requestId }: { requestId: string }) {
	return (
		<SectionCard contentClassName="pt-0">
			<TripMessageThread mode="admin" requestId={requestId} />
		</SectionCard>
	);
}

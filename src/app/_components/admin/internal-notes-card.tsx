"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function InternalNotesCard({
	requestId,
	initialNotes,
}: {
	requestId: string;
	initialNotes: string;
}) {
	const t = useTranslations("adminDetail");
	const utils = api.useUtils();
	const [notes, setNotes] = useState(initialNotes);
	const update = api.tripRequest.updateInternalNotes.useMutation({
		onSuccess: () =>
			utils.tripRequest.getByIdAdmin.invalidate({ id: requestId }),
	});

	return (
		<SectionCard title={t("internalNotes")} contentClassName="space-y-2 pt-0">
			<Textarea
				rows={3}
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
			/>
			<LoadingButton
				isLoading={update.isPending}
				onClick={() => update.mutate({ id: requestId, internalNotes: notes })}
			/>
		</SectionCard>
	);
}

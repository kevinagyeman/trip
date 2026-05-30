import { format } from "date-fns";
import { useTranslations } from "next-intl";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<p>
			<span className="text-muted-foreground">{label}: </span>
			<span>{value}</span>
		</p>
	);
}

export function PickupReadOnlyView({
	meetingPoint,
	beThereAtDate,
	beThereAtTime,
	driverName,
	driverPhone,
	additionalInfo,
	t,
}: {
	meetingPoint?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	driverName?: string | null;
	driverPhone?: string | null;
	additionalInfo?: string | null;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<div>
			{meetingPoint && (
				<InfoRow label={t("pickupInfoMeetingPoint")} value={meetingPoint} />
			)}
			{(beThereAtDate ?? beThereAtTime) && (
				<InfoRow
					label={t("pickupInfoBeThereAt")}
					value={
						<>
							{beThereAtDate && format(new Date(beThereAtDate), "d MMM yyyy")}
							{beThereAtDate && beThereAtTime && " - "}
							{beThereAtTime}
						</>
					}
				/>
			)}
			{driverName && (
				<InfoRow label={t("pickupInfoDriverName")} value={driverName} />
			)}
			{driverPhone && (
				<InfoRow label={t("pickupInfoDriverPhone")} value={driverPhone} />
			)}
			{additionalInfo && (
				<InfoRow label={t("pickupInfoAdditionalInfo")} value={additionalInfo} />
			)}
		</div>
	);
}

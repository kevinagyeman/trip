"use client";

import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
import { pickupSchema, type PickupFormValues } from "@/lib/schemas/pickup";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RequiredLabel } from "./required-label";

export interface PickupValue {
	meetingPoint: string;
	beThereAtDate: string;
	beThereAtTime: string;
	driverName: string;
	driverPhoneCountryCode: string;
	driverPhone: string;
	additionalInfo: string;
}

interface Driver {
	id: string;
	name: string;
	surname: string;
	phone: string;
}

type PickupErrors = Partial<Record<keyof PickupFormValues, string>>;

interface Props {
	// Saved values — shown in title and read-only body
	pickup: string;
	destination: string;
	driverName?: string | null;
	driverPhone?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	meetingPoint?: string | null;
	additionalInfo?: string | null;

	// Edit mode
	canEdit?: boolean;
	value?: PickupValue;
	onChange?: (field: keyof PickupValue, val: string) => void;
	onSave?: () => void;
	isLoading?: boolean;
	drivers?: Driver[];
	notifiedAt?: Date | string | null;
	saveLabel?: string;
	pendingNote?: string;
}

export function RoutePickupSection({
	pickup,
	destination,
	driverName,
	driverPhone,
	beThereAtDate,
	beThereAtTime,
	meetingPoint,
	additionalInfo,
	canEdit = false,
	value,
	onChange,
	onSave,
	isLoading,
	drivers = [],
	notifiedAt,
	saveLabel,
	pendingNote,
}: Props) {
	const t = useTranslations("common");
	const [errors, setErrors] = useState<PickupErrors>({});

	const title = driverName ? (
		<span className="flex flex-wrap items-center gap-2 text-base">
			<span className="text-muted-foreground">{t("pickupScheduled")}</span>
			{beThereAtDate && (
				<span className=" text-foreground">
					{format(new Date(beThereAtDate), "d MMM yyyy")}
				</span>
			)}
			{beThereAtTime && (
				<span className=" text-foreground">{beThereAtTime}</span>
			)}
			<span className="text-foreground">{driverName}</span>
			{beThereAtDate && (
				<Button
					size="sm"
					variant="outline"
					onClick={(e) => {
						e.stopPropagation();
						const date = new Date(beThereAtDate);
						const timeStr = beThereAtTime ?? "00:00";
						const [h, m] = timeStr.split(":").map(Number);
						const end = new Date(date);
						end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
						window.open(
							googleCalendarUrl({
								summary: `${pickup} → ${destination}`,
								description: [
									driverName && `Driver: ${driverName}`,
									driverPhone && `Phone: ${driverPhone}`,
								]
									.filter(Boolean)
									.join("\n"),
								location: meetingPoint ?? pickup,
								start: toICSDateTime(date, timeStr),
								end: toICSDateTime(end),
							}),
							"_blank",
						);
					}}
				>
					<CalendarPlus className="mr-1 h-3 w-3" />
					{t("googleCalendar")}
				</Button>
			)}
		</span>
	) : (
		<span className="flex flex-wrap items-center gap-2 text-base">
			<span className="text-muted-foreground">{t("pickupScheduled")}</span>
			<span className="text-muted-foreground">{t("pickupTimeNote")}</span>
		</span>
	);

	const handleSave = () => {
		const result = pickupSchema.safeParse(value ?? {});
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setErrors(
				Object.fromEntries(
					Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]),
				),
			);
			return;
		}
		setErrors({});
		onSave?.();
	};

	return (
		<CollapsibleSection
			editLabel={canEdit ? t("edit") : undefined}
			title={title}
		>
			{canEdit ? (
				<>
					{/* Driver quick-select */}
					{drivers.length > 0 && (
						<CustomSelect
							className="mb-3"
							labelText={t("pickupInfoSelectDriver")}
							placeholder={t("pickupInfoSelectDriverPlaceholder")}
							value=""
							options={drivers.map((d) => ({
								value: d.id,
								label: `${d.name} ${d.surname}`,
							}))}
							onValueChange={(driverId) => {
								const d = drivers.find((dr) => dr.id === driverId);
								if (!d) return;
								onChange?.("driverName", `${d.name} ${d.surname}`);
								const match = d.phone.match(/^(\+\d+)\s(.+)$/);
								onChange?.("driverPhoneCountryCode", match?.[1] ?? "+39");
								onChange?.("driverPhone", match?.[2] ?? d.phone);
							}}
						/>
					)}

					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<CustomInput
							className="sm:col-span-2"
							labelText={t("pickupInfoMeetingPoint")}
							required
							placeholder={t("pickupInfoMeetingPointPlaceholder")}
							error={errors.meetingPoint}
							inputProps={{
								value: value?.meetingPoint ?? "",
								onChange: (e) => onChange?.("meetingPoint", e.target.value),
							}}
						/>
						<CustomInput
							labelText={t("pickupInfoBeThereAtDate")}
							required
							inputType="date"
							error={errors.beThereAtDate}
							inputProps={{
								value: value?.beThereAtDate ?? "",
								onChange: (e) => onChange?.("beThereAtDate", e.target.value),
							}}
						/>
						<CustomInput
							labelText={t("pickupInfoBeThereAtTime")}
							required
							inputType="time"
							error={errors.beThereAtTime}
							inputProps={{
								value: value?.beThereAtTime ?? "",
								onChange: (e) => onChange?.("beThereAtTime", e.target.value),
							}}
						/>
						<CustomInput
							labelText={t("pickupInfoDriverName")}
							required
							placeholder={t("pickupInfoDriverNamePlaceholder")}
							error={errors.driverName}
							inputProps={{
								value: value?.driverName ?? "",
								onChange: (e) => onChange?.("driverName", e.target.value),
							}}
						/>
						<div className="space-y-2">
							<Label className="mb-2">
								{t("pickupInfoDriverPhone")}
								<RequiredLabel />
							</Label>
							<PhoneInput
								countryCode={value?.driverPhoneCountryCode ?? "+39"}
								onCountryCodeChange={(v) =>
									onChange?.("driverPhoneCountryCode", v)
								}
								phoneNumber={value?.driverPhone ?? ""}
								onPhoneNumberChange={(v) => onChange?.("driverPhone", v)}
								error={errors.driverPhone ?? errors.driverPhoneCountryCode}
							/>
							{(errors.driverPhone ?? errors.driverPhoneCountryCode) && (
								<small className="text-xs text-destructive">
									{errors.driverPhone ?? errors.driverPhoneCountryCode}
								</small>
							)}
						</div>
						<CustomTextArea
							className="sm:col-span-2"
							labelText={t("pickupInfoAdditionalInfo")}
							rows={3}
							placeholder={t("pickupInfoAdditionalInfoPlaceholder")}
							textAreaProps={{
								value: value?.additionalInfo ?? "",
								onChange: (e) => onChange?.("additionalInfo", e.target.value),
							}}
						/>
					</div>

					<div className="mt-2 flex flex-wrap gap-2">
						<LoadingButton
							size="sm"
							isLoading={!!isLoading}
							onClick={handleSave}
						>
							{saveLabel ?? t("save")}
						</LoadingButton>
					</div>
				</>
			) : (meetingPoint ?? beThereAtDate ?? driverName) ? (
				<div className="space-y-1.5 pt-2 text-base">
					{meetingPoint && (
						<p>
							<span className="text-muted-foreground">
								{t("pickupInfoMeetingPoint")}:{" "}
							</span>
							<span className="">{meetingPoint}</span>
						</p>
					)}
					{(beThereAtDate ?? beThereAtTime) && (
						<p>
							<span className="text-muted-foreground">
								{t("pickupInfoBeThereAt")}:{" "}
							</span>
							<span className="">
								{beThereAtDate && format(new Date(beThereAtDate), "d MMM yyyy")}
								{beThereAtDate && beThereAtTime && " · "}
								{beThereAtTime}
							</span>
						</p>
					)}
					{driverName && (
						<p>
							<span className="text-muted-foreground">
								{t("pickupInfoDriverName")}:{" "}
							</span>
							<span className="">{driverName}</span>
						</p>
					)}
					{driverPhone && (
						<p>
							<span className="text-muted-foreground">
								{t("pickupInfoDriverPhone")}:{" "}
							</span>
							<a href={`tel:${driverPhone}`} className=" underline">
								{driverPhone}
							</a>
						</p>
					)}
					{additionalInfo && (
						<p>
							<span className="text-muted-foreground">
								{t("pickupInfoAdditionalInfo")}:{" "}
							</span>
							<span className="">{additionalInfo}</span>
						</p>
					)}
				</div>
			) : pendingNote ? null : null}
		</CollapsibleSection>
	);
}

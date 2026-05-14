"use client";

import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

export interface PickupValue {
	meetingPoint: string;
	beThereAtDate: string;
	beThereAtTime: string;
	driverName: string;
	driverPhone: string;
	additionalInfo: string;
}

interface Driver {
	id: string;
	name: string;
	surname: string;
	phone: string;
}

const pickupSchema = z.object({
	meetingPoint: z.string().min(1, "Required"),
	beThereAtDate: z.string().min(1, "Required"),
	beThereAtTime: z.string().min(1, "Required"),
	driverName: z.string().min(1, "Required"),
	driverPhone: z.string().min(1, "Required"),
	additionalInfo: z.string(),
});

type PickupErrors = Partial<Record<keyof z.infer<typeof pickupSchema>, string>>;

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
}: Props) {
	const t = useTranslations("common");
	const [errors, setErrors] = useState<PickupErrors>({});

	const title = driverName ? (
		<span className="flex flex-wrap items-center gap-2">
			<span className="text-muted-foreground">{t("pickupScheduled")}</span>
			{beThereAtDate && (
				<span className="font-medium text-foreground">
					{format(new Date(beThereAtDate), "d MMM yyyy")}
				</span>
			)}
			{beThereAtTime && (
				<span className="font-medium text-foreground">{beThereAtTime}</span>
			)}
			<span className="font-medium text-foreground">{driverName}</span>
			{beThereAtDate && (
				<Button
					size="sm"
					variant="ghost"
					className="h-5 px-1.5 text-xs"
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
		<span className="flex flex-wrap items-center gap-2">
			<span className="text-muted-foreground">{t("pickupScheduled")}</span>
			<span className="text-muted-foreground">—</span>
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
						<div className="mb-3 space-y-1">
							<Label className="text-xs">{t("pickupInfoSelectDriver")}</Label>
							<Select
								onValueChange={(driverId) => {
									const d = drivers.find((dr) => dr.id === driverId);
									if (!d) return;
									onChange?.("driverName", `${d.name} ${d.surname}`);
									onChange?.("driverPhone", d.phone);
								}}
							>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue
										placeholder={t("pickupInfoSelectDriverPlaceholder")}
									/>
								</SelectTrigger>
								<SelectContent>
									{drivers.map((d) => (
										<SelectItem key={d.id} value={d.id}>
											{d.name} {d.surname}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<div className="space-y-1 sm:col-span-2">
							<Label className="text-xs">
								{t("pickupInfoMeetingPoint")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								className="h-7 text-xs"
								placeholder={t("pickupInfoMeetingPointPlaceholder")}
								value={value?.meetingPoint ?? ""}
								onChange={(e) => onChange?.("meetingPoint", e.target.value)}
							/>
							{errors.meetingPoint && (
								<p className="text-xs text-destructive">
									{errors.meetingPoint}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label className="text-xs">
								{t("pickupInfoBeThereAtDate")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								className="h-7 text-xs"
								type="date"
								value={value?.beThereAtDate ?? ""}
								onChange={(e) => onChange?.("beThereAtDate", e.target.value)}
							/>
							{errors.beThereAtDate && (
								<p className="text-xs text-destructive">
									{errors.beThereAtDate}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label className="text-xs">
								{t("pickupInfoBeThereAtTime")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								className="h-7 text-xs"
								type="time"
								value={value?.beThereAtTime ?? ""}
								onChange={(e) => onChange?.("beThereAtTime", e.target.value)}
							/>
							{errors.beThereAtTime && (
								<p className="text-xs text-destructive">
									{errors.beThereAtTime}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label className="text-xs">
								{t("pickupInfoDriverName")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								className="h-7 text-xs"
								placeholder={t("pickupInfoDriverNamePlaceholder")}
								value={value?.driverName ?? ""}
								onChange={(e) => onChange?.("driverName", e.target.value)}
							/>
							{errors.driverName && (
								<p className="text-xs text-destructive">{errors.driverName}</p>
							)}
						</div>
						<div className="space-y-1">
							<Label className="text-xs">
								{t("pickupInfoDriverPhone")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								className="h-7 text-xs"
								placeholder={t("pickupInfoDriverPhonePlaceholder")}
								value={value?.driverPhone ?? ""}
								onChange={(e) => onChange?.("driverPhone", e.target.value)}
							/>
							{errors.driverPhone && (
								<p className="text-xs text-destructive">{errors.driverPhone}</p>
							)}
						</div>
						<div className="space-y-1 sm:col-span-2">
							<Label className="text-xs">{t("pickupInfoAdditionalInfo")}</Label>
							<Textarea
								className="text-xs"
								rows={3}
								placeholder={t("pickupInfoAdditionalInfoPlaceholder")}
								value={value?.additionalInfo ?? ""}
								onChange={(e) => onChange?.("additionalInfo", e.target.value)}
							/>
						</div>
					</div>

					<div className="mb-3 mt-2 flex flex-wrap gap-2">
						<LoadingButton
							size="sm"
							isLoading={!!isLoading}
							onClick={handleSave}
						>
							{saveLabel ?? t("save")}
						</LoadingButton>
					</div>

					{notifiedAt && (
						<p className="text-xs text-muted-foreground">
							{t("notifiedDate", {
								date: format(new Date(notifiedAt), "d MMM yyyy"),
								time: format(new Date(notifiedAt), "HH:mm"),
							})}
						</p>
					)}
				</>
			) : (
				(meetingPoint ?? beThereAtDate ?? driverName) && (
					<div className="space-y-1.5 pt-2 text-xs">
						{meetingPoint && (
							<p>
								<span className="text-muted-foreground">
									{t("pickupInfoMeetingPoint")}:{" "}
								</span>
								<span className="font-medium">{meetingPoint}</span>
							</p>
						)}
						{(beThereAtDate ?? beThereAtTime) && (
							<p>
								<span className="text-muted-foreground">
									{t("pickupInfoBeThereAt")}:{" "}
								</span>
								<span className="font-medium">
									{beThereAtDate &&
										format(new Date(beThereAtDate), "d MMM yyyy")}
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
								<span className="font-medium">{driverName}</span>
							</p>
						)}
						{driverPhone && (
							<p>
								<span className="text-muted-foreground">
									{t("pickupInfoDriverPhone")}:{" "}
								</span>
								<a
									href={`tel:${driverPhone}`}
									className="font-medium underline"
								>
									{driverPhone}
								</a>
							</p>
						)}
						{additionalInfo && (
							<p>
								<span className="text-muted-foreground">
									{t("pickupInfoAdditionalInfo")}:{" "}
								</span>
								<span className="font-medium">{additionalInfo}</span>
							</p>
						)}
					</div>
				)
			)}
		</CollapsibleSection>
	);
}

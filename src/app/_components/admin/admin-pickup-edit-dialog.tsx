"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { AppDialog } from "@/app/_components/ui/app-dialog";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { SectionDivider } from "@/app/_components/ui/section-divider";
import { Button } from "@/components/ui/button";
import { pickupSchema, type PickupFormValues } from "@/lib/schemas/pickup";
import { MapPinned } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface RouteData {
	pickup: string;
	destination: string;
	type?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	meetingPoint?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	driverName?: string | null;
	driverPhone?: string | null;
	additionalInfo?: string | null;
}

export interface Driver {
	id: string;
	name: string;
	surname: string;
	phone: string;
}

type PickupErrors = Partial<Record<keyof PickupFormValues, string>>;

interface Props {
	requestId: string;
	route: RouteData;
	routeIndex: number;
	allRoutes: RouteData[];
	drivers: Driver[];
	isLoading: boolean;
	inBanner?: boolean;
	onSave: (
		input: {
			id: string;
			notify?: boolean;
			routes: Array<{
				pickup: string;
				destination: string;
				type?: "airport_in" | "standard" | "airport_out";
				scheduledDate?: string;
				scheduledTime?: string;
				flightNumber?: string;
				meetingPoint?: string;
				beThereAtDate?: string;
				beThereAtTime?: string;
				driverName?: string;
				driverPhone?: string;
				additionalInfo?: string;
			}>;
		},
		options: { onSuccess: () => void },
	) => void;
}

export function AdminPickupEditDialog({
	requestId,
	route,
	routeIndex,
	allRoutes,
	drivers,
	isLoading,
	inBanner = false,
	onSave,
}: Props) {
	const t = useTranslations("adminDetail");
	const tCommon = useTranslations("common");
	const params = useParams<{ locale: string }>();

	const [open, setOpen] = useState(false);

	const [meetingPoint, setMeetingPoint] = useState("");
	const [beThereAtDate, setBeThereAtDate] = useState("");
	const [beThereAtTime, setBeThereAtTime] = useState("");
	const [driverName, setDriverName] = useState("");
	const [driverPhoneCC, setDriverPhoneCC] = useState("+39");
	const [driverPhone, setDriverPhone] = useState("");
	const [additionalInfo, setAdditionalInfo] = useState("");
	const [pickupErrors, setPickupErrors] = useState<PickupErrors>({});

	useEffect(() => {
		if (!open) return;
		setMeetingPoint(route.meetingPoint ?? "");
		setBeThereAtDate(route.beThereAtDate ?? route.scheduledDate ?? "");
		setBeThereAtTime(
			route.beThereAtTime ??
				(route.type === "airport_in" ? (route.scheduledTime ?? "") : ""),
		);
		setDriverName(route.driverName ?? "");
		const phoneMatch = route.driverPhone?.match(/^(\+\d+)\s(.+)$/);
		setDriverPhoneCC(phoneMatch?.[1] ?? "+39");
		setDriverPhone(phoneMatch?.[2] ?? route.driverPhone ?? "");
		setAdditionalInfo(route.additionalInfo ?? "");
		setPickupErrors({});
	}, [open, route]);

	const handleSave = () => {
		const result = pickupSchema.safeParse({
			meetingPoint,
			beThereAtDate,
			beThereAtTime,
			driverName,
			driverPhoneCountryCode: driverPhoneCC,
			driverPhone,
			additionalInfo,
		});
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setPickupErrors(
				Object.fromEntries(
					Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]),
				),
			);
			return;
		}
		setPickupErrors({});

		const routes = allRoutes.map((r, j) => ({
			pickup: r.pickup,
			destination: r.destination,
			type: (r.type ?? undefined) as
				| "airport_in"
				| "standard"
				| "airport_out"
				| undefined,
			scheduledDate: r.scheduledDate ?? undefined,
			scheduledTime: r.scheduledTime ?? undefined,
			flightNumber: r.flightNumber ?? undefined,
			meetingPoint:
				j === routeIndex
					? meetingPoint || undefined
					: (r.meetingPoint ?? undefined),
			beThereAtDate:
				j === routeIndex
					? beThereAtDate || undefined
					: (r.beThereAtDate ?? undefined),
			beThereAtTime:
				j === routeIndex
					? beThereAtTime || undefined
					: (r.beThereAtTime ?? undefined),
			driverName:
				j === routeIndex
					? driverName || undefined
					: (r.driverName ?? undefined),
			driverPhone:
				j === routeIndex
					? driverPhoneCC && driverPhone
						? `${driverPhoneCC} ${driverPhone}`.trim() || undefined
						: undefined
					: (r.driverPhone ?? undefined),
			additionalInfo:
				j === routeIndex
					? additionalInfo || undefined
					: (r.additionalInfo ?? undefined),
		}));

		onSave(
			{ id: requestId, notify: true, routes },
			{ onSuccess: () => setOpen(false) },
		);
	};

	return (
		<AppDialog
			open={open}
			onOpenChange={setOpen}
			title={t("pickupSection")}
			onSave={handleSave}
			isLoading={isLoading}
			notifyCustomer
			trigger={
				<Button
					variant={inBanner ? "warning" : "secondary"}
					size="sm"
					className="w-full sm:w-auto"
				>
					<MapPinned />
					{t("editPickup")}
				</Button>
			}
		>
			<div className="space-y-4">
				{route.type === "airport_in" && (
					<AlertBanner
						variant="info"
						title={tCommon("pickupAirportInAdminNoticeTitle")}
						description={tCommon("pickupAirportInAdminNotice")}
					/>
				)}

				<CustomInput
					labelText={tCommon("pickupInfoMeetingPoint")}
					required
					placeholder={tCommon("pickupInfoMeetingPointPlaceholder")}
					error={pickupErrors.meetingPoint}
					inputProps={{
						value: meetingPoint,
						onChange: (e) => setMeetingPoint(e.target.value),
					}}
				/>
				<CustomInput
					labelText={tCommon("pickupInfoBeThereAtDate")}
					required
					inputType="date"
					error={pickupErrors.beThereAtDate}
					inputProps={{
						value: beThereAtDate,
						onChange: (e) => setBeThereAtDate(e.target.value),
					}}
				/>
				<CustomInput
					labelText={tCommon("pickupInfoBeThereAtTime")}
					required
					inputType="time"
					error={pickupErrors.beThereAtTime}
					inputProps={{
						value: beThereAtTime,
						onChange: (e) => setBeThereAtTime(e.target.value),
					}}
				/>
				<CustomTextArea
					labelText={tCommon("pickupInfoAdditionalInfo")}
					rows={3}
					placeholder={tCommon("pickupInfoAdditionalInfoPlaceholder")}
					textAreaProps={{
						value: additionalInfo,
						onChange: (e) => setAdditionalInfo(e.target.value),
					}}
				/>

				<SectionDivider title={tCommon("driverInfoDetails")} />
				<div className="space-y-1">
					<CustomSelect
						labelText={tCommon("pickupInfoSelectDriver")}
						placeholder={tCommon("pickupInfoSelectDriverPlaceholder")}
						value=""
						options={drivers.map((d) => ({
							value: d.id,
							label: `${d.name} ${d.surname}`,
						}))}
						onValueChange={(driverId) => {
							const d = drivers.find((dr) => dr.id === driverId);
							if (!d) return;
							setDriverName(`${d.name} ${d.surname}`);
							const match = d.phone.match(/^(\+\d+)\s(.+)$/);
							setDriverPhoneCC(match?.[1] ?? "+39");
							setDriverPhone(match?.[2] ?? d.phone);
						}}
					/>
					<Link
						href={`/${params.locale}/admin/settings#drivers`}
						className="text-xs text-muted-foreground underline underline-offset-3"
					>
						{t("addDriversLink")}
					</Link>
				</div>

				<CustomInput
					labelText={tCommon("pickupInfoDriverName")}
					required
					placeholder={tCommon("pickupInfoDriverNamePlaceholder")}
					error={pickupErrors.driverName}
					inputProps={{
						value: driverName,
						onChange: (e) => setDriverName(e.target.value),
					}}
				/>
				<PhoneInput
					labelText={tCommon("pickupInfoDriverPhone")}
					required
					countryCode={driverPhoneCC}
					onCountryCodeChange={setDriverPhoneCC}
					phoneNumber={driverPhone}
					onPhoneNumberChange={setDriverPhone}
					error={
						pickupErrors.driverPhone ?? pickupErrors.driverPhoneCountryCode
					}
				/>
			</div>
		</AppDialog>
	);
}

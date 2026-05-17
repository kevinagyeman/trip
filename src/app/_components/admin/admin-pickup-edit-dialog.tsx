"use client";

import { AppDialog } from "@/app/_components/ui/app-dialog";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { RequiredLabel } from "@/app/_components/ui/required-label";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { pickupSchema, type PickupFormValues } from "@/lib/schemas/pickup";
import { MapPinned } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface RouteData {
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

interface Driver {
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
		setBeThereAtDate(route.beThereAtDate ?? "");
		setBeThereAtTime(route.beThereAtTime ?? "");
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
			saveLabel={t("saveAndNotifyCustomer")}
			trigger={
				<Button
					variant="secondary"
					size="sm"
					className={
						inBanner
							? "dark:text-yellow-200 text-yellow-900 dark:border-yellow-800 border-yellow-900 dark:bg-yellow-950/30 bg-yellow-100 hover:bg-yellow-100 hover:dark:bg-yellow-950/30 border"
							: ""
					}
				>
					<MapPinned />
					{t("editPickup")}
				</Button>
			}
		>
			<div className="space-y-4">
				{drivers.length > 0 && (
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
				)}

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<CustomInput
						className="sm:col-span-2"
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
					<div className="space-y-2">
						<Label className="mb-2">
							{tCommon("pickupInfoDriverPhone")}
							<RequiredLabel />
						</Label>
						<PhoneInput
							countryCode={driverPhoneCC}
							onCountryCodeChange={setDriverPhoneCC}
							phoneNumber={driverPhone}
							onPhoneNumberChange={setDriverPhone}
							error={
								pickupErrors.driverPhone ?? pickupErrors.driverPhoneCountryCode
							}
						/>
						{(pickupErrors.driverPhone ??
							pickupErrors.driverPhoneCountryCode) && (
							<small className="text-xs text-destructive">
								{pickupErrors.driverPhone ??
									pickupErrors.driverPhoneCountryCode}
							</small>
						)}
					</div>
					<CustomTextArea
						className="sm:col-span-2"
						labelText={tCommon("pickupInfoAdditionalInfo")}
						rows={3}
						placeholder={tCommon("pickupInfoAdditionalInfoPlaceholder")}
						textAreaProps={{
							value: additionalInfo,
							onChange: (e) => setAdditionalInfo(e.target.value),
						}}
					/>
				</div>
			</div>
		</AppDialog>
	);
}

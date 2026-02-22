"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_TYPES, AIRPORTS } from "@/lib/airports";
import CustomInput from "@/app/_components/ui/custom-input";
import {
	confirmTripSchema,
	type ConfirmTripFormValues,
} from "@/lib/schemas/trip-request";
import { useTranslations } from "next-intl";

interface ConfirmTripFormProps {
	requestId: string;
}

export function ConfirmTripForm({ requestId }: ConfirmTripFormProps) {
	const router = useRouter();
	const t = useTranslations("confirmTrip");

	const { data: request, isLoading } = api.tripRequest.getById.useQuery({
		id: requestId,
	});

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<ConfirmTripFormValues>({
		resolver: zodResolver(confirmTripSchema),
		values: request
			? {
					arrivalFlightDate: request.arrivalFlightDate
						? new Date(request.arrivalFlightDate)
						: undefined,
					arrivalFlightTime: request.arrivalFlightTime ?? "",
					arrivalFlightNumber: request.arrivalFlightNumber ?? "",
					departureFlightDate: request.departureFlightDate
						? new Date(request.departureFlightDate)
						: undefined,
					departureFlightTime: request.departureFlightTime ?? "",
					departureFlightNumber: request.departureFlightNumber ?? "",
				}
			: undefined,
	});

	const confirmTrip = api.tripRequest.confirm.useMutation({
		onSuccess: () => {
			router.push(`/dashboard/requests/${requestId}`);
		},
	});

	const onSubmit = (values: ConfirmTripFormValues) => {
		confirmTrip.mutate({
			id: requestId,
			arrivalFlightDate: values.arrivalFlightDate,
			arrivalFlightTime: values.arrivalFlightTime || undefined,
			arrivalFlightNumber: values.arrivalFlightNumber || undefined,
			departureFlightDate: values.departureFlightDate,
			departureFlightTime: values.departureFlightTime || undefined,
			departureFlightNumber: values.departureFlightNumber || undefined,
		});
	};

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const serviceTypeLabel =
		SERVICE_TYPES.find((s) => s.value === request.serviceType)?.label ??
		request.serviceType;
	const showArrivalFields =
		request.serviceType === "both" || request.serviceType === "arrival";
	const showDepartureFields =
		request.serviceType === "both" || request.serviceType === "departure";

	const getAirportLabel = (code: string | null) => {
		if (!code) return "";
		return AIRPORTS.find((a) => a.value === code)?.label ?? code;
	};

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				{t("back")}
			</Button>

			<div className="rounded-lg bg-blue-50 p-4">
				<h2 className="mb-2 text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>

			{/* Read-only trip summary */}
			<Card>
				<CardHeader>
					<CardTitle>{t("tripInfoReadOnly")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">
								{t("serviceType")}
							</p>
							<p className="font-medium">{serviceTypeLabel}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("language")}</p>
							<p className="font-medium">{request.language}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("name")}</p>
							<p className="font-medium">
								{request.firstName} {request.lastName}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("phone")}</p>
							<p className="font-medium">{request.phone}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("adults")}</p>
							<p className="font-medium">{request.numberOfAdults}</p>
						</div>
						{request.areThereChildren && (
							<div>
								<p className="text-sm text-muted-foreground">{t("children")}</p>
								<p className="font-medium">
									{request.numberOfChildren} ({request.ageOfChildren})
								</p>
							</div>
						)}
					</div>

					{showArrivalFields && (
						<div className="rounded-lg border p-3">
							<p className="mb-2 font-semibold">{t("arrival")}</p>
							<div className="grid gap-2">
								{request.arrivalAirport && (
									<p className="text-sm">
										<span className="text-muted-foreground">
											{t("airport")}:{" "}
										</span>
										{getAirportLabel(request.arrivalAirport)}
									</p>
								)}
								{request.destinationAddress && (
									<p className="text-sm">
										<span className="text-muted-foreground">
											{t("destination")}:{" "}
										</span>
										{request.destinationAddress}
									</p>
								)}
							</div>
						</div>
					)}

					{showDepartureFields && (
						<div className="rounded-lg border p-3">
							<p className="mb-2 font-semibold">{t("departure")}</p>
							<div className="grid gap-2">
								{request.pickupAddress && (
									<p className="text-sm">
										<span className="text-muted-foreground">
											{t("pickup")}:{" "}
										</span>
										{request.pickupAddress}
									</p>
								)}
								{request.departureAirport && (
									<p className="text-sm">
										<span className="text-muted-foreground">
											{t("airport")}:{" "}
										</span>
										{getAirportLabel(request.departureAirport)}
									</p>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Flight details form */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{showArrivalFields && (
					<Card>
						<CardHeader>
							<CardTitle>{t("arrivalFlightDetails")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>{t("flightDate")}</Label>
								<Controller
									name="arrivalFlightDate"
									control={control}
									render={({ field }) => (
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!field.value && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value
														? format(field.value, "PPP")
														: t("pickArrivalDate")}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
												/>
											</PopoverContent>
										</Popover>
									)}
								/>
								{errors.arrivalFlightDate && (
									<small className="text-xs text-destructive">
										{errors.arrivalFlightDate.message}
									</small>
								)}
							</div>

							<CustomInput
								labelText={t("flightTime")}
								placeholder={t("flightTimePlaceholderArrival")}
								error={errors.arrivalFlightTime?.message}
								inputProps={{ ...register("arrivalFlightTime") }}
							/>

							<CustomInput
								labelText={t("flightNumber")}
								placeholder={t("flightNumberPlaceholderArrival")}
								error={errors.arrivalFlightNumber?.message}
								inputProps={{ ...register("arrivalFlightNumber") }}
							/>
						</CardContent>
					</Card>
				)}

				{showDepartureFields && (
					<Card>
						<CardHeader>
							<CardTitle>{t("departureFlightDetails")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>{t("flightDate")}</Label>
								<Controller
									name="departureFlightDate"
									control={control}
									render={({ field }) => (
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!field.value && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value
														? format(field.value, "PPP")
														: t("pickDepartureDate")}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
												/>
											</PopoverContent>
										</Popover>
									)}
								/>
								{errors.departureFlightDate && (
									<small className="text-xs text-destructive">
										{errors.departureFlightDate.message}
									</small>
								)}
							</div>

							<CustomInput
								labelText={t("flightTime")}
								placeholder={t("flightTimePlaceholderDeparture")}
								error={errors.departureFlightTime?.message}
								inputProps={{ ...register("departureFlightTime") }}
							/>

							<CustomInput
								labelText={t("flightNumber")}
								placeholder={t("flightNumberPlaceholderDeparture")}
								error={errors.departureFlightNumber?.message}
								inputProps={{ ...register("departureFlightNumber") }}
							/>
						</CardContent>
					</Card>
				)}

				<Button
					type="submit"
					disabled={confirmTrip.isPending}
					className="w-full"
					size="lg"
				>
					{confirmTrip.isPending ? t("confirming") : t("confirmButton")}
				</Button>

				{confirmTrip.error && (
					<p className="text-sm text-destructive">
						{confirmTrip.error.message}
					</p>
				)}
			</form>
		</div>
	);
}

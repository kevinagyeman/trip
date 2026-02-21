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

interface ConfirmTripFormProps {
	requestId: string;
}

export function ConfirmTripForm({ requestId }: ConfirmTripFormProps) {
	const router = useRouter();
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

	if (isLoading) return <div>Loading...</div>;
	if (!request) return <div>Not found</div>;

	const serviceTypeLabel =
		SERVICE_TYPES.find((t) => t.value === request.serviceType)?.label ??
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
				Back
			</Button>

			<div className="rounded-lg bg-blue-50 p-4">
				<h2 className="mb-2 text-lg font-semibold">
					Trip Confirmation - Step 2
				</h2>
				<p className="text-sm text-muted-foreground">
					Please provide your complete flight details to confirm your trip
					booking.
				</p>
			</div>

			{/* Read-only trip summary */}
			<Card>
				<CardHeader>
					<CardTitle>Trip Information (Read-Only)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Service Type</p>
							<p className="font-medium">{serviceTypeLabel}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Language</p>
							<p className="font-medium">{request.language}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Name</p>
							<p className="font-medium">
								{request.firstName} {request.lastName}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Phone</p>
							<p className="font-medium">{request.phone}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Adults</p>
							<p className="font-medium">{request.numberOfAdults}</p>
						</div>
						{request.areThereChildren && (
							<div>
								<p className="text-sm text-muted-foreground">Children</p>
								<p className="font-medium">
									{request.numberOfChildren} ({request.ageOfChildren})
								</p>
							</div>
						)}
					</div>

					{showArrivalFields && (
						<div className="rounded-lg border p-3">
							<p className="mb-2 font-semibold">Arrival</p>
							<div className="grid gap-2">
								{request.arrivalAirport && (
									<p className="text-sm">
										<span className="text-muted-foreground">Airport: </span>
										{getAirportLabel(request.arrivalAirport)}
									</p>
								)}
								{request.destinationAddress && (
									<p className="text-sm">
										<span className="text-muted-foreground">Destination: </span>
										{request.destinationAddress}
									</p>
								)}
							</div>
						</div>
					)}

					{showDepartureFields && (
						<div className="rounded-lg border p-3">
							<p className="mb-2 font-semibold">Departure</p>
							<div className="grid gap-2">
								{request.pickupAddress && (
									<p className="text-sm">
										<span className="text-muted-foreground">Pickup: </span>
										{request.pickupAddress}
									</p>
								)}
								{request.departureAirport && (
									<p className="text-sm">
										<span className="text-muted-foreground">Airport: </span>
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
							<CardTitle>Arrival Flight Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Flight Date</Label>
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
														: "Pick arrival date"}
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
								labelText="Flight Time"
								placeholder="e.g., 14:30"
								error={errors.arrivalFlightTime?.message}
								inputProps={{ ...register("arrivalFlightTime") }}
							/>

							<CustomInput
								labelText="Flight Number"
								placeholder="e.g., FR1234"
								error={errors.arrivalFlightNumber?.message}
								inputProps={{ ...register("arrivalFlightNumber") }}
							/>
						</CardContent>
					</Card>
				)}

				{showDepartureFields && (
					<Card>
						<CardHeader>
							<CardTitle>Departure Flight Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Flight Date</Label>
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
														: "Pick departure date"}
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
								labelText="Flight Time"
								placeholder="e.g., 18:45"
								error={errors.departureFlightTime?.message}
								inputProps={{ ...register("departureFlightTime") }}
							/>

							<CustomInput
								labelText="Flight Number"
								placeholder="e.g., FR5678"
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
					{confirmTrip.isPending ? "Confirming..." : "Confirm Trip Booking"}
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

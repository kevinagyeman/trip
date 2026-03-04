"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	confirmTripSchema,
	type ConfirmTripFormValues,
} from "@/lib/schemas/trip-request";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

type Route = { pickup: string; destination: string };

interface PublicConfirmTripFormProps {
	token: string;
}

export function PublicConfirmTripForm({ token }: PublicConfirmTripFormProps) {
	const router = useRouter();
	const t = useTranslations("confirmTrip");

	const { data: request, isLoading } = api.tripRequest.getByToken.useQuery({
		token,
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
					pickupDate: request.pickupDate
						? new Date(request.pickupDate)
						: (undefined as unknown as Date),
					pickupTime: request.pickupTime ?? "",
					flightNumber: request.flightNumber ?? "",
				}
			: undefined,
	});

	const confirmTrip = api.tripRequest.confirmByToken.useMutation({
		onSuccess: () => {
			router.push(`/request/${token}`);
		},
	});

	const onSubmit = (values: ConfirmTripFormValues) => {
		confirmTrip.mutate({
			token,
			pickupDate: values.pickupDate,
			pickupTime: values.pickupTime,
			flightNumber: values.flightNumber || undefined,
		});
	};

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = JSON.parse(request.routes) as Route[];

	return (
		<div className="space-y-6">
			<Button
				variant="outline"
				onClick={() => router.push(`/request/${token}`)}
			>
				{t("back")}
			</Button>

			<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
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

					{/* Routes */}
					<div>
						<p className="mb-2 font-semibold text-sm">{t("routes")}</p>
						<div className="space-y-2">
							{routes.map((route, i) => (
								<div key={i} className="rounded-lg border p-3 text-sm">
									<p className="mb-1 text-xs text-muted-foreground">
										{t("routeN", { n: i + 1 })}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("pickup")}:{" "}
										</span>
										{route.pickup}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("destination")}:{" "}
										</span>
										{route.destination}
									</p>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Pickup details form */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{t("pickupDetails")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label>{t("pickupDate")}</Label>
							<Controller
								name="pickupDate"
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
													: t("pickDate")}
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
							{errors.pickupDate && (
								<small className="text-xs text-destructive">
									{errors.pickupDate.message}
								</small>
							)}
						</div>

						<CustomInput
							labelText={t("pickupTime")}
							placeholder={t("pickupTimePlaceholder")}
							error={errors.pickupTime?.message}
							inputProps={{ ...register("pickupTime") }}
						/>

						<CustomInput
							labelText={t("flightNumber")}
							placeholder={t("flightNumberPlaceholder")}
							error={errors.flightNumber?.message}
							inputProps={{ ...register("flightNumber") }}
						/>
					</CardContent>
				</Card>

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

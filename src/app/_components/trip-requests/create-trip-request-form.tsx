"use client";

import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import CustomTextArea from "@/app/_components/ui/custom-textarea";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { SectionCard } from "@/app/_components/ui/section-card";
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
import { LANGUAGES } from "@/lib/quick-fill";
import {
	createTripRequestSchema,
	type CreateTripRequestFormValues,
} from "@/lib/schemas/trip-request";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Check,
	Copy,
	Minus,
	PlaneLanding,
	PlaneTakeoff,
	Plus,
	X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RequiredLabel } from "../ui/required-label";

export function CreateTripRequestForm({
	companySlug,
	isDemo = false,
	isPublic = false,
}: {
	companySlug: string;
	isDemo?: boolean;
	isPublic?: boolean;
}) {
	const router = useRouter();
	const t = useTranslations("tripRequest");
	const tq = useTranslations("publicQuote");
	const [shareData, setShareData] = useState<{
		token: string;
		values: CreateTripRequestFormValues;
	} | null>(null);
	const [textCopied, setTextCopied] = useState(false);

	const {
		register,
		handleSubmit,
		control,
		watch,
		getValues,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateTripRequestFormValues>({
		resolver: zodResolver(createTripRequestSchema),
		defaultValues: {
			routes: [{ pickup: "", destination: "" }],
			language: undefined,
			email: "",
			phoneCountryCode: "+39",
			numberOfAdults: 1,
			areThereChildren: false,
			numberOfChildren: 0,
			childrenAges: [],
			numberOfChildSeats: 0,
			privacyAccepted: false,
		},
	});

	const {
		fields: routeFields,
		append: appendRoute,
		remove: removeRoute,
	} = useFieldArray({ control, name: "routes" });

	const { fields: childrenAgeFields, replace: replaceChildrenAges } =
		useFieldArray({ control, name: "childrenAges" });

	const areThereChildren = watch("areThereChildren");
	const numberOfChildren = watch("numberOfChildren");
	const numberOfAdults = watch("numberOfAdults");

	useEffect(() => {
		if (!areThereChildren) {
			setValue("numberOfChildren", 0);
			setValue("numberOfChildSeats", 0);
			replaceChildrenAges([]);
		}
	}, [areThereChildren, setValue, replaceChildrenAges]);

	useEffect(() => {
		const count = Number(numberOfChildren) || 0;
		const current = getValues("childrenAges") ?? [];
		replaceChildrenAges(
			Array.from({ length: count }, (_, i) => ({
				age: current[i]?.age ?? "",
				unit: current[i]?.unit ?? "years",
			})),
		);
	}, [numberOfChildren, getValues, replaceChildrenAges]);

	const createRequest = api.tripRequest.create.useMutation({
		onSuccess: (data) => {
			router.push(`/request/${data.token}`);
		},
	});

	const createPublic = api.tripRequest.createPublic.useMutation({
		onSuccess: (data) => {
			setShareData({ token: data.token, values: getValues() });
		},
	});

	const buildShareText = (
		token: string,
		values: CreateTripRequestFormValues,
	) => {
		const name = `${values.firstName} ${values.lastName}`;
		const url = `${window.location.origin}/request/${token}`;
		const routeLines = values.routes
			.map((r, i) => {
				const lines = [`Route ${i + 1}: ${r.pickup} → ${r.destination}`];
				if (r.departureDate) lines.push(`Date: ${r.departureDate}`);
				if (r.flightNumber) lines.push(`Flight: ${r.flightNumber}`);
				return lines.join("\n");
			})
			.join("\n\n");
		return `${tq("shareIntro")}\n\n${tq("shareName", { name })}\n\n${routeLines}\n\nView all details: ${url}\n\n— Generated with dantrip`;
	};

	const onSubmit = (values: CreateTripRequestFormValues) => {
		if (isDemo) return;
		if (isPublic) {
			createPublic.mutate({
				email: values.email,
				routes: values.routes,
				language: values.language,
				firstName: values.firstName,
				lastName: values.lastName,
				phone: `${values.phoneCountryCode} ${values.phoneNumber}`,
				numberOfAdults: values.numberOfAdults,
				areThereChildren: values.areThereChildren,
				numberOfChildren: values.areThereChildren
					? values.numberOfChildren
					: undefined,
				ageOfChildren:
					values.areThereChildren && values.childrenAges?.length
						? values.childrenAges.map((c) => `${c.age} ${c.unit}`).join(", ")
						: undefined,
				numberOfChildSeats: values.areThereChildren
					? values.numberOfChildSeats
					: undefined,
				additionalInfo: values.additionalInfo || undefined,
			});
			return;
		}
		createRequest.mutate({
			companySlug,
			email: values.email,
			routes: values.routes,
			language: values.language,
			firstName: values.firstName,
			lastName: values.lastName,
			phone: `${values.phoneCountryCode} ${values.phoneNumber}`,
			numberOfAdults: values.numberOfAdults,
			areThereChildren: values.areThereChildren,
			numberOfChildren: values.areThereChildren
				? values.numberOfChildren
				: undefined,
			ageOfChildren:
				values.areThereChildren && values.childrenAges?.length
					? values.childrenAges.map((c) => `${c.age} ${c.unit}`).join(", ")
					: undefined,
			numberOfChildSeats: values.areThereChildren
				? values.numberOfChildSeats
				: undefined,
			additionalInfo: values.additionalInfo || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Routes */}
			<div className="space-y-6">
				{/* <TripRequestAlert /> */}

				{routeFields.map((field, index) => {
					const routeType = watch(`routes.${index}.type`);
					const answered = routeType !== undefined;
					const isAirportIn = routeType === "airport_in";
					const isAirportOut = routeType === "airport_out";
					const hasAirport = isAirportIn || isAirportOut;

					return (
						<SectionCard
							key={field.id}
							title={
								<div className="flex w-full items-center justify-between">
									<span>{t("routeN", { n: index + 1 })}</span>
									{routeFields.length > 1 && (
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => removeRoute(index)}
										>
											<X />
										</Button>
									)}
								</div>
							}
							contentClassName="space-y-4 pt-0"
						>
							{/* Airport Yes/No */}
							<div className="space-y-2">
								<p className="text-sm font-medium">{t("airportInvolved")}</p>
								<div className="flex gap-2">
									{(
										[
											{ isAirport: false, label: t("airportNo") },
											{ isAirport: true, label: t("airportYes") },
										] as const
									).map((opt) => {
										const isSelected = opt.isAirport
											? hasAirport
											: routeType === "standard";
										return (
											<button
												key={String(opt.isAirport)}
												type="button"
												onClick={() => {
													if (opt.isAirport) {
														setValue(`routes.${index}.type`, "airport_in");
													} else {
														setValue(`routes.${index}.type`, "standard");
														setValue(`routes.${index}.flightNumber`, "");
													}
												}}
												className={`rounded-lg border-2 px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
													isSelected
														? "border-primary bg-primary/5 text-primary"
														: "border-border text-muted-foreground hover:border-primary/50"
												}`}
											>
												{opt.label}
											</button>
										);
									})}
								</div>
							</div>

							{/* Airport direction + flight number */}
							{hasAirport && (
								<div className="flex gap-2">
									{(
										[
											{
												value: "airport_in",
												icon: PlaneLanding,
												label: t("flightArrival"),
											},
											{
												value: "airport_out",
												icon: PlaneTakeoff,
												label: t("flightDeparture"),
											},
										] as const
									).map((opt) => (
										<button
											key={opt.value}
											type="button"
											onClick={() =>
												setValue(`routes.${index}.type`, opt.value)
											}
											className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
												routeType === opt.value
													? "border-primary cursor-pointer bg-primary/5 text-primary"
													: "border-border cursor-pointer text-muted-foreground hover:border-primary/50"
											}`}
										>
											<opt.icon className="h-4 w-4" />
											{opt.label}
										</button>
									))}
								</div>
							)}

							{/* From / To / Date / Time / Flight number — only after Yes or No is selected */}
							{answered && (
								<>
									<CustomInput
										labelText={isAirportIn ? t("airport") : t("pickup")}
										required
										placeholder={
											isAirportIn
												? t("airportPlaceholder")
												: t("pickupPlaceholder")
										}
										error={errors.routes?.[index]?.pickup?.message}
										inputProps={{ ...register(`routes.${index}.pickup`) }}
									/>
									<CustomInput
										required
										labelText={isAirportOut ? t("airport") : t("destination")}
										placeholder={
											isAirportOut
												? t("airportPlaceholder")
												: t("destinationPlaceholder")
										}
										error={errors.routes?.[index]?.destination?.message}
										inputProps={{ ...register(`routes.${index}.destination`) }}
									/>
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<CustomInput
											labelText={t(
												isAirportIn
													? "routeLandingDate"
													: isAirportOut
														? "routeFlightDate"
														: "routeArrivalDate",
											)}
											error={errors.routes?.[index]?.departureDate?.message}
											inputProps={{
												...register(`routes.${index}.departureDate`),
												type: "date",
											}}
										/>
										<CustomInput
											labelText={t(
												isAirportIn
													? "routeLandingTime"
													: isAirportOut
														? "routeFlightTime"
														: "routeArrivalTime",
											)}
											error={errors.routes?.[index]?.departureTime?.message}
											inputProps={{
												...register(`routes.${index}.departureTime`),
												type: "time",
											}}
										/>
									</div>
									{hasAirport && (
										<CustomInput
											labelText={t("routeFlightNumber")}
											placeholder={t("routeFlightNumberPlaceholder")}
											inputProps={{
												...register(`routes.${index}.flightNumber`),
											}}
										/>
									)}
									<p className="text-base text-muted-foreground">
										{t("pickupTimeNote")}
									</p>
								</>
							)}
						</SectionCard>
					);
				})}
				<div className="bg-card rounded-md">
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() => appendRoute({ pickup: "", destination: "" })}
					>
						<Plus />
						{t("addRoute")}
					</Button>
				</div>

				{errors.routes?.root?.message && (
					<p className="text-sm text-destructive">
						{errors.routes.root.message}
					</p>
				)}
			</div>

			{/* Contact Details */}
			<SectionCard
				title={t("contactDetails")}
				contentClassName="space-y-4 pt-0"
			>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<CustomInput
						required
						labelText={t("firstName")}
						placeholder={t("firstNamePlaceholder")}
						error={errors.firstName?.message}
						inputProps={{ ...register("firstName") }}
					/>
					<CustomInput
						required
						labelText={t("lastName")}
						placeholder={t("lastNamePlaceholder")}
						error={errors.lastName?.message}
						inputProps={{ ...register("lastName") }}
					/>
				</div>
				<CustomInput
					required
					labelText={t("email")}
					placeholder={t("emailPlaceholder")}
					inputType="email"
					error={errors.email?.message}
					inputProps={{ ...register("email") }}
				/>
				<div>
					<Label className="mb-2">
						{t("phoneNumber")} <RequiredLabel />
					</Label>
					<PhoneInput
						countryCode={watch("phoneCountryCode")}
						onCountryCodeChange={(v) => setValue("phoneCountryCode", v)}
						phoneNumber={watch("phoneNumber") ?? ""}
						onPhoneNumberChange={(v) => setValue("phoneNumber", v)}
						placeholder={t("phonePlaceholder")}
						error={
							errors.phoneCountryCode?.message ?? errors.phoneNumber?.message
						}
					/>
					{(errors.phoneCountryCode ?? errors.phoneNumber) && (
						<small className="text-xs text-destructive">
							{errors.phoneCountryCode?.message ?? errors.phoneNumber?.message}
						</small>
					)}
				</div>
			</SectionCard>

			{/* Passengers */}
			<SectionCard title={t("passengers")} contentClassName="space-y-4 pt-0">
				<div className="space-y-1">
					<Label className="text-sm font-medium">{t("numberOfAdults")}</Label>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() =>
								setValue(
									"numberOfAdults",
									Math.max(1, Number(numberOfAdults) - 1),
								)
							}
						>
							<Minus className="h-4 w-4" />
						</Button>
						<span className="w-8 text-center font-medium tabular-nums">
							{Number(numberOfAdults) || 1}
						</span>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() =>
								setValue(
									"numberOfAdults",
									Math.min(100, Number(numberOfAdults) + 1),
								)
							}
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					{errors.numberOfAdults?.message && (
						<p className="text-xs text-destructive">
							{errors.numberOfAdults.message}
						</p>
					)}
				</div>

				<Controller
					name="areThereChildren"
					control={control}
					render={({ field }) => (
						<CustomCheckbox
							id="areThereChildren"
							checked={field.value}
							onCheckedChange={field.onChange}
							label={t("areThereChildren")}
						/>
					)}
				/>

				{areThereChildren && (
					<>
						<div className="space-y-1">
							<Label className="text-sm font-medium">
								{t("numberOfChildren")}
							</Label>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildren",
											Math.max(0, Number(numberOfChildren) - 1),
										)
									}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-8 text-center font-medium tabular-nums">
									{Number(numberOfChildren) || 0}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildren",
											Math.min(20, Number(numberOfChildren) + 1),
										)
									}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{errors.numberOfChildren?.message && (
								<p className="text-xs text-destructive">
									{errors.numberOfChildren.message}
								</p>
							)}
						</div>
						{childrenAgeFields.map((field, index) => (
							<div key={field.id} className="space-y-1">
								<Label className="text-sm font-medium">
									{t("childAge", { n: index + 1 })}
									<RequiredLabel />
								</Label>
								<div className="flex gap-2">
									<Input
										type="text"
										inputMode="numeric"
										placeholder="0"
										className="w-20"
										{...register(`childrenAges.${index}.age`, {
											onChange: (e) => {
												e.target.value = e.target.value.replace(/\D/g, "");
											},
										})}
									/>
									<Controller
										name={`childrenAges.${index}.unit`}
										control={control}
										render={({ field: unitField }) => (
											<Select
												value={unitField.value}
												onValueChange={unitField.onChange}
											>
												<SelectTrigger className="w-28">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="years">{t("ageYears")}</SelectItem>
													<SelectItem value="months">
														{t("ageMonths")}
													</SelectItem>
													<SelectItem value="days">{t("ageDays")}</SelectItem>
												</SelectContent>
											</Select>
										)}
									/>
								</div>
								{errors.childrenAges?.[index]?.age?.message && (
									<p className="text-xs text-destructive">
										{errors.childrenAges[index].age.message}
									</p>
								)}
							</div>
						))}
						<div className="space-y-1">
							<Label className="text-sm font-medium">
								{t("numberOfChildSeats")}
							</Label>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildSeats",
											Math.max(0, Number(watch("numberOfChildSeats")) - 1),
										)
									}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-8 text-center font-medium tabular-nums">
									{Number(watch("numberOfChildSeats")) || 0}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildSeats",
											Math.min(20, Number(watch("numberOfChildSeats")) + 1),
										)
									}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{errors.numberOfChildSeats?.message && (
								<p className="text-xs text-destructive">
									{errors.numberOfChildSeats.message}
								</p>
							)}
						</div>
					</>
				)}
				<p className="text-sm text-muted-foreground pt-1">
					{t("totalPassengers")}:{" "}
					<span className="font-semibold text-foreground">
						{(Number(numberOfAdults) || 0) +
							(areThereChildren ? Number(numberOfChildren) || 0 : 0)}
					</span>
				</p>
			</SectionCard>

			{/* Preferences */}
			<SectionCard title={t("preferences")} contentClassName="space-y-4 pt-0">
				<CustomTextArea
					labelText={t("specialRequests")}
					placeholder={t("specialRequestsPlaceholder")}
					rows={4}
					textAreaProps={{ ...register("additionalInfo") }}
				/>
				<Controller
					name="language"
					control={control}
					render={({ field }) => (
						<CustomSelect
							labelText={t("preferredLanguage")}
							placeholder={t("preferredLanguagePlaceholder")}
							options={LANGUAGES}
							value={field.value ?? ""}
							onValueChange={field.onChange}
							error={errors.language?.message}
						/>
					)}
				/>
			</SectionCard>

			{isPublic && shareData ? (
				<SectionCard
					title={tq("shareTitle")}
					subtitle={tq("shareSubtitle")}
					contentClassName="space-y-3 pt-0"
				>
					<Button
						type="button"
						className="w-full"
						onClick={async () => {
							await navigator.clipboard.writeText(
								buildShareText(shareData.token, shareData.values),
							);
							setTextCopied(true);
							setTimeout(() => setTextCopied(false), 2000);
						}}
					>
						{textCopied ? (
							<>
								<Check className="h-4 w-4" /> {tq("copied")}
							</>
						) : (
							<>
								<Copy className="h-4 w-4" /> {tq("copyText")}
							</>
						)}
					</Button>
					<div className="rounded-xl border bg-muted/40 p-4">
						<pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
							{buildShareText(shareData.token, shareData.values)}
						</pre>
					</div>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() => {
							setShareData(null);
							reset();
						}}
					>
						{tq("newRequest")}
					</Button>
				</SectionCard>
			) : isPublic ? (
				<SectionCard contentClassName="space-y-4 pt-0">
					<Controller
						name="privacyAccepted"
						control={control}
						render={({ field }) => (
							<CustomCheckbox
								id="privacyAccepted"
								checked={field.value}
								onCheckedChange={field.onChange}
								label={
									<span>
										{t("privacyPolicyAccept")}{" "}
										<a
											href="https://www.iubenda.com/privacy-policy/61494361"
											target="_blank"
											rel="noopener noreferrer"
											className="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed underline"
										>
											{t("privacyPolicyLink")}
										</a>
										<span className="ml-1">
											<RequiredLabel />
										</span>
									</span>
								}
								error={errors.privacyAccepted?.message}
							/>
						)}
					/>
					<LoadingButton
						type="submit"
						isLoading={createPublic.isPending}
						className="w-full"
						size="lg"
					>
						{tq("title")}
					</LoadingButton>
					{createPublic.error && (
						<p className="text-sm text-destructive mt-2">
							{createPublic.error.message}
						</p>
					)}
				</SectionCard>
			) : isDemo ? (
				<SectionCard contentClassName="space-y-3 pt-0 text-center">
					<p className="text-muted-foreground">{t("demoCtaDescription")}</p>
					<Button
						type="button"
						size="lg"
						className="w-full"
						onClick={() => {
							window.location.href = "/register-company";
						}}
					>
						{t("demoCtaButton")}
					</Button>
				</SectionCard>
			) : (
				<SectionCard contentClassName="space-y-4 pt-0">
					{/* Privacy Policy */}
					<Controller
						name="privacyAccepted"
						control={control}
						render={({ field }) => (
							<CustomCheckbox
								id="privacyAccepted"
								checked={field.value}
								onCheckedChange={field.onChange}
								label={
									<span>
										{t("privacyPolicyAccept")}{" "}
										<a
											href="https://www.iubenda.com/privacy-policy/61494361"
											target="_blank"
											rel="noopener noreferrer"
											className="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed underline"
										>
											{t("privacyPolicyLink")}
										</a>
										<span className="ml-1">
											<RequiredLabel />
										</span>
									</span>
								}
								error={errors.privacyAccepted?.message}
							/>
						)}
					/>
					<LoadingButton
						type="submit"
						isLoading={createRequest.isPending}
						className="w-full"
						size={"lg"}
						variant={"default"}
					>
						{t("submitRequest")}
					</LoadingButton>

					{createRequest.error && (
						<p className="text-sm text-destructive">
							{createRequest.error.message}
						</p>
					)}
				</SectionCard>
			)}
		</form>
	);
}

"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { NoticeDialog } from "@/app/_components/ui/notice-dialog";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { RouteCardWrapper } from "@/app/_components/ui/route-card-wrapper";
import { RouteDepartureSection } from "@/app/_components/ui/route-departure-section";
import { RoutePickupSection } from "@/app/_components/ui/route-pickup-section";
import {
	RouteFromToLabel,
	RouteTypeLabel,
} from "@/app/_components/ui/route-type-label";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { Check, X, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerDepartureEditDialog } from "./customer-departure-edit-dialog";
import { RejectionReasonDialog } from "./rejection-reason-dialog";
import { TripMessageThread } from "./trip-message-thread";

import {
	buildStatusLabels,
	canEditRequest,
	isRequestLocked,
	QUOTATION_STATUS_COLORS,
} from "@/lib/trip-utils";

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const tCommon = useTranslations("common");
	const tMessages = useTranslations("messages");
	const searchParams = useSearchParams();
	const isNew = searchParams.get("new") === "1";
	const [emailDialogOpen, setEmailDialogOpen] = useState(isNew);
	const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
	const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
	const router = useRouter();
	const pathname = usePathname();

	function closeEmailDialog() {
		setEmailDialogOpen(false);
		router.replace(pathname);
	}
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const {
		data: request,
		isLoading,
		isError,
	} = api.tripRequest.getByToken.useQuery({ token });

	const markAsViewed = api.tripRequest.markAsViewed.useMutation();
	useEffect(() => {
		markAsViewed.mutate({ token });
	}, [token]);

	const acceptQuotation = api.quotation.acceptByToken.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
			toast.success(tCommon("toastEmailSentToAdmin"));
		},
	});

	const rejectQuotation = api.quotation.rejectByToken.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
			setRejectionDialogOpen(false);
			setPendingRejectId(null);
			toast.success(tCommon("toastEmailSentToAdmin"));
		},
	});

	function handleRejectClick(quotationId: string) {
		setPendingRejectId(quotationId);
		setRejectionDialogOpen(true);
	}

	function handleRejectConfirm(reason: string) {
		if (!pendingRejectId) return;
		rejectQuotation.mutate({
			id: pendingRejectId,
			token,
			rejectionReason: reason || undefined,
		});
	}

	const updateRoutes = api.tripRequest.updateRoutes.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
			toast.success(tCommon("toastEmailSentToAdmin"));
		},
	});

	if (isLoading)
		return (
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-3">
					<Skeleton className="h-24 w-48 rounded-xl" />
					<Skeleton className="h-6 w-40" />
				</div>
				<div className="rounded-lg border p-4 space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-5 w-20 rounded-full" />
					</div>
				</div>
				<div className="rounded-lg border p-4 space-y-3">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-8 w-28" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-28 rounded-md" />
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
				</div>
				<div className="rounded-lg border p-4 space-y-2">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<div className="rounded-lg border p-4 space-y-2">
					<Skeleton className="h-5 w-28" />
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
			</div>
		);
	if (isError) return <div>{t("error")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes = request.routes;
	const isLocked = isRequestLocked(request.status);
	const canEdit = canEditRequest(request.status) && !!request.company;

	return (
		<div className="space-y-6">
			{/* Dantrip promo — only for public requests */}
			{!request.company && (
				<SectionCard
					title={t("dantripPromoTitle")}
					subtitle={t("dantripPromoDescription")}
					contentClassName="pt-0"
				>
					<Link href="/register-company">
						<Button className="w-full" size="lg">
							<Zap className="h-4 w-4" />
							{t("dantripPromoCta")}
						</Button>
					</Link>
				</SectionCard>
			)}

			{/* Company */}
			{request.company && (
				<div className="space-y-4">
					{request.company.logoUrl && (
						<div className="mx-auto w-fit rounded-xl bg-white p-4">
							<Image
								src={request.company.logoUrl}
								alt={request.company.name}
								width={200}
								height={80}
								unoptimized
								className="h-20 object-contain"
							/>
						</div>
					)}
					<h1 className="text-center text-lg font-bold sm:text-2xl">
						{request.company.name}
					</h1>
				</div>
			)}

			{request.company && (
				<NoticeDialog
					open={emailDialogOpen}
					title={t("emailNoticeTitle2")}
					confirmLabel={t("emailNoticeConfirm")}
					onConfirm={closeEmailDialog}
				>
					<AlertBanner
						variant="warning"
						description={t("emailNoticeBody", {
							customerEmail: request.customerEmail,
							fromEmail: request.fromEmail,
						})}
					/>
				</NoticeDialog>
			)}

			{/* Header */}
			<RequestHeaderCard
				orderNumber={request.orderNumber}
				firstName={request.firstName}
				lastName={request.lastName}
				status={request.status}
			/>

			{/* Quotations */}
			{request.quotations.map((quotation) => (
				<SectionCard
					key={quotation.id}
					title={
						<div className="flex items-center gap-2">
							<span>{t("quotations")}</span>
							<span className={QUOTATION_STATUS_COLORS[quotation.status]}>
								{quotation.status}
							</span>
						</div>
					}
					contentClassName="space-y-4 pt-0"
				>
					<div>
						<p className="text-2xl font-bold">
							{quotation.price.toString()}{" "}
							<span className="text-sm">{quotation.currency} </span>
						</p>
						<p>
							{quotation.isPriceEachWay ? t("priceEachWay") : t("priceTotal")}
						</p>
						{quotation.areCarSeatsIncluded && <p>{t("carSeatsIncluded")}</p>}
					</div>
					{quotation.quotationAdditionalInfo && (
						<div>
							<p className="text-base text-muted-foreground">
								{t("additionalInfoLabel")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-base">
								{quotation.quotationAdditionalInfo}
							</p>
						</div>
					)}
					{quotation.status === "ACCEPTED" &&
						!["CONFIRMED", "COMPLETED", "CANCELLED"].includes(
							request.status,
						) && (
							<AlertBanner
								title={t("quotationAccepted")}
								variant="success"
								description={t("quotationAcceptedNotice")}
							/>
						)}
					{quotation.status === "REJECTED" && (
						<AlertBanner
							title={t("quotationRejected")}
							variant="error"
							description={t("quotationRejectedNotice")}
						/>
					)}
					{!isLocked &&
						quotation.status === "PENDING" &&
						quotation.notifiedAt && (
							<div className="flex flex-wrap gap-2">
								<LoadingButton
									variant={"success"}
									className="w-full sm:w-auto"
									onClick={() =>
										acceptQuotation.mutate({ id: quotation.id, token })
									}
									isLoading={acceptQuotation.isPending}
									disabled={rejectQuotation.isPending}
									notifyAdmin
								>
									<Check />
									{t("acceptQuotation")}
								</LoadingButton>
								<LoadingButton
									variant="danger"
									className="w-full sm:w-auto"
									onClick={() => handleRejectClick(quotation.id)}
									isLoading={rejectQuotation.isPending}
									disabled={acceptQuotation.isPending}
									notifyAdmin
								>
									<X />
									{t("rejectQuotation")}
								</LoadingButton>
							</div>
						)}
				</SectionCard>
			))}

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="pt-0">
				{routes.map((route, i) => (
					<RouteCardWrapper key={i} isLast={i === routes.length - 1}>
						{/* 1 – Route */}
						<div className="p-3">
							<RouteTypeLabel routeType={route.type} n={i + 1} />
							<RouteFromToLabel
								routeType={route.type}
								pickup={route.pickup}
								destination={route.destination}
							/>
						</div>

						{/* 2 – Departure */}
						<div className="border-t border-dashed p-3 space-y-3">
							<RouteDepartureSection
								routeType={route.type}
								scheduledDate={route.scheduledDate}
								scheduledTime={route.scheduledTime}
								flightNumber={route.flightNumber}
							/>

							{canEdit && (
								<CustomerDepartureEditDialog
									route={route}
									routeIndex={i}
									allRoutes={routes}
									isLoading={updateRoutes.isPending}
									label={`${t("editDeparture")} — ${tCommon("routeN", { n: i + 1 })}`}
									onSave={(routesPayload, options) =>
										updateRoutes.mutate(
											{ token, routes: routesPayload },
											options,
										)
									}
								/>
							)}
						</div>

						{/* 3 – Pickup */}
						{["CONFIRMED", "COMPLETED", "CANCELLED"].includes(request.status) &&
							!!(
								route.meetingPoint ??
								route.beThereAtDate ??
								route.driverName
							) && (
								<div className="border-t border-dashed p-3">
									<RoutePickupSection
										pickup={route.pickup}
										destination={route.destination}
										driverName={route.driverName}
										driverPhone={route.driverPhone}
										beThereAtDate={route.beThereAtDate}
										beThereAtTime={route.beThereAtTime}
										meetingPoint={route.meetingPoint}
										additionalInfo={route.additionalInfo}
										routeType={route.type}
										flightNumber={route.flightNumber}
										tripInfo={request}
										inBanner={true}
										disabled={isLocked}
									/>
								</div>
							)}
					</RouteCardWrapper>
				))}
			</SectionCard>

			{/* Contact */}
			<ContactDetailsCard
				email={request.customerEmail}
				phone={request.phone}
				language={request.language}
				firstName={request.firstName}
				lastName={request.lastName}
			/>

			{/* Passengers */}
			<PassengersCard
				numberOfAdults={request.numberOfAdults}
				areThereChildren={request.areThereChildren}
				numberOfChildren={request.numberOfChildren}
				ageOfChildren={request.ageOfChildren}
				numberOfChildSeats={request.numberOfChildSeats}
				additionalInfo={request.additionalInfo}
			/>

			{/* Messages */}
			{request.company && (
				<SectionCard
					title={tMessages("title")}
					subtitle={t("messagesSubtitle")}
				>
					<TripMessageThread
						mode="customer"
						token={token}
						disabled={isLocked}
					/>
				</SectionCard>
			)}

			{/* Dantrip promo — only for public requests */}
			{!request.company && (
				<SectionCard
					title={t("dantripPromoTitle")}
					subtitle={t("dantripPromoDescription")}
					contentClassName="pt-0"
				>
					<Link href="/register-company">
						<Button className="w-full" size="lg">
							<Zap className="h-4 w-4" />
							{t("dantripPromoCta")}
						</Button>
					</Link>
				</SectionCard>
			)}

			<RejectionReasonDialog
				open={rejectionDialogOpen}
				onOpenChange={setRejectionDialogOpen}
				onConfirm={handleRejectConfirm}
				isLoading={rejectQuotation.isPending}
			/>
		</div>
	);
}

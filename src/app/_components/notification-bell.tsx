"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
	NEW_MESSAGE: "New message",
	TRIP_DETAILS_UPDATED: "Trip details updated",
	QUOTATION_ACCEPTED: "Quotation accepted",
	QUOTATION_REJECTED: "Quotation rejected",
};

export function NotificationBell() {
	const router = useRouter();
	const utils = api.useUtils();

	const { data: notifications = [] } = api.notification.getAll.useQuery(
		undefined,
		{ refetchInterval: 30_000 },
	);

	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => void utils.notification.getAll.invalidate(),
	});
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => void utils.notification.getAll.invalidate(),
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	function handleClick(id: string, tripRequestId: string | null) {
		markRead.mutate({ id });
		if (tripRequestId) router.push(`/admin/requests/${tripRequestId}`);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between px-3 py-2">
					<span className="text-sm font-semibold">Notifications</span>
					{unreadCount > 0 && (
						<Button
							onClick={() => markAllRead.mutate()}
							size={"xs"}
							variant={"ghost"}
							className="text-muted-foreground"
						>
							Mark all read
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />
				<div className="max-h-96 overflow-y-auto space-y-1">
					{notifications.length === 0 ? (
						<div className="py-6 text-center text-sm text-muted-foreground">
							No notifications
						</div>
					) : (
						notifications.map((n) => (
							<DropdownMenuItem
								key={n.id}
								className={`flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2 ${!n.read ? "bg-muted/50" : ""}`}
								onClick={() => handleClick(n.id, n.tripRequestId)}
							>
								<div className="flex w-full items-center justify-between">
									<span className="text-sm font-medium">
										{TYPE_LABELS[n.type] ?? n.type}
									</span>
									{!n.read && (
										<span className="h-2 w-2 rounded-full bg-blue-500" />
									)}
								</div>
								<span className="text-xs text-muted-foreground">
									{n.customerName} · #{n.orderNumber}
								</span>
								<span className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(n.createdAt), {
										addSuffix: true,
									})}
								</span>
							</DropdownMenuItem>
						))
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

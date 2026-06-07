import { db } from "@/server/db";
import type { NotificationType } from "../../generated/prisma";

export async function createNotificationsForAdmins(
	companyId: string | null | undefined,
	data: {
		type: NotificationType;
		tripRequestId?: string;
		orderNumber?: number;
		customerName?: string;
	},
) {
	if (!companyId) return;

	const admins = await db.user.findMany({
		where: { companyId, role: "ADMIN" },
		select: { id: true },
	});

	if (admins.length === 0) return;

	await db.notification.createMany({
		data: admins.map((admin) => ({
			userId: admin.id,
			...data,
		})),
	});
}

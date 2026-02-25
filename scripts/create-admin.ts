import { db } from "../src/server/db";

async function main() {
	// Get the first user or you can specify by email
	const users = await db.user.findMany({
		take: 1,
	});

	if (users.length === 0) {
		console.log("No users found in database.");
		console.log(
			"Please sign in first at http://localhost:3001 to create a user account.",
		);
		return;
	}

	const user = users[0]!;
	console.log(`Found user: ${user.email || user.name || user.id}`);

	// Update the first user to be an admin
	const updated = await db.user.update({
		where: { id: user.id },
		data: { role: "ADMIN" },
	});

	console.log(`✅ Updated ${updated.email || updated.name} to ADMIN role!`);
	console.log(`User ID: ${updated.id}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});

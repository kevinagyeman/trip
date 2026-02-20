import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CreateTripRequestButton() {
	return (
		<Link href="/dashboard/requests/new">
			<Button>New Trip Request</Button>
		</Link>
	);
}

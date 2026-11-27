import type { Prisma } from "@crm/db";

// Afrique Academy fork: individual (B2C) leads all live under one company named
// "Particuliers" (the website and the HubSpot import put them there). The
// "Client type" facet splits contacts and deals on that company.
// ponytail: matched by name; a real flag on Company if it ever gets renamed.
export const INDIVIDUALS_COMPANY = "Particuliers";

export function clientTypeCompany(
	values: readonly string[],
): Prisma.CompanyWhereInput | undefined {
	const business = values.includes("business");
	const individual = values.includes("individual");
	if (business === individual) return undefined;
	return business
		? { name: { not: INDIVIDUALS_COMPANY } }
		: { name: INDIVIDUALS_COMPANY };
}

import type { DataTableFacet } from "@crm/ui/components/data-table";

// Afrique Academy fork: splits contacts and deals between companies and the
// "Particuliers" company that holds individual leads (see api crm/client-type.ts).
export const CLIENT_TYPE_FACET: DataTableFacet = {
	id: "client",
	label: "Type de client",
	options: [
		{ value: "business", label: "Entreprises" },
		{ value: "individual", label: "Particuliers" },
	],
};

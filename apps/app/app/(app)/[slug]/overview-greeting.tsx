"use client";

import { useQueryState } from "nuqs";
import { PageShellDescription, PageShellTitle } from "@/components/page-shell";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { overviewParsers } from "./overview-search-params";

export function OverviewGreetingFallback() {
	return (
		<>
			<PageShellTitle>Bon retour</PageShellTitle>
			<PageShellDescription>
				Ce que vous avez conclu, ce qui est en cours et ce qui vous attend
				aujourd'hui.
			</PageShellDescription>
		</>
	);
}

export function OverviewGreeting() {
	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	return (
		<>
			<PageShellTitle>Bon retour</PageShellTitle>
			<PageShellDescription>
				{scope === "me"
					? "Ce que vous avez conclu, ce qui est en cours et ce qui vous attend aujourd'hui."
					: "Ce que l'équipe a conclu, ce qui est en cours et ce qui vous attend aujourd'hui."}
			</PageShellDescription>
		</>
	);
}

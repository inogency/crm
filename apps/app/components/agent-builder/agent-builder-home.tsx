"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { Icon } from "@crm/ui/components/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { AgentComposer, type BuilderComposerPrompt } from "./agent-composer";

const SUGGESTIONS = [
	"Préparer un brief avant chaque rendez-vous client",
	"Signaler les affaires sans activité depuis 14 jours",
	"Prévenir l'équipe pédagogique de chaque affaire gagnée",
];

export function AgentBuilderHome({ name }: { name: string }) {
	const workspaceUrl = useWorkspaceUrl();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const router = useRouter();
	const [initialPrompt, setInitialPrompt] = useState("");
	const create = useMutation(
		trpc.conversations.createBuilder.mutationOptions({
			onSuccess: async ({ id }) => {
				await queryClient.invalidateQueries({
					queryKey: trpc.conversations.builderList.pathKey(),
				});
				// Afrique Academy fork: history.replaceState only rewrote the URL, the page stayed on
				// the empty home until the chat was clicked in the sidebar. router.replace renders it
				// (and still adds no history entry).
				router.replace(workspaceUrl(`/chat/${id}`));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const submit = async (
		prompt: BuilderComposerPrompt,
		clientRequestId: string,
	) => {
		await create.mutateAsync({
			...prompt,
			clientRequestId,
		});
	};

	return (
		<main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pt-14 pb-20 sm:px-6 sm:pt-12 sm:pb-28">
			<div className="flex w-full max-w-3xl flex-col items-center gap-3 pb-6 text-center">
				<h1 className="text-balance font-medium text-2xl tracking-tight sm:text-3xl">
					Que puis-je faire pour vous, {firstName(name)} ?
				</h1>
				<p className="max-w-xl text-balance text-muted-foreground text-sm">
					Posez une question sur votre CRM, mentionnez une fiche ou une
					intégration, ou décrivez un agent à créer pour automatiser une tâche.
				</p>
			</div>

			<div className="w-full max-w-3xl">
				<AgentComposer
					key={initialPrompt}
					mode="home"
					initialPrompt={initialPrompt}
					onSubmit={submit}
				/>
				<p className="flex h-8 items-center px-px text-muted-foreground text-xs">
					Vos discussions et brouillons d'agents restent privés. Déployer un
					agent le rend disponible pour toute l'équipe.
				</p>

				<div className="pt-1">
					<p className="flex h-7 items-center text-muted-foreground text-xs">
						Agents suggérés
					</p>
					{SUGGESTIONS.map((suggestion) => (
						<button
							key={suggestion}
							type="button"
							onClick={() => setInitialPrompt(`/Create agent ${suggestion}`)}
							className="flex h-[42px] w-full items-center border-t text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
						>
							<span className="min-w-0 flex-1 font-medium text-sm">
								{suggestion}
							</span>
							<Icon
								icon={ArrowRight}
								className="size-4 text-muted-foreground"
							/>
						</button>
					))}
				</div>
			</div>
		</main>
	);
}

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || "vous";
}

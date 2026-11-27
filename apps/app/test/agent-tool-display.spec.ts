import { describe, expect, it } from "bun:test";
import { toolLabel } from "../lib/agent-tool-display";

const base = { label: "Ran a tool", pending: false };

describe("toolLabel", () => {
	it("names the artifact a builder file write produced", () => {
		expect(
			toolLabel({
				...base,
				tool: "write_agent_file",
				input: { path: "agent/instructions.md" },
				pending: true,
			}),
		).toBe("Rédige les instructions");
	});

	it("switches to the past tense once the write finished", () => {
		expect(
			toolLabel({
				...base,
				tool: "write_agent_file",
				input: { path: "agent/manifest.json" },
			}),
		).toBe("A écrit le manifeste");
	});

	it("does not expose an untrusted artifact path", () => {
		expect(
			toolLabel({
				...base,
				tool: "write_agent_file",
				input: { path: "agent/other.md" },
			}),
		).toBe("A écrit un fichier");
	});

	it("does not expose an untrusted draft name", () => {
		expect(
			toolLabel({
				...base,
				tool: "save_agent_draft",
				input: { name: "Collections nudge" },
			}),
		).toBe("Brouillon enregistré");
	});

	it("uses a trusted catalog name for a connected tool", () => {
		expect(
			toolLabel({
				...base,
				tool: "linear__create_issue",
				input: { title: "Untrusted title" },
				pending: true,
			}),
		).toBe("Utilise Linear");
	});

	it("hides unknown provider and tool names", () => {
		expect(
			toolLabel({
				...base,
				tool: "fake-provider__delete_everything",
				input: null,
			}),
		).toBe("A utilisé un outil connecté");
	});

	it("describes a connection call with trusted catalog data", () => {
		expect(
			toolLabel({
				...base,
				tool: "connection_execute",
				input: { connection: "linear", tool: "create_issue" },
				pending: true,
			}),
		).toBe("Demande à Linear : create issue");
	});

	it("hides an unknown connection call", () => {
		expect(
			toolLabel({
				...base,
				tool: "connection_execute",
				input: { connection: "unknown", tool: "delete_everything" },
			}),
		).toBe("A utilisé un outil connecté");
	});

	it("keeps the generic label when the tool has no mapping", () => {
		expect(
			toolLabel({ ...base, tool: "web_search", input: { query: "acme" } }),
		).toBe("Ran a tool");
	});

	it("uses a trusted generic file label when the input is missing", () => {
		expect(toolLabel({ ...base, tool: "write_agent_file", input: null })).toBe(
			"A écrit un fichier",
		);
	});
});

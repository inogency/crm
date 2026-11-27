import { describe, expect, it } from "bun:test";
import { clientTypeCompany, INDIVIDUALS_COMPANY } from "../src/crm/client-type";

describe("client type facet", () => {
	it("keeps companies only", () => {
		expect(clientTypeCompany(["business"])).toEqual({
			name: { not: INDIVIDUALS_COMPANY },
		});
	});

	it("keeps individuals only", () => {
		expect(clientTypeCompany(["individual"])).toEqual({
			name: INDIVIDUALS_COMPANY,
		});
	});

	it("does not filter when nothing or both are chosen", () => {
		expect(clientTypeCompany([])).toBeUndefined();
		expect(clientTypeCompany(["business", "individual"])).toBeUndefined();
	});
});

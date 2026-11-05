import { describe, expect, test } from "vitest";
import {
	type OptionsLoad,
	optionsLoad,
} from "../src/components/field/options-load.ts";

class StatusError extends Error {
	readonly status: number;

	constructor(status: number) {
		super(`Failed with ${status}.`);
		this.status = status;
	}
}

const retryable = (error: unknown): boolean =>
	!(error instanceof StatusError) || error.status >= 500;

const retryOf = (load: OptionsLoad) =>
	load.status === "error" ? load.retry : undefined;

const query = (
	state: Partial<{
		data: unknown;
		error: unknown;
		isFetching: boolean;
	}>,
	refetch: () => Promise<unknown> = () => Promise.resolve(),
) => ({
	data: undefined,
	error: null,
	isFetching: false,
	refetch,
	...state,
});

describe("optionsLoad", () => {
	test("is loaded once the query holds data, even when a refetch failed", () => {
		expect(
			optionsLoad(
				query({ data: [], error: new StatusError(500) }),
				retryable,
			),
		).toEqual({ status: "success" });
	});

	test("is pending while the query fetches without data", () => {
		expect(
			optionsLoad(query({ isFetching: true })).status,
		).toBe("pending");
	});

	test("is pending while a retry after a failure is in flight", () => {
		expect(
			optionsLoad(
				query({
					isFetching: true,
					error: new StatusError(500),
				}),
				retryable,
			).status,
		).toBe("pending");
	});

	test("offers a retry that refetches when trying again can help", () => {
		let refetched = 0;
		const load = optionsLoad(
			query({ error: new StatusError(503) }, () => {
				refetched += 1;
				return Promise.resolve();
			}),
			retryable,
		);
		expect(load.status).toBe("error");
		retryOf(load)?.();
		expect(refetched).toBe(1);
	});

	test("offers a retry after a network failure", () => {
		expect(
			retryOf(
				optionsLoad(
					query({ error: new TypeError("offline") }),
					retryable,
				),
			),
		).toBeDefined();
	});

	test("offers no retry when trying again cannot help", () => {
		expect(
			optionsLoad(
				query({ error: new StatusError(404) }),
				retryable,
			),
		).toEqual({ status: "error" });
	});

	test("offers a retry for any failure without a predicate", () => {
		expect(
			retryOf(
				optionsLoad(query({ error: new StatusError(404) })),
			),
		).toBeDefined();
	});
});

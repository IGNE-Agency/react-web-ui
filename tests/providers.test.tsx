import type { ReactNode } from "react";
import { useLocale as useAriaLocale } from "react-aria-components";
import {
	ErrorBoundary,
	type FallbackProps,
} from "react-error-boundary";
import {
	afterEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { render } from "vitest-browser-react";
import {
	LocaleProvider,
	useLocale,
} from "../src/components/locale-provider/index.ts";
import {
	TimeZoneProvider,
	useTimeZone,
} from "../src/components/time-zone-provider/index.ts";

const ShowLocale = () => {
	const locale = useLocale();
	const aria = useAriaLocale();
	return (
		<p>
			{locale} {aria.locale}
		</p>
	);
};

const ShowTimeZone = () => <p>{useTimeZone()}</p>;

const ErrorText = ({ error }: FallbackProps) => (
	<p>{error instanceof Error ? error.message : "?"}</p>
);

const Caught = ({
	children,
}: Readonly<{ children: ReactNode }>) => (
	<ErrorBoundary FallbackComponent={ErrorText}>
		{children}
	</ErrorBoundary>
);

const quietly = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("LocaleProvider", () => {
	test("hands its locale to useLocale and to react-aria", async () => {
		const screen = await render(
			<LocaleProvider locale="nl-NL">
				<ShowLocale />
			</LocaleProvider>,
		);

		expect(screen.container.textContent).toBe(
			"nl-NL nl-NL",
		);
	});

	test("useLocale throws outside a LocaleProvider", async () => {
		quietly();
		const screen = await render(
			<Caught>
				<ShowLocale />
			</Caught>,
		);

		expect(screen.container.textContent).toBe(
			"useLocale must be used inside a LocaleProvider",
		);
	});
});

describe("TimeZoneProvider", () => {
	test("hands its zone to useTimeZone", async () => {
		const screen = await render(
			<TimeZoneProvider timeZone="Europe/Amsterdam">
				<ShowTimeZone />
			</TimeZoneProvider>,
		);

		expect(screen.container.textContent).toBe(
			"Europe/Amsterdam",
		);
	});

	test("useTimeZone throws outside a TimeZoneProvider", async () => {
		quietly();
		const screen = await render(
			<Caught>
				<ShowTimeZone />
			</Caught>,
		);

		expect(screen.container.textContent).toBe(
			"useTimeZone must be used inside a TimeZoneProvider",
		);
	});
});

import { useRef } from "react";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { render } from "vitest-browser-react";
import { usePresence } from "../src/lib/hooks/use-presence.ts";

const EXIT_MS = 300;

const stylesheet = document.createElement("style");
stylesheet.textContent = `
	.fading { transition: opacity ${EXIT_MS}ms linear; }
	.fading[data-starting-style],
	.fading[data-ending-style] { opacity: 0; }
`;

const Panel = ({
	open,
	fading = true,
}: Readonly<{ open: boolean; fading?: boolean }>) => {
	const ref = useRef<HTMLDivElement>(null);
	const presence = usePresence(open, ref);
	return presence.mounted ? (
		<div
			ref={ref}
			data-testid="panel"
			className={fading ? "fading" : undefined}
			{...presence.props}>
			Panel
		</div>
	) : null;
};

const panel = () =>
	document.querySelector<HTMLElement>(
		"[data-testid=panel]",
	);

const visible = () => panel()?.checkVisibility() ?? false;

const wait = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms));

const reduceMotion = () => {
	const matchMedia = window.matchMedia.bind(window);
	vi.spyOn(window, "matchMedia").mockImplementation(query =>
		matchMedia(
			query === "(prefers-reduced-motion: reduce)"
				? "all"
				: query,
		),
	);
};

beforeAll(() => {
	document.head.append(stylesheet);
});

afterAll(() => {
	stylesheet.remove();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("usePresence", () => {
	test("renders nothing while closed", async () => {
		await render(<Panel open={false} />);

		expect(panel()).toBeNull();
	});

	test("shows an element that starts open without a starting style", async () => {
		await render(<Panel open />);

		expect(panel()).toHaveAttribute("data-open", "");
		expect(panel()).not.toHaveAttribute(
			"data-starting-style",
		);
	});

	test("mounts with its starting style, then drops it so the entry transitions", async () => {
		const screen = await render(<Panel open={false} />);
		await screen.rerender(<Panel open />);

		expect(panel()).toHaveAttribute(
			"data-starting-style",
			"",
		);
		expect(panel()).toHaveAttribute("data-open", "");
		expect(visible()).toBe(true);

		await expect
			.poll(() =>
				panel()?.hasAttribute("data-starting-style"),
			)
			.toBe(false);
		expect(panel()?.getAnimations()).toHaveLength(1);
	});

	test("stays mounted with its ending style until the exit transition finishes", async () => {
		const screen = await render(<Panel open />);
		expect(visible()).toBe(true);
		const closedAt = performance.now();
		await screen.rerender(<Panel open={false} />);

		expect(panel()).toHaveAttribute(
			"data-ending-style",
			"",
		);
		expect(panel()).not.toHaveAttribute("data-open");

		await expect.poll(panel).toBeNull();
		expect(
			performance.now() - closedAt,
		).toBeGreaterThanOrEqual(EXIT_MS);
	});

	test("unmounts on the next frame when nothing animates", async () => {
		const screen = await render(
			<Panel open fading={false} />,
		);
		await screen.rerender(
			<Panel open={false} fading={false} />,
		);

		await expect.poll(panel).toBeNull();
	});

	test("reopening during the exit keeps it mounted and drops the ending style", async () => {
		const screen = await render(<Panel open />);
		expect(visible()).toBe(true);
		await screen.rerender(<Panel open={false} />);
		await wait(EXIT_MS / 3);
		expect(panel()).toHaveAttribute(
			"data-ending-style",
			"",
		);
		await screen.rerender(<Panel open />);

		expect(panel()).not.toHaveAttribute(
			"data-ending-style",
		);
		await wait(EXIT_MS * 2);
		expect(panel()).toHaveAttribute("data-open", "");
	});

	test("under reduced motion, opens without a starting style", async () => {
		reduceMotion();
		const screen = await render(<Panel open={false} />);
		await screen.rerender(<Panel open />);

		expect(panel()).toHaveAttribute("data-open", "");
		expect(panel()).not.toHaveAttribute(
			"data-starting-style",
		);
	});

	test("under reduced motion, unmounts as soon as it closes", async () => {
		reduceMotion();
		const screen = await render(<Panel open />);
		await screen.rerender(<Panel open={false} />);

		expect(panel()).toBeNull();
	});
});

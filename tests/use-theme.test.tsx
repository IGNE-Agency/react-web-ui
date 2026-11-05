import {
	afterEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { render } from "vitest-browser-react";
import { useTheme } from "../src/lib/hooks/use-theme.ts";
import type { StorageAdapter } from "../src/lib/storage.ts";

const KEY = "theme";

const memoryStorage = (
	initial: Readonly<Record<string, unknown>> = {},
): StorageAdapter => {
	const entries = new Map(Object.entries(initial));
	const listeners = new Set<() => void>();
	const notify = () => {
		for (const listener of listeners) {
			listener();
		}
	};
	return {
		read: key => entries.get(key),
		write: (key, value) => {
			entries.set(key, value);
			notify();
		},
		remove: key => {
			entries.delete(key);
			notify();
		},
		subscribe: (_key, listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
};

const Probe = ({
	storage,
}: Readonly<{ storage: StorageAdapter }>) => {
	const { theme, preference, setPreference, toggle } =
		useTheme({ storage, key: KEY });
	return (
		<>
			<output>
				{preference} {theme}
			</output>
			<button
				type="button"
				onClick={() => setPreference("auto")}>
				Auto
			</button>
			<button
				type="button"
				onClick={() => setPreference("dark")}>
				Dark
			</button>
			<button type="button" onClick={toggle}>
				Toggle
			</button>
		</>
	);
};

const prefersDark = () => {
	const matchMedia = window.matchMedia.bind(window);
	vi.spyOn(window, "matchMedia").mockImplementation(query =>
		matchMedia(
			query === "(prefers-color-scheme: dark)"
				? "all"
				: query,
		),
	);
};

const prefersLight = () => {
	const matchMedia = window.matchMedia.bind(window);
	vi.spyOn(window, "matchMedia").mockImplementation(query =>
		matchMedia(
			query === "(prefers-color-scheme: dark)"
				? "not all"
				: query,
		),
	);
};

const dataTheme = () =>
	document.documentElement.getAttribute("data-theme");

afterEach(() => {
	vi.restoreAllMocks();
	document.documentElement.removeAttribute("data-theme");
});

describe("useTheme", () => {
	test("follows the operating system until a preference is stored", async () => {
		prefersDark();
		const screen = await render(
			<Probe storage={memoryStorage()} />,
		);

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("auto dark");
		expect(dataTheme()).toBeNull();
	});

	test("stores a chosen theme and pins it on the document", async () => {
		const storage = memoryStorage();
		const screen = await render(
			<Probe storage={storage} />,
		);
		await screen
			.getByRole("button", { name: "Dark" })
			.click();

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("dark dark");
		expect(storage.read(KEY)).toBe("dark");
		expect(dataTheme()).toBe("dark");
	});

	test("drops the pin when the preference returns to auto", async () => {
		prefersLight();
		const storage = memoryStorage({ [KEY]: "dark" });
		const screen = await render(
			<Probe storage={storage} />,
		);
		expect(dataTheme()).toBe("dark");

		await screen
			.getByRole("button", { name: "Auto" })
			.click();

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("auto light");
		expect(dataTheme()).toBeNull();
	});

	test("toggles to the theme it does not show", async () => {
		prefersDark();
		const storage = memoryStorage();
		const screen = await render(
			<Probe storage={storage} />,
		);
		await screen
			.getByRole("button", { name: "Toggle" })
			.click();

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("light light");
		expect(storage.read(KEY)).toBe("light");
	});

	test("reads a stored value that is no preference as auto", async () => {
		prefersLight();
		const screen = await render(
			<Probe storage={memoryStorage({ [KEY]: "sepia" })} />,
		);

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("auto light");
	});

	test("follows a change written elsewhere", async () => {
		prefersLight();
		const storage = memoryStorage();
		const screen = await render(
			<Probe storage={storage} />,
		);
		storage.write(KEY, "dark");

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("dark dark");
	});
});

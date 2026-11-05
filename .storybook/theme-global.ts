import { z } from "zod";

const themeGlobals = z.object({
	globals: z.object({ theme: z.enum(["light", "dark"]) }),
});

/**
 * The theme a Storybook globals event carries, or `undefined` when it carries
 * none.
 *
 * @example
 * channel.on(GLOBALS_UPDATED, payload => apply(themeOf(payload)));
 */
export const themeOf = (payload: unknown) => {
	const parsed = themeGlobals.safeParse(payload);
	return parsed.success
		? parsed.data.globals.theme
		: undefined;
};

/**
 * The theme a Storybook URL's `globals` query parameter pins, light unless it
 * says dark.
 *
 * @example
 * themeFromQuery("?path=/docs/intro&globals=theme:dark"); // "dark"
 */
export const themeFromQuery = (search: string) =>
	(new URLSearchParams(search).get("globals") ?? "")
		.split(";")
		.includes("theme:dark")
		? "dark"
		: "light";

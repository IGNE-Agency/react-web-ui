import {
	GLOBALS_UPDATED,
	SET_GLOBALS,
} from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";
import { brandThemes } from "./brand-theme.ts";
import { labelOf } from "./label.ts";
import { themeFromQuery, themeOf } from "./theme-global.ts";

addons.setConfig({
	theme: brandThemes[themeFromQuery(location.search)],
	sidebar: {
		renderLabel: item =>
			item.type === "story"
				? item.name
				: labelOf(item.name),
	},
});

addons.register("kit/theme", api => {
	const apply = (payload: unknown) => {
		const theme = themeOf(payload);
		if (theme !== undefined) {
			api.setOptions({ theme: brandThemes[theme] });
		}
	};

	api.on(SET_GLOBALS, apply);
	api.on(GLOBALS_UPDATED, apply);
});

import type { Plugin } from "vite";
import svgr from "vite-plugin-svgr";

/**
 * SVGR as the kit renders `?react` SVG imports, shared by the library build and
 * Storybook.
 *
 * @example
 * plugins: [kitSvgr()]
 */
export const kitSvgr = (): Plugin =>
	svgr({
		svgrOptions: {
			plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
			svgoConfig: {
				multipass: true,
				floatPrecision: 1,
				plugins: [
					{
						name: "preset-default",
						params: {
							overrides: {
								removeViewBox: false,
							},
						},
					},
				],
			},
		},
	});

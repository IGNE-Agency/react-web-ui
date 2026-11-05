import type { Plugin } from "vite";
import svgr from "vite-plugin-svgr";

/**
 * SVGR for the `?react` SVG imports of stories and docs pages, such as the
 * Material icons that fill the kit's icon slots.
 *
 * @example
 * plugins: [storySvgr()]
 */
export const storySvgr = (): Plugin =>
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

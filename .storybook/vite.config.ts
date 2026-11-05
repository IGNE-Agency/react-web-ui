import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { storySvgr } from "./svgr.ts";

/**
 * The Vite configuration Storybook and the browser tests render the kit with,
 * apart from the library build's own.
 */
const config: UserConfig = defineConfig({
	plugins: [react({ compiler: true }), storySvgr()],
});

export default config;

import kitTokens from "@igne-agency/react-web-ui/terrazzo";
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
	tokens: [
		"./node_modules/@igne-agency/react-web-ui/tokens/kit.resolver.json",
	],
	outDir: "./dist/tokens/",
	plugins: [kitTokens({ filename: "tokens.gen.css" })],
});

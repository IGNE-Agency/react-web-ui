# @igne-agency/react-web-ui

IGNE's React component kit for the web: base-ui and react-aria primitives wrapped as compound parts, presets over them, every form control as a primitive, a prefab and a TanStack Form connector, and DTCG design tokens that each app themes. It is the web counterpart of `@igne-agency/react-native-ui`, with the same names and semantics where both have the concept.

The package ships built ESM, one module per source file, each importing only its own CSS. An app needs no Vite, Sass or React Compiler configuration for it.

## Install

```sh
bun add @igne-agency/react-web-ui
bun add react react-dom @base-ui/react react-aria-components @internationalized/date @tanstack/react-form temporal-polyfill
```

Some entry points need an optional peer as well:

| Import | Needs |
| --- | --- |
| `@igne-agency/react-web-ui/combobox-field/react-query` | `@tanstack/react-query` |
| `@igne-agency/react-web-ui/composer` | `lexical`, `@lexical/react`, `@lexical/history`, `@lexical/plain-text` |
| `@igne-agency/react-web-ui/data-table` | `@tanstack/react-table` |
| `@igne-agency/react-web-ui/data-view` | `@tanstack/react-query`, `@tanstack/react-table` |
| `@igne-agency/react-web-ui/unsaved-changes/tanstack-router` | `@tanstack/react-router` |
| `@igne-agency/react-web-ui/terrazzo` | `@terrazzo/cli`, `@terrazzo/parser`, `@terrazzo/plugin-css` |
| `@igne-agency/react-web-ui/terrazzo/vite` | `@terrazzo/cli`, `@terrazzo/parser`, `@terrazzo/plugin-css`, `vite` |

Lexical is a peer because it must be a single copy per app: an app that uses Lexical itself shares the kit's.

## Imports

Import each component from its own subpath, such as `@igne-agency/react-web-ui/button`. Everything else has one too: `./forms`, `./hooks`, `./storage`, `./table-storage`, `./tone` and `./unsaved-changes`. The app then loads the CSS of what it imports and of the components those render, and no other.

The root, `@igne-agency/react-web-ui`, re-exports all of it but the entries that need an optional peer. A production build tree-shakes it, but Vite's dev server pre-bundles a package import with every export it has, so a single import from the root loads every component's stylesheet in development.

## Styles

Import the reset and a theme once, at the app's entry:

```ts
import "@igne-agency/react-web-ui/base.css";
import "@igne-agency/react-web-ui/tokens.css";
```

`base.css` is the reset, and sets `isolation: isolate` on `#root`, which base-ui's popups need. `tokens.css` is the kit's default theme, light and dark. All kit CSS sits in cascade layers, so the app's unlayered CSS always wins; how a component is restyled through its `--kit-*` knobs is in [`docs/design-system/token-architecture.mdx`](docs/design-system/token-architecture.mdx#every-custom-property-names-who-owns-it).

## Theming

An app with its own brand builds its own `tokens.css` instead of importing the kit's. Its resolver layers the kit's token files and the app's own overrides:

```json
{
	"$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
	"name": "App",
	"version": "2025.10",
	"sets": {
		"base": {
			"sources": [
				{
					"$ref": "../../node_modules/@igne-agency/react-web-ui/tokens/ref.tokens.json"
				},
				{
					"$ref": "../../node_modules/@igne-agency/react-web-ui/tokens/sys.tokens.json"
				},
				{ "$ref": "brand.tokens.json" }
			]
		}
	},
	"modifiers": {
		"theme": {
			"contexts": {
				"light": [],
				"dark": [
					{
						"$ref": "../../node_modules/@igne-agency/react-web-ui/tokens/dark.tokens.json"
					}
				]
			},
			"default": "light"
		}
	},
	"resolutionOrder": [
		{ "$ref": "#/sets/base" },
		{ "$ref": "#/modifiers/theme" }
	]
}
```

The `./terrazzo` preset builds it into the custom properties the components read:

```ts
// terrazzo.config.ts
import { defineConfig } from "@terrazzo/cli";
import kitTokens from "@igne-agency/react-web-ui/terrazzo";

export default defineConfig({
	tokens: ["./src/style/tokens/app.resolver.json"],
	outDir: "./src/style/",
	plugins: [kitTokens({ filename: "tokens.gen.css" })],
});
```

Add the kit's Vite plugin to the app's Vite config:

```ts
// vite.config.ts
import { tokens } from "@igne-agency/react-web-ui/terrazzo/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tokens()],
});
```

It reads `terrazzo.config.*` from the working directory, which Terrazzo resolves the config's paths from, and builds the tokens before `vite build` and when the dev server starts, then again whenever the config, the resolver or a token file it references changes. The app needs no `tokens` script and no `tz build`. Gitignore the file it writes. Under Node, a `terrazzo.config.ts` needs Node 22.18 or later.

The resolver needs a `theme` modifier with `light` and `dark` contexts. What the layers and roles are, and why breakpoints and gutters stay the app's own, is in [`docs/design-system/token-architecture.mdx`](docs/design-system/token-architecture.mdx).

### Typeface

The kit loads no font. Load the app's own and name it in `--sys-font-family-body` and `--sys-font-family-heading` on `:root`: see [`docs/design-system/type.mdx`](docs/design-system/type.mdx#an-app-sets-its-typeface-through-the-family-properties-on-the-root-and-loads-the-font-itself).

## Icons

The kit ships no icons: the app hands them over through `IconProvider`, below. Which ones it needs, and where any other icon goes, is in [`docs/design-system/iconography.mdx`](docs/design-system/iconography.mdx#the-kit-renders-no-icons-and-the-app-hands-it-every-one).

## Providers

The kit has no catch-all provider. Wrap the app in the ones it uses:

```tsx
import { CopyProvider } from "@igne-agency/react-web-ui/copy-provider";
import { IconProvider } from "@igne-agency/react-web-ui/icon-provider";
import { LocaleProvider } from "@igne-agency/react-web-ui/locale-provider";
import { TimeZoneProvider } from "@igne-agency/react-web-ui/time-zone-provider";
import { ToastProvider } from "@igne-agency/react-web-ui/toast";
import { Tooltip } from "@igne-agency/react-web-ui/tooltip";
import { copy } from "./copy.ts";
import { icons } from "./icons.tsx";

export const Providers = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => (
	<LocaleProvider locale="nl-NL">
		<TimeZoneProvider timeZone="Europe/Amsterdam">
			<CopyProvider copy={copy}>
				<IconProvider icons={icons}>
					<Tooltip.Provider>
						<ToastProvider>{children}</ToastProvider>
					</Tooltip.Provider>
				</IconProvider>
			</CopyProvider>
		</TimeZoneProvider>
	</LocaleProvider>
);
```

- `LocaleProvider` takes a BCP 47 locale, and `TimeZoneProvider` an IANA time zone.
- `CopyProvider` takes a `KitCopy`: every string the kit's components say on their own, in the app's language. The kit ships no copy.
- `IconProvider` takes a `KitIcons`: every icon the kit's components show on their own.

All four are required: their hooks throw outside them, and nothing falls back to the device or to English. `ToastProvider` sits inside the copy and icon providers.

## Forms

Build the app's form hook once, in a module of its own, registering only the connectors the app uses, so it loads only their code and CSS:

```ts
// src/form.ts
import { TSFEmailField } from "@igne-agency/react-web-ui/email-field";
import { createAppForm } from "@igne-agency/react-web-ui/forms";

export const { useAppForm, withForm, withFieldGroup } =
	createAppForm({ EmailField: TSFEmailField });
```

The rest, from validators to `Form.Root` and field groups, is in [`docs/design-system/setting-up-forms.mdx`](docs/design-system/setting-up-forms.mdx).

## Docs

The docs are this repository's Storybook (`bun run storybook`), written as `.mdx` files: start at [`docs/design-system/getting-started.mdx`](docs/design-system/getting-started.mdx). A component's own rules sit beside its stories, such as [`src/components/field/field.mdx`](src/components/field/field.mdx).

## License

MIT

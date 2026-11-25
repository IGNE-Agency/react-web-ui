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
| `@igne-agency/react-web-ui/composer` | `lexical`, `@lexical/react`, `@lexical/history`, `@lexical/plain-text` |
| `@igne-agency/react-web-ui/data-table` | `@tanstack/react-table` |
| `@igne-agency/react-web-ui/data-view` | `@tanstack/react-query` |
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

`base.css` resets the user agent's styles and sets the body's font and colour, `::selection`, links and their focus ring. It also sets `isolation: isolate` on `#root` and `position: relative` on `body`, which base-ui's popups need. It loads no fonts; the app loads its own.

`tokens.css` is the kit's default theme: the `--ref-*` ramps and the `--sys-*` roles, light on `:root` and on any element with `data-theme="light"`, dark on any element with `data-theme="dark"`, and dark on `<html>` under `prefers-color-scheme: dark` unless it has `data-theme="light"`.

All kit CSS sits in the cascade layers `kit.reset`, `kit.base` and `kit.components`, so any unlayered CSS in the app wins without a specificity fight. Each component reads its own custom properties, its knobs, named `--kit-<component>-*` and defaulting to a `--sys-*` role, so a stylesheet can retheme one component by setting them. See [Every custom property names who owns it](docs/design-system/token-architecture.mdx) for the namespaces.

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

The resolver needs a `theme` modifier with `light` and `dark` contexts. Like the kit's own `tokens.css`, the file the preset writes opens with the kit's layer order and keeps every rule in `kit.base`, so an unlayered override in the app still wins. The preset names every token by its path with dots as hyphens (`sys.color.primary` becomes `--sys-color-primary`), and writes a shadow tagged `$extensions["nl.igne.css"].property: "filter"` as `drop-shadow()` filters. Typography tokens name no family, so the preset narrows Terrazzo's `core/valid-typography` rule to `fontSize`, `fontWeight` and `lineHeight`.

### Typeface

The kit names no typeface and loads no font. Every type role reads its family from one of two custom properties: `--sys-font-family-heading` for headings and `--sys-font-family-body` for everything else. The body family defaults to `system-ui, sans-serif`, and the heading family follows the body family. To use a typeface, load it the way the app loads any font, then name it on `:root` in unlayered CSS:

```css
:root {
	--sys-font-family-body: "Inter", system-ui, sans-serif;
	--sys-font-family-heading:
		"Satoshi", system-ui, sans-serif;
}
```

This works the same over the kit's `tokens.css` and over a theme the preset builds.

The kit owns no breakpoints and no gutters; those are the app's layout.

## Icons

The kit renders no icons and depends on no icon set. The icons its components show on their own, such as a checkbox's tick or a clear button's cross, the app hands it once through `IconProvider` (below). Any other icon goes in a part's children or a ready-made component's `icon` prop. A glyph drawn at `1em` in `currentColor` fits as is.

`Icon`, from `./icon`, sizes and labels any SVG component: `label=""` hides a glyph that stands beside its word, and a label names one that stands alone.

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

All four are required. Their hooks throw outside them, and nothing falls back to the device or to English. `ToastProvider` sits inside the copy and icon providers. The providers are the only source of that vocabulary: no component takes a prop that overrides it for one instance. Copy that differs per instance, such as a field's label or a confirm dialog's buttons, is a required prop of its own.

## Forms

Every control comes in three tiers:

- the primitive, such as `TextInput` or `Select`
- the prefab with label, description and errors, such as `TextField` or `SelectField`
- the TanStack Form connector, such as `TSFTextField`, which the app registers on its form hook

`createAppForm` builds the app's form hook from the connectors it registers, once, in a module of the app's own. A form reaches each connector through `form.AppField` under its key, and loads the code and CSS of those connectors only:

```ts
// src/form.ts
import { TSFEmailField } from "@igne-agency/react-web-ui/email-field";
import { createAppForm } from "@igne-agency/react-web-ui/forms";

export const { useAppForm, withForm, withFieldGroup } =
	createAppForm({ EmailField: TSFEmailField });
```

```tsx
import { Form } from "@igne-agency/react-web-ui/form";
import { useAppForm } from "./form.ts";

const SignUp = () => {
	const form = useAppForm({
		defaultValues: { email: "" },
		validators: { onSubmit: schema },
		onSubmit: ({ value }) => save(value),
	});
	return (
		<Form.Root form={form}>
			<form.AppField name="email">
				{field => (
					<field.EmailField
						label="Email"
						requiredness="required"
					/>
				)}
			</form.AppField>
			<Form.Errors />
			<Form.Submit busyLabel="Signing up">
				Sign up
			</Form.Submit>
		</Form.Root>
	);
};
```

Related fields, such as the parts of an address, share one legend and one error in a field group, which lines them up side by side. Register `TSFFieldGroup` as a form component and name the fields whose errors it shows:

```ts
import { TSFFieldGroup } from "@igne-agency/react-web-ui/fieldset";
import { TSFTextField } from "@igne-agency/react-web-ui/text-field";

export const { useAppForm, withForm, withFieldGroup } =
	createAppForm(
		{ TextField: TSFTextField },
		{ FieldGroup: TSFFieldGroup },
	);
```

```tsx
<form.FieldGroup
	legend="Address"
	names={["postalCode", "houseNumber"]}>
	<form.AppField name="postalCode">
		{field => (
			<field.TextField
				label="Postal code"
				requiredness="required"
			/>
		)}
	</form.AppField>
	<form.AppField name="houseNumber">
		{field => (
			<field.TextField
				label="House number"
				requiredness="required"
			/>
		)}
	</form.AppField>
</form.FieldGroup>
```

Every field takes `requiredness` (`"required"`, `"optional"`, or left out to show neither mark). A prefab or a primitive's root also takes `errors`, which accepts strings and anything with a string `message`, such as Standard Schema issues; a connector reads them, with `dirty`, `touched` and `pending`, from its form field. Validation is the app's own, through Standard Schema; the kit ships no validators.

`Form.Root` reports unsaved changes to the page's leave guards (`useLeaveGuard`, or `useRouterLeaveGuard` from `./unsaved-changes/tanstack-router`) while its `leaveGuard` policy returns true for the form's live state. The default, `whenDirty`, guards while the values differ from their defaults and no submit is in flight. Pass `never` for a form whose edits need not survive leaving, or any `(state) => boolean`:

```tsx
import { never } from "@igne-agency/react-web-ui/unsaved-changes";

<Form.Root form={filters} leaveGuard={never}>
	…
</Form.Root>;
```

## License

MIT

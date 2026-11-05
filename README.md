# @maanlamp/react-web-ui

IGNE's React component kit for the web: base-ui and react-aria primitives wrapped as compound parts, presets over them, every form control in three tiers with a TanStack Form bridge, and DTCG design tokens that each app themes. It is the web counterpart of `@maanlamp/react-native-ui`, with the same names and semantics where both have the concept.

The package ships built ESM, one module per source file, each importing only its own CSS. An app needs no Vite, Sass or React Compiler configuration for it.

## Install

```sh
bun add @maanlamp/react-web-ui
bun add react react-dom @base-ui/react react-aria-components @internationalized/date @tanstack/react-form temporal-polyfill
```

Some entry points need an optional peer as well:

| Import | Needs |
| --- | --- |
| `@maanlamp/react-web-ui/composer` | `lexical`, `@lexical/react`, `@lexical/history`, `@lexical/plain-text` |
| `@maanlamp/react-web-ui/data-table` | `@tanstack/react-table` |
| `@maanlamp/react-web-ui/data-view` | `@tanstack/react-query` |
| `@maanlamp/react-web-ui/unsaved-changes/tanstack-router` | `@tanstack/react-router` |
| `@maanlamp/react-web-ui/terrazzo` | `@terrazzo/cli`, `@terrazzo/plugin-css` |

Lexical is a peer because it must be a single copy per app: an app that uses Lexical itself shares the kit's.

## Imports

Import each component from its own subpath, such as `@maanlamp/react-web-ui/button`. Everything else has one too: `./forms`, `./hooks`, `./storage`, `./table-storage`, `./tone` and `./unsaved-changes`. The app then loads the CSS of what it imports and of the components those render, and no other.

The root, `@maanlamp/react-web-ui`, re-exports all of it but the entries that need an optional peer. A production build tree-shakes it, but Vite's dev server pre-bundles a package import with every export it has, so a single import from the root loads every component's stylesheet in development.

## Styles

Import the reset and a theme once, at the app's entry:

```ts
import "@maanlamp/react-web-ui/base.css";
import "@maanlamp/react-web-ui/tokens.css";
```

`base.css` resets the user agent's styles and sets the body's font and colour, `::selection`, links and their focus ring. It also sets `isolation: isolate` on `#root` and `position: relative` on `body`, which base-ui's popups need. It loads no fonts; the app loads its own.

`tokens.css` is the kit's default theme: the `--ref-*` ramps and the `--sys-*` roles, light on `:root` and dark on `html[data-theme="dark"]`, and under `prefers-color-scheme: dark` unless `data-theme="light"`.

All kit CSS sits in the cascade layers `kit.reset`, `kit.base` and `kit.components`, so any unlayered CSS in the app wins without a specificity fight. Each component reads its own custom properties ("knobs"), defaulting to a `--sys-*` role, so a stylesheet can retheme one component by setting its knobs.

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
					"$ref": "../../node_modules/@maanlamp/react-web-ui/tokens/ref.tokens.json"
				},
				{
					"$ref": "../../node_modules/@maanlamp/react-web-ui/tokens/sys.tokens.json"
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
						"$ref": "../../node_modules/@maanlamp/react-web-ui/tokens/dark.tokens.json"
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
import kitTokens from "@maanlamp/react-web-ui/terrazzo";

export default defineConfig({
	tokens: ["./src/style/tokens/app.resolver.json"],
	outDir: "./src/style/",
	plugins: [kitTokens({ filename: "tokens.gen.css" })],
});
```

The resolver needs a `theme` modifier with `light` and `dark` contexts. Like the kit's own `tokens.css`, the file the preset writes opens with the kit's layer order and keeps every rule in `kit.base`, so an unlayered override in the app still wins. The preset names every token by its path with dots as hyphens (`sys.color.primary` becomes `--sys-color-primary`), and writes a shadow tagged `$extensions["nl.igne.css"].property: "filter"` as `drop-shadow()` filters.

The kit owns no breakpoints and no gutters; those are the app's layout.

## Providers

The kit has no catch-all provider. Wrap the app in the ones it uses:

```tsx
import { LocaleProvider } from "@maanlamp/react-web-ui/locale-provider";
import { TimeZoneProvider } from "@maanlamp/react-web-ui/time-zone-provider";
import { ToastProvider } from "@maanlamp/react-web-ui/toast";
import { Tooltip } from "@maanlamp/react-web-ui/tooltip";

export const Providers = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => (
	<LocaleProvider locale="nl-NL">
		<TimeZoneProvider timeZone="Europe/Amsterdam">
			<Tooltip.Provider>
				<ToastProvider
					closeLabel="Close"
					viewportLabel="Notifications">
					{children}
				</ToastProvider>
			</Tooltip.Provider>
		</TimeZoneProvider>
	</LocaleProvider>
);
```

`LocaleProvider` takes a BCP 47 locale and `TimeZoneProvider` an IANA time zone. Both are required: `useLocale()` and `useTimeZone()` throw outside them, and nothing falls back to the device.

The kit has no copy of its own. Every string a component shows or announces is a prop named for what it says, such as `clearLabel` or `retryLabel`, so the app passes its own translations.

## Forms

Every control comes in three tiers:

- the raw compound, such as `TextInput` or `Select`
- the field shorthand with label, description and errors, such as `TextField` or `SelectField`
- the TanStack Form bridge, such as `TSFTextField`, which the app registers on its form hook

`createAppForm` builds the app's form hook from the bridges it registers, once, in a module of the app's own. A form reaches each bridge through `form.AppField` under its key, and loads the code and CSS of those bridges only:

```ts
// src/form.ts
import { TSFEmailField } from "@maanlamp/react-web-ui/email-field";
import { createAppForm } from "@maanlamp/react-web-ui/forms";

export const { useAppForm, withForm, withFieldGroup } =
	createAppForm({ EmailField: TSFEmailField });
```

```tsx
import { Form } from "@maanlamp/react-web-ui/form";
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
						optionalLabel="optional"
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

Every field takes `requiredness` (`"required"`, `"optional"`, or left out to show neither mark) and `errors`, which accepts strings and anything with a string `message`, such as Standard Schema issues. Validation is the app's own, through Standard Schema; the kit ships no validators.

`Form.Root` reports unsaved changes to the page's leave guards (`useLeaveGuard`, or `useRouterLeaveGuard` from `./unsaved-changes/tanstack-router`) while its `leaveGuard` policy returns true for the form's live state. The default, `whenDirty`, guards while the values differ from their defaults and no submit is in flight. Pass `never` for a form whose edits need not survive leaving, or any `(state) => boolean`:

```tsx
import { never } from "@maanlamp/react-web-ui/unsaved-changes";

<Form.Root form={filters} leaveGuard={never}>
	…
</Form.Root>;
```

## License

MIT

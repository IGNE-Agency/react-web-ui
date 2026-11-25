# CLAUDE.md

You are working in a published TypeScript + React component kit for the web, `@igne-agency/react-web-ui`. Apps install it from npm as built ESM, so every change ships to every app that upgrades. Make safe, minimal, maintainable changes that fit the existing architecture.

**Primary rule**: before changing code, read the surrounding files and follow the patterns already present. Prefer the pattern used closest to the code you are editing.

---

## Stack

| Concern | Tool |
| --- | --- |
| Package manager | `bun` |
| Framework | React 19 + TypeScript, React Compiler at build time |
| Build | Vite library mode, declarations from `tsc` |
| UI primitives | `@base-ui/react`, then `react-aria-components` |
| Styling | CSS Modules + SCSS (`sass-embedded`), in cascade layers |
| Forms | `@tanstack/react-form`; apps register connectors through `createAppForm` from `./forms`, stories through `src/lib/storybook/app-form.tsx` |
| Dates and times | `temporal-polyfill`; `@internationalized/date` inside the react-aria pickers only |
| Icons | None shipped: the app fills every icon slot. Stories and docs use `@material-design-icons/svg` (a dev dependency) through SVGR |
| Tokens | DTCG 2025.10 in `tokens/`, built by Terrazzo 2 |
| Docs and tests | Storybook 10 with Vitest (render, axe and APCA per story, light and dark) |
| Lint and format | `oxlint` (type-aware) and `oxfmt` |

---

## Packaging

The kit ships built JavaScript, one module per source file, and one plain `.css` file beside each module that has styles. An app needs no Vite, Sass or React Compiler configuration of its own.

- Vite library mode with `preserveModules` (`preserveModulesRoot: "src"`), `cssCodeSplit` and `vite-plugin-lib-inject-css`, so a module imports its own CSS and an app that imports one component gets only that component's CSS. `@vitejs/plugin-react` runs with `compiler: true`.
- SCSS modules are emitted as `.css`, never `.module.css`: a consumer's Vite drops `.module.css` imports whose exports go unused.
- No module under `src/` outside stories imports an SVG or an icon set; lint rejects `@material-design-icons/*` and `*.svg?react` everywhere but `*.stories.tsx`, `docs/` and `.storybook/`. SVGR runs only in Storybook (`.storybook/svgr.ts`), never in the library build.
- Every `dependencies` and `peerDependencies` package is external. `sideEffects` is `["**/*.css"]`.
- Declarations come from `tsc -p tsconfig.build.json`. `isolatedDeclarations` is on: every exported value carries a type the declaration emitter can read without inference. Annotate component return types, and type namespace objects explicitly.
- `types` comes first in every `exports` entry. `bun run check:exports` asserts it, that every component folder has an export, that the root barrel imports no optional peer, that nothing under `docs/` or `.storybook/`, no `*.stories.*`, `*.mdx` or `.svg` and no `vendor/` folder is packed, that every packed stylesheet opens with the layer order, and that every custom property in the package is `--kit-*`, `--_kit-*`, `--sys-*`, `--ref-*` or one a headless library publishes. It then packs the kit into the consumer app in `tools/fixtures/consumer/`, typechecks and builds it, and asserts that importing one component brings only its own CSS; extend its entry table to prove a new packaging claim. It also asserts that every subpath brings exactly the stylesheets `tools/fixtures/consumer/stylesheets.json` lists for it, built and in the dev server. Last, it asserts that the packed `./terrazzo/vite` plugin in the fixture's Vite config builds the fixture's tokens, in a build and when a dev server starts.
- The root `.` re-exports every component folder except those that need an optional peer (`@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-router`, `lexical`). Those have their own entry: `./composer`, `./data-table`, `./data-view`, `./unsaved-changes/tanstack-router`.
- The public lib modules have subpaths of their own too: `./forms`, `./hooks`, `./storage`, `./table-storage`, `./tone` and `./unsaved-changes`.
- `./terrazzo` is the token preset and `./terrazzo/vite` the Vite plugin that builds an app's tokens with it, both built for Node with `tsconfig.terrazzo.json`. The plugin reads `terrazzo.config.*` from the working directory, which Terrazzo resolves the config's paths from, and builds the tokens before `vite build` and when the dev server starts, then again on every change to the config or a token file the resolver reads. It never goes through `tz build`, which loads the app's `vite.config.ts` a second time. The kit's own Vite configs, the library's and Storybook's, use it too. `./base.css` and `./tokens.css` are the reset and the default theme. `./tokens/*` are the DTCG files an app's resolver layers.
- Relative imports only, with their `.ts` / `.tsx` extension. There is no `@/` alias.
- A dependency an app also imports is a peer dependency. Only packages no app imports itself are `dependencies`. Stories, MDX, docs and Storybook never ship (`files: ["dist", "tokens"]`).

---

## Verification

Before finishing any task:

```
bun run build            # The tokens, the package, its declarations and the token preset
bun fix                  # Format, and every auto-fixable lint
bun check                # Format check, lint and type-check, all through oxc
bun run check:exports    # The exports map and what the package contains
bun run test             # Unit tests, then every story as a render, a11y and interaction test in light and dark
```

They are not green until they are silent. `bun test` runs bun's own test runner, not Vitest. It is the wrong command here; always use `bun run test`.

`bun check` type-checks through oxlint, which does not report `isolatedDeclarations` errors. `bun run build` does.

Never bypass hooks or suggest `--no-verify`.

How something looks is judged in Storybook by a person. The story tests prove render, accessibility and contrast; they do not prove type, colour, spacing or motion. Say what changed and what to look at, and ask.

---

## UI primitives — prefer prebuilt over hand-rolled

Before implementing any interactive widget (dialog, popover, menu, select, checkbox, slider, tooltip, etc.), fetch `https://base-ui.com/llms.txt` and use the relevant primitive. Do not hand-roll accessible widgets.

**base-ui** and **react-aria-components** are both sanctioned sources of headless UI blocks. Because they overlap, **base-ui is the default**. Reach for react-aria-components only when base-ui doesn't provide the block, such as the date and time pickers or a removable `TagGroup`. Hand-roll only when neither covers it. Small teams without dedicated a11y engineers can't reliably reproduce the interaction and accessibility work these libraries encode.

When a kit component shares its name with the primitive it wraps, import the primitive under an alias: base-ui's as `Base*` (`BaseNumberField`), react-aria's as `Aria*` (`AriaDatePicker`, `AriaDateInput`).

base-ui needs `isolation: isolate` on the app root; `base.css` sets it on `#root`. Its popups announce their transitions through `data-starting-style` and `data-ending-style`.

---

## Styling

**Read the design system in `docs/design-system/` before writing any styling.** Always read `introduction.mdx`, then the pages for what you're touching (`colour.mdx`, `separation.mdx`, `interaction.mdx`, `layout.mdx`, `components.mdx`, …). It is the rulebook for _what_ to reach for and why, with examples and counterexamples. Follow it exactly.

Find a rule without reading whole pages. Every rule a design-system page makes is one `<Details title="…">` block under its `## Technical rules` heading: the title states the rule as a sentence, its slug is the rule's anchor, and the block ends with a link up to the section that explains it. `grep -nE '^## |<Details title=' docs/design-system/*.mdx` lists them with line numbers. A component's own rules are on its docs page, the `.mdx` beside its stories. With Storybook running, `bun run docs:links` reports broken links between docs pages, links that stop at a page instead of a rule, and rules nothing links to.

### Tokens

- Three layers in DTCG JSON: `tokens/ref.tokens.json` for the ramps and the type scale, `tokens/sys.tokens.json` for the roles, `tokens/dark.tokens.json` for the roles' dark values. `tokens/kit.resolver.json` layers them.
- The `./terrazzo/vite` plugin builds them through the kit's own preset (`src/terrazzo/`) into `src/style/tokens.gen.css` whenever Vite runs: the token's path, dots as hyphens, with no prefix (`--ref-*`, `--sys-*`).
- **A component reads only `--sys-*`.** Never `--ref-*`, and never a hard-coded colour, size or duration that a role covers. A token's use is its `$description`.
- The kit owns no breakpoints and no gutters. They are app layout, and a media query cannot read a custom property. Where a component would react to the viewport, it takes the answer from the caller or from a knob.
- The token files hold the same values as the native kit's (`@igne-agency/react-native-ui`). A change to one is made in both.
- The kit loads no font and names no typeface. Typography tokens carry no `fontFamily`; the preset gives a heading role `var(--sys-font-family-heading)` and every other role `var(--sys-font-family-body)`, which defaults to `system-ui, sans-serif` (the heading family follows it). An app sets either on `:root` and loads its own font. Storybook loads none either.

### Cascade layers

- All kit CSS lives in `@layer kit.reset, kit.base, kit.components`, so unlayered app CSS always wins.
- Every stylesheet opens with that order statement: `@use "../../style/layers.scss";` first, then the module's rules inside `@layer kit.components { … }`.
- `src/style/base.scss` (built to `base.css`) holds `kit.reset` and `kit.base`: the reset, `isolation: isolate` on `#root`, `position: relative` on `body`, the body's font and colour, `::selection`, links and their focus ring. It loads no fonts.

### Knobs

- Every component styles itself through its own knobs, custom properties read as `var(--kit-<component>-…, var(--sys-…))`, so any stylesheet can retheme it without a specificity fight. A knob is never declared; its default is the `var()` fallback.
- A component's private tokens are `--_kit-<component>-…`, declared at the top of its root rule and read behind the knob of the same name: `var(--kit-button-bg, var(--_kit-button-bg))`. A mixin's knobs are named for the mixin (`--kit-popup-…`, `--kit-field-…`), and a mixin that takes a prefix is passed one in the namespace (`tone.variants("_kit-badge")`).
- Every custom property the kit writes or reads is `--kit-*`, `--_kit-*`, `--sys-*`, `--ref-*`, or one base-ui or react-aria publishes, read under the library's own name. `check:exports` fails on any other in the package.
- A component that contains another component themes it by setting that child's knobs, never by restyling the child's parts. A toast's tone sets its action buttons' knobs.
- State comes from `data-*` attributes (`[data-disabled]`, `[data-invalid]`, `[data-tone]`), not from one class overriding another.

### SCSS

- Shared styling goes through the mixins in `src/style/` (`focus`, `state-layer`, `popup`, `dialog`, `overlay`, `form`, `checkbox`, `tag`, `tone`, `disclosure`, `tab`, `nav-item`, `error-motion`, `loading-motion`, `visually-hidden`), and `src/lib/sliding-indicator/` for the pill that slides between the items of a tab list, a nav or a segmented control. Use `@include` or `@extend`, never CSS Modules' `composes`.
- `@use` them by relative path: `@use "../../style/focus.scss" as focus;`.
- No component reads the theme. A value that differs per theme is a role in the tokens, such as `scrim`, and the token build writes it for `data-theme` and the OS.
- Motion sits inside `@media not (prefers-reduced-motion)`.

### Docs chrome

- The docs wear IGNE's brand; the kit stays neutral. The brand never enters `src/` or `tokens/`.
- The chrome reads its colour and type from the `--docs-*` palette in `docs/brand/palette.scss`. Spacing, radius and motion stay the kit's `--sys-*`. Specimen samples keep reading the kit tokens they show.
- Every chrome stylesheet under `docs/` and `.storybook/` sits in `@scope (.sbdocs, .docs-preview) to (.kit-preview, .sb-story, .docs-story)`; `.docs-preview` is the portalled link-preview card. In a CSS module the prelude is `@scope (:global(.sbdocs), :global(.docs-preview)) to (:global(.kit-preview), :global(.sb-s\74 ory), :global(.docs-s\74 ory))`: Vite's CSS modules split the prelude on "to". Inside it, start a selector with `:scope` or a plain selector, never `&`. A selector that names an ancestor of the root needs `:scope` after it; under the dark theme use `docs/brand/theme.scss`'s `dark`. A module whose classes render only inside an `Example` visual is kit content and stays unscoped.
- A kit component shown in the chrome sits in a `.kit-preview` (or a story). The boundary rule in `.storybook/docs.scss` gives it the kit's font and colour back.
- Two checks hold it: `Docs/Brand checks` proves a kit component in the chrome computes the kit's font, colour and link colour in both themes, and `tools/check-docs-tokens.ts` (in `bun check`) fails if the docs declare a `--sys-*` or `--ref-*` property.

---

## Generated files

- Generated files are gitignored, listed by **named path** under the "generated files" heading in `.gitignore`. Never use a `*.gen.*` glob.
- `src/style/tokens.gen.css` and `docs/design-system/tokens.gen.*` are generated by the `./terrazzo/vite` plugin whenever Vite runs: `bun run build`, Storybook and the tests. `dist/` is generated by `bun run build`.
- Do not edit generated files.
- Add new generated files or folders to the gitignore, under the right comment heading.
- Gitignored files that aren't under the generated-files heading are not necessarily generated, so this rule doesn't cover them.

---

## TypeScript

- No `any`.
- No casts. Help the compiler infer correctness through runtime logic. If a third-party type makes this impossible, cast behind `// oxlint-disable-next-line typescript/consistent-type-assertions -- <why>`. Last resort only.
- No non-null assertions. Prefer type guards and narrowing.
- Indexed access is `T | undefined` (`noUncheckedIndexedAccess`). Narrow it, or type a list that is never empty as `readonly [T, ...T[]]`.
- `type`, not `interface`. Declared object types are `Readonly<…>`; the `immutable/require-readonly` lint rule enforces it.
- Prefer code that is provably correct by reading: immutable data, no shared mutable state, illegal states unrepresentable. Mutate only where that is obviously simpler.
- These, floating promises, unnecessary conditions and non-exhaustive switches fail `bun check`: the lint is type-aware (`oxlint-tsgolint`).
- No duplicate type definitions. Reuse the exported types from the hooks or shared modules (`Tone` in `src/lib/tone.ts`, `StorageAdapter` in `src/lib/storage.ts`).
- Add JSDoc to util functions you create, with at least one example. Add docs to existing util functions you edit that are missing them. Keep types in TypeScript.

---

## React

- Components are arrow functions.
- Extract into subcomponents or hooks when a component exceeds ~150–200 LOC.
- No global state for local UI concerns.
- No `useEffect` for logic that can run during render, in event handlers, or as derived/memoized values.
- No `useMemo` / `useCallback` unless solving a real referential stability or performance problem.
- The React Compiler memoizes elements on their props. An object that mutates behind a stable reference (a TanStack Table instance, a library store) therefore signals nothing when it changes: pass the state it holds alongside it. Symptom: a control does nothing until an unrelated prop moves.
- A link-like part spreads the props it is given and forwards its ref, so a router's `createLink` can wrap it.

### Icons

- The kit renders no icons and depends on no icon set. An icon a component shows on its own, for a job that is the same in every app (a checkbox's tick, a clear button's cross, pagination arrows), comes from `useIcons()`, under `IconProvider`: a key of `KitIcons` (`src/components/icon-provider/`), named for its job. The provider is the only source: no component takes a prop that overrides it for one instance. Any other icon is a part's children or a prefab's `icon` prop.
- A `KitIcons` key is required only when the icon is the control's only visible content: an icon-only button (close, clear, remove, stepper, copy, send, pagination arrows), a checkbox's mark, a selected-item mark that is the only sign of selection. Every other key is optional, and an icon left out renders nothing, no empty wrapper.
- The kit still sizes and colours the slot: its part sets the size through a knob and `color`, so an SVG drawn at `1em` in `currentColor` fits. Rotation for an open state stays the kit's styling.
- Shapes are not icons: a radio's dot, a switch's thumb, a spinner, a skeleton and a focus ring stay the kit's own.
- `Icon` sizes and labels any SVG component an app passes. Stories and docs get Material icons through `STORY_ICONS` (`.storybook/story-icons.tsx`); a story imports one itself only for a slot that is not a `KitIcons` key.

### Copy, locale and time zone

- The kit has no messages and no hard-coded copy. A string a component says on its own, the same in every call (a clear button's name, the optional word, a calendar's month list), comes from `useCopy()`, under `CopyProvider`: a key of `KitCopy` (`src/components/copy-provider/`), grouped by component family. The provider is the only source: no component takes a per-instance override.
- A string that names this particular instance (`label`, `description`, a dialog's `confirmLabel` and `cancelLabel`, a table's `errorLabel`) is a required prop.
- `KitCopy` and `KitIcons` are complete: a new key is a breaking change for every app, so add one only for vocabulary, never for one component's instance copy.
- The locale comes from `useLocale()`, under `LocaleProvider`. The time zone comes from `useTimeZone()`, under `TimeZoneProvider`. These hooks, `useCopy()` and `useIcons()` throw outside their provider; nothing falls back to the device. A formatter or an "is this today" comparison always passes the zone.
- All time code uses the `temporal-polyfill` ponyfill: `import { Temporal } from "temporal-polyfill"`, never the global `Temporal` or a `/global` or `/shim` entry. Native `Intl.DateTimeFormat` rejects its objects, so formatters use the ponyfill's `Intl` export.
- `@internationalized/date` only inside the react-aria pickers (`date-field`, `date-range-field`, `time-field` and `src/lib/calendar`), which convert to and from Temporal at their boundary. Lint rejects it, and the global `Temporal`, anywhere else.
- `Date` and epoch milliseconds only at the edge of an API that demands them. Convert there.
- Anything that persists takes a `StorageAdapter` from the caller. The kit owns no storage keys and no API client.

---

## Directory layout

```
src/components/   one flat folder per component, each with an index.ts barrel
src/lib/          non-component internals: forms, hooks, calendar, storybook wrappers, tone, storage
src/style/        the SCSS mixins, layers.scss and base.scss
src/terrazzo/     the token preset, built to dist/terrazzo/ for Node
tokens/           DTCG token files and the kit's resolver
docs/             the design system (MDX, drawings, specimens)
.storybook/       Storybook config, the guide and the docs-page components
tools/            build- and lint-time scripts
```

- A component folder is `src/components/<kebab-name>/` and becomes the `./<kebab-name>` export. When you add one, add its line to `src/index.ts` (`export * from "./components/<name>/index.ts"`, unless it needs an optional peer) and its entry to `package.json` `exports`, `types` first. Keep both lists sorted.
- A compound component is one namespace object of parts. Parts are the API: every part takes `className` and spreads its props (`useRender` / `render` where the part is one element), so callers own the markup. Parts that are pure wiring (Portal + Positioner + Popup) may be bundled into one part, with the unbundled parts still exported.
- A compound gets a prefab (the namespace is the prefab function with the parts hanging off it, like `AvatarGroup`) only when it saves real work: logic the parts don't run (overflow math, page ranges, a promise flow), or accessibility wiring a caller would repeat and could get wrong (the `*Field` prefabs, `Tooltip`). A prefab is never the parts re-expressed as props or an `items` array.
- Hooks live in `src/lib/hooks/` and are re-exported from the root barrel and from `./hooks`.

### Form controls: three tiers

A form control family is named after its prefab and lives in `src/components/<control>-field/`:

1. **The primitive**, a compound exported as `<Primitive>` (`TextInput`, `Select`, `Checkbox`). Text-like primitives are named `*Input`; `Textarea` is not one but a control part placed in `TextInput.Group`, so `TextareaField`'s primitive is `TextInput`.
2. **The prefab**, `<Control>Field` (`TextField`, `SelectField`), which composes the primitive's parts with `Field`.
3. **The connector**, `TSF<Control>Field`, which connects the prefab to TanStack Form. An app registers the connectors it uses through `createAppForm(fieldComponents, formComponents?)` from `./forms`: field connectors as field components, and form-level connectors that read several fields, such as `TSFFieldGroup`, as form components. It returns `useAppForm`, `withForm` and `withFieldGroup`; `./forms` also exports `useFieldContext` and `useFormContext`. Stories and tests use the full registry in `src/lib/storybook/app-form.tsx`.

Presets (`EmailField`, `PhoneField`, `SearchField`, `PasswordField`) get a prefab and a connector only, and reuse another control's primitive.

Each tier takes the field's props it does not get from elsewhere:

- The prefab takes them all, at the top level: `label`, `description`, `errors?: unknown`, `requiredness?: "required" | "optional"`, `dirty`, `touched` and `pending`.
- The connector takes `label`, `description` and `requiredness`. The form supplies `errors`, `dirty`, `touched` and `pending`, with the name, the value and the blur, through `useConnectedField` (`src/lib/forms/use-connected-field.ts`), so a connector takes none of them.
- The primitive's `Root` takes the states, `requiredness` included, but not `label` or `description`: those are parts placed inside it, with `Field.Requiredness` in the label.

Every primitive's `Root` keeps one contract, so a hand-composed field is wired like the prefab:

- It takes the field states and draws the field frame (`Field.Root`, or `Fieldset` for a group of controls), projecting the states through `useFieldState` and `fieldStateAttributes`.
- It owns the ids that tie the control to its `Label`, `Description` and `Error`; the requiredness, as the control's `required` or `aria-required`; and, where focus moves among several elements (a popup, segments, slots), the blur, called once focus has left the whole field.
- It shares its state with its parts through context, so no part takes a state the root already has.

- `requiredness` left out shows neither mark. Nothing is inferred from a schema and there is no default.
- `errors` is normalised by `normalizeFieldErrors` (strings, and anything with a string `message`, which covers Standard Schema issues). `Field.Error`, which renders `ErrorText` after the description, is the only live region for the field's validity; a control's other announcements (a copy's outcome, an options list's load state) never repeat an error.
- Validators are the app's own, through Standard Schema. The kit ships none.
- `Form.Root` renders `<form noValidate>` and disables its fields while busy. The form hook `createAppForm` builds focuses the first invalid control after a failed submit, for a form rendered in a `Form.Root` (`src/lib/forms/failed-submit.tsx`). `Form.Errors` shows form-level errors. `Form.Submit` shows its busy state through `useBusyPhase`.

---

## Stories

Every component has a colocated `*.stories.tsx` next to it. Each story is also a render, a11y and interaction test (`bun run test`), so a story that breaks fails CI.

- CSF3, with the meta typed `satisfies Meta<typeof X>`.
- One named story per meaningful state. Combinations come from the controls panel, not from extra stories.
- A controlled component gets its state through `useArgs`, in a module-level arrow component passed as `render`. An inline `render: args => …` trips `rules-of-hooks`, and a component nested inside the story breaks Storybook's preview hooks.
- A play story that asserts a change callback renders the plain component as `render`, uncontrolled (`value: undefined`) where the component supports it, else from a fixed value. `updateArgs` does nothing in the test run, and in the UI its re-render clears the `fn()` calls.
- An options load state is an argTypes `mapping` from a name to the state, with `failed`'s `retry` as a logged action (`fn()`). A story sets the key through `mappedArg(mapping, "failed")` (`src/lib/storybook/mapped-arg`).
- The meta's `component` is the real component, or the part (or prefab) a caller starts from, and its args are that component's real props. Docs are extracted by `.storybook/docgen.ts`, not Storybook's own react-docgen: it documents every component a module under `src/` declares at its top level, exported or not, reads props through `Readonly<{…}>`, intersections, unions, `Omit` and `Pick` with each prop's doc comment, and shows a part's or prefab's namespace doc comment above its own. For that to work the meta's `component` is a kit-defined arrow function (a `const` at the top level of the component's module, not a primitive passed through, such as `BaseDialog.Root`), its props are a type literal or alias the module or a relative import declares, the namespace is an exported `const` whose value is the object of parts or `Object.assign(Prefab, parts)`, and the namespace, prefab, every part and every own prop carry a doc comment. Props a primitive declares (`ComponentProps<typeof Base…>`) are not listed. A docs table never lists a story wrapper's knobs: a demo variant is its own story with its own `render`, and a spy a play function asserts on is a module-level `fn()`, cleared by `parameters: { test: { clearMocks: true } }` on the meta.
- A story that drives input is a test, not a page: it carries `tags: ["!dev", "!autodocs"]`, which keeps it out of the sidebar and the docs page while `bun run test` still runs it. A story that renders a popup already open carries `tags: ["!autodocs"]`: it stays in the sidebar, but on the docs page it would move focus and scroll.
- Storybook is English only. Every story renders inside `StoryProviders` (`src/lib/storybook/`), built from the kit's own providers: locale `en-US`, time zone `Europe/Amsterdam`, the English `STORY_COPY`, `STORY_ICONS`, the toast and tooltip providers, and a fresh `QueryClient` per story for data stories. Docs pages render inside the same providers. Story copy (labels, fixture values, demo content, and every label prop a component requires) is plain English in the story file; a play function asserts on vocabulary through `STORY_COPY`.
- A play function asserts on the copy the story passes in, never on copy the component makes up: the component has none.
- Fixture data comes from a `withQueryClient(() => fixtureClient)` story decorator (`src/lib/storybook/with-query-client`).
- An interactive component has play-function stories proving its keyboard contract, plus mouse and touch input (`userEvent.pointer` with `[TouchA]`). Pen input and screen readers are tested by hand.
- Query portalled content (popups, dialogs, toasts) through `screen`, not the canvas.
- A play function that closes a popup waits for it to unmount before the next step. Await every async assertion.
- A story never shows a design-system "don't". Do, don't and caution examples live only on the design-system pages, as `Example` cards: `DoDont` lays a pair side by side, `Beside` sets a lone card next to its text; a component's API can't express the mistake, by design.
- A component's own design rules live on its docs page: a `.mdx` beside the stories, named after them, that attaches with `<Meta of={XStories} />` and puts the rules inside `<DocsPage>` under `## Rules` (see `src/components/button/button.mdx`). A rule shared by components with no single owner stays on a design-system page.
- The meta names the design-system sections and component pages the component follows: `parameters: { designSystem: [{ page: "Patterns", section: "Where you type" }, { page: "Principles/Interaction", section: "Everything you can reach with the keyboard shows the focus ring" }, { component: "components/button" }] }`, where `page` is the page's title under "Design system", folder included, and `component` is the other component's story title. Its docs page links back to them.
- Colour contrast is judged by APCA (`apca-check`), not WCAG 2: body text at bronze, and muted text (the `text-muted` role) at APCA's minimum for content text that is not body text, Lc 60 (`.storybook/contrast-checks.ts`). Fix a contrast failure by pointing the role at the nearest step of its ramp that passes, in `tokens/sys.tokens.json`, or `tokens/dark.tokens.json` for the dark theme. One shade per role; the ramps themselves never change.
- An a11y waiver is a per-rule `parameters.a11y.config.rules` entry on the one story that needs it, with its reason in `parameters.docs.description.story`. Never turn the a11y test off.

---

## Scope

- Change only what is necessary for the requested outcome.
- Do not refactor files you are not already modifying.
- Do not add dependencies unless clearly necessary. Prefer what is already in `package.json`. A new runtime dependency is one every app inherits.
- No comments. Not for rationale, edge cases, warnings or spec quirks — if it needs explaining, the name is wrong.
- Doc comments on exported symbols only: short, correct, one example. Keep them general and brief; say what the symbol is, not why it was built that way. No prose, no rationale, no design history. One or two sentences.

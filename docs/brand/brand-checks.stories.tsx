import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { Button } from "../../src/components/button/index.ts";
import { Link } from "../../src/components/link/index.ts";
import { TextField } from "../../src/components/text-field/index.ts";

type Pair = Readonly<{
	fg: string;
	bg: string;
	type: string;
}>;

const SURFACES = ["paper", "surface", "sand"] as const;
const TEXTS = ["body", "ink", "muted"] as const;

const PAIRS: readonly Pair[] = [
	...SURFACES.flatMap(bg =>
		TEXTS.map(fg => ({ fg, bg, type: "body-medium" })),
	),
	...SURFACES.map(bg => ({
		fg: "muted",
		bg,
		type: "body-small",
	})),
	{ fg: "ink", bg: "sand-strong", type: "body-medium" },
	{ fg: "on-ink", bg: "ink", type: "body-medium" },
	{ fg: "on-yellow", bg: "yellow", type: "body-medium" },
	{
		fg: "on-yellow",
		bg: "yellow-strong",
		type: "body-medium",
	},
	{ fg: "on-blue", bg: "blue-strong", type: "body-medium" },
	{
		fg: "on-green",
		bg: "green-strong",
		type: "body-medium",
	},
	{ fg: "ink", bg: "yellow-tint", type: "body-medium" },
	{ fg: "ink", bg: "blue-tint", type: "body-medium" },
	{ fg: "ink", bg: "green-tint", type: "body-medium" },
	{ fg: "do-fg", bg: "do-bg", type: "label-medium" },
	{ fg: "dont-fg", bg: "dont-bg", type: "label-medium" },
	{
		fg: "caution-fg",
		bg: "caution-bg",
		type: "label-medium",
	},
];

const BUTTON_LABEL = "Save changes";
const FIELD_LABEL = "Name";
const OPTIONAL_LABEL = "optional";
const LINK_LABEL = "Create an account";
const PARAGRAPH = "A paragraph in the kit's own type.";
const PARAGRAPH_LINK = "Read the guide";
const CHROME_PARAGRAPH = "Chrome text in the brand's type.";
const CHROME_LINK = "brand page";

const KIT_PROPERTIES = [
	"font-family",
	"font-size",
	"font-weight",
	"line-height",
	"color",
] as const;

const KitElements = (): ReactElement => {
	const [name, setName] = useState("");

	return (
		<div
			style={{
				display: "grid",
				gap: "var(--sys-unit-12)",
				justifyItems: "start",
			}}>
			<Button>{BUTTON_LABEL}</Button>
			<TextField
				label={FIELD_LABEL}
				optionalLabel={OPTIONAL_LABEL}
				value={name}
				onValueChange={setName}
			/>
			<Link href="/">{LINK_LABEL}</Link>
			<p>
				{PARAGRAPH} <a href="/">{PARAGRAPH_LINK}</a>
			</p>
		</div>
	);
};

const BrandChecks = (): ReactElement => (
	<div
		style={{
			display: "grid",
			gap: "var(--sys-unit-24)",
		}}>
		<div className="sbdocs sbdocs-wrapper">
			<div
				className="sbdocs sbdocs-content"
				data-testid="chrome"
				style={{
					display: "grid",
					gap: "var(--sys-unit-16)",
					padding: "var(--sys-unit-24)",
				}}>
				<h1>Brand checks</h1>
				<p>
					{CHROME_PARAGRAPH} Read the{" "}
					<a href="/">{CHROME_LINK}</a>.
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fill, minmax(12rem, 1fr))",
						gap: "var(--sys-unit-8)",
					}}>
					{PAIRS.map(({ fg, bg, type }) => (
						<p
							key={`${fg}-${bg}-${type}`}
							style={{
								margin: 0,
								borderRadius: "var(--sys-radius-md)",
								padding: "var(--sys-unit-12)",
								background: `var(--docs-color-${bg})`,
								color: `var(--docs-color-${fg})`,
								font: `var(--docs-type-${type})`,
							}}>
							{`${fg} on ${bg}, ${type}`}
						</p>
					))}
				</div>
				<div
					className="kit-preview"
					data-testid="preview"
					style={{
						borderRadius: "var(--sys-radius-md)",
						padding: "var(--sys-unit-24)",
						background: "var(--sys-color-bg)",
					}}>
					<KitElements />
				</div>
			</div>
		</div>
		<div
			data-testid="reference"
			style={{ padding: "var(--sys-unit-24)" }}>
			<KitElements />
		</div>
	</div>
);

const kitStyleOf = (element: Element) => {
	const style = getComputedStyle(element);
	return Object.fromEntries(
		KIT_PROPERTIES.map(property => [
			property,
			style.getPropertyValue(property),
		]),
	);
};

const kitElementsIn = (container: HTMLElement) => {
	const scope = within(container);
	const textbox = scope.getByRole("textbox", {
		name: FIELD_LABEL,
	});
	return {
		button: scope.getByRole("button", {
			name: BUTTON_LABEL,
		}),
		textbox,
		label: scope.getByText(FIELD_LABEL),
		link: scope.getByRole("link", { name: LINK_LABEL }),
		paragraph: scope.getByText(PARAGRAPH, {
			exact: false,
		}),
		paragraphLink: scope.getByRole("link", {
			name: PARAGRAPH_LINK,
		}),
	};
};

const kitStylesIn = (container: HTMLElement) =>
	Object.fromEntries(
		Object.entries(kitElementsIn(container)).map(
			([name, element]) => [name, kitStyleOf(element)],
		),
	);

const meta = {
	title: "Docs/Brand checks",
	component: BrandChecks,
	tags: ["!dev", "!autodocs"],
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BrandChecks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KitInsideTheChrome: Story = {
	play: async ({ canvas }) => {
		const chrome = canvas.getByTestId("chrome");
		const preview = canvas.getByTestId("preview");
		const reference = canvas.getByTestId("reference");

		await expect(preview.closest(".sbdocs")).toBe(chrome);
		await expect(reference.closest(".sbdocs")).toBeNull();

		await waitFor(() =>
			expect(kitStylesIn(preview)).toEqual(
				kitStylesIn(reference),
			),
		);

		const chromeParagraph = within(chrome).getByText(
			CHROME_PARAGRAPH,
			{ exact: false },
		);
		const chromeLink = within(chrome).getByRole("link", {
			name: CHROME_LINK,
		});
		const kit = kitElementsIn(reference);

		await expect(
			getComputedStyle(chromeParagraph).fontFamily,
		).toContain("Satoshi");
		await expect(
			getComputedStyle(chromeParagraph).color,
		).not.toBe(getComputedStyle(kit.paragraph).color);
		await expect(
			getComputedStyle(chromeLink).color,
		).not.toBe(getComputedStyle(kit.paragraphLink).color);
	},
};

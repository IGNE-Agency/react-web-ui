import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect } from "storybook/test";
import {
	Field,
	type FieldRootProps,
	type RequirednessProps,
} from "./field.tsx";
import { fieldStateAttributes } from "./field-state.ts";
import style from "./field.stories.module.scss";

const LABEL = "Email";
const OPTIONAL_LABEL = "optional";
const DESCRIPTION = "We send the receipt here.";
const ERRORS = [
	"Enter an email address.",
	{ message: "Use your work address." },
];
const CHECKBOX_LABEL = "Email me when it is paid";
const CAPTION = "Theme";
const CAPTION_VALUE = "Follows the system";

type ExampleParts = Partial<RequirednessProps> &
	Readonly<{
		description?: ReactNode;
		errors?: unknown;
	}>;

const textFieldOf =
	({
		requiredness,
		optionalLabel = OPTIONAL_LABEL,
		description,
		errors,
	}: ExampleParts) =>
	(args: FieldRootProps) => (
		<Field.Root
			{...args}
			invalid={errors !== undefined}
			className={style.field}>
			<Field.Label
				requiredness={requiredness}
				optionalLabel={optionalLabel}>
				{LABEL}
			</Field.Label>
			<Field.Control
				className={style.input}
				required={requiredness === "required"}
				{...fieldStateAttributes({
					requiredness,
					validity:
						errors === undefined ? undefined : "invalid",
					disabled: args.disabled,
				})}
			/>
			<Field.Description>{description}</Field.Description>
			<Field.Error>{errors}</Field.Error>
		</Field.Root>
	);

const PendingField = (args: FieldRootProps) => (
	<Field.Root {...args} className={style.field}>
		<Field.Label optionalLabel={OPTIONAL_LABEL}>
			{LABEL}
		</Field.Label>
		<div
			className={style.group}
			{...fieldStateAttributes({ pending: true })}>
			<Field.Control className={style.bare} />
			<Field.Pending />
		</div>
	</Field.Root>
);

const CaptionField = (args: FieldRootProps) => (
	<Field.Root {...args} className={style.field}>
		<Field.Caption
			requiredness="optional"
			optionalLabel={OPTIONAL_LABEL}>
			{CAPTION}
		</Field.Caption>
		<p>{CAPTION_VALUE}</p>
	</Field.Root>
);

const InlineField = (args: FieldRootProps) => (
	<Field.Root {...args} className={style.field}>
		<Field.Label
			optionalLabel={OPTIONAL_LABEL}
			className={style.inline}>
			<Field.Control
				type="checkbox"
				className={style.box}
			/>
			<Field.InlineLabelText
				label={CHECKBOX_LABEL}
				requiredness="optional"
				optionalLabel={OPTIONAL_LABEL}
			/>
		</Field.Label>
	</Field.Root>
);

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Patterns",
				section:
					"Every field says when it is optional, on its own label",
			},
			{
				page: "Principles/Accessibility",
				section:
					"A description and an error chain into `aria-describedby`",
			},
			{
				page: "Principles/Accessibility",
				section: "A field's error is its only live region",
			},
			{ component: "components/error-text" },
		],
	},
	component: Field.Root,
	render: textFieldOf({}),
	args: { disabled: false },
} satisfies Meta<typeof Field.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unstated: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("textbox", { name: LABEL }),
		).not.toBeRequired();
		await expect(
			canvas.queryByText(OPTIONAL_LABEL),
		).not.toBeInTheDocument();
	},
};

export const Required: Story = {
	render: textFieldOf({ requiredness: "required" }),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("textbox", { name: LABEL }),
		).toBeRequired();
	},
};

export const Optional: Story = {
	render: textFieldOf({ requiredness: "optional" }),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("textbox", {
				name: `${LABEL} ${OPTIONAL_LABEL}`,
			}),
		).not.toBeRequired();
	},
};

export const Described: Story = {
	render: textFieldOf({ description: DESCRIPTION }),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("textbox", { name: LABEL }),
		).toHaveAccessibleDescription(DESCRIPTION);
	},
};

export const Invalid: Story = {
	render: textFieldOf({
		description: DESCRIPTION,
		errors: ERRORS,
	}),
	play: async ({ canvas }) => {
		const alert = canvas.getByRole("alert");
		await expect(alert).toHaveTextContent(
			"Enter an email address.",
		);
		await expect(alert).toHaveTextContent(
			"Use your work address.",
		);
		await expect(
			canvas.getByRole("textbox", { name: LABEL }),
		).toHaveAttribute("aria-invalid", "true");
		await expect(
			canvas
				.getByText(DESCRIPTION)
				.compareDocumentPosition(alert),
		).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("textbox", { name: LABEL }),
		).toBeDisabled();
	},
};

export const Pending: Story = {
	render: PendingField,
};

export const Caption: Story = {
	render: CaptionField,
};

export const InlineLabel: Story = {
	render: InlineField,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("checkbox", {
				name: `${CHECKBOX_LABEL} ${OPTIONAL_LABEL}`,
			}),
		).toBeVisible();
	},
};

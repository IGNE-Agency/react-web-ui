import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	revalidateLogic,
	useStore,
} from "@tanstack/react-form";
import type { ReactElement } from "react";
import {
	expect,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { z } from "zod";
import { getFieldErrors } from "../../lib/forms/errors.ts";
import { useConnectedField } from "../../lib/forms/use-connected-field.ts";
import { useAppForm } from "../../lib/storybook/app-form.tsx";
import { Form } from "../form/index.ts";
import { TextInput } from "../text-field/index.ts";
import {
	FieldGroup,
	type FieldGroupProps,
	Fieldset,
} from "./index.ts";
import style from "./fieldset.stories.module.scss";

const LEGEND = "Address";
const DESCRIPTION = "We send the invoice to this address.";
const OPTIONAL_LABEL = "optional";
const POSTAL_CODE_LABEL = "Postal code";
const POSTAL_CODE_DESCRIPTION = "For example 1234 AB.";
const HOUSE_NUMBER_LABEL = "House number";
const LONG_HOUSE_NUMBER_LABEL =
	"House number as it appears on the deed of sale";
const ADDITION_LABEL = "Addition";
const SUBMIT_LABEL = "Save address";
const BUSY_LABEL = "Saving";

const POSTAL_CODE_ERROR =
	"Enter a postal code, such as 1234 AB.";
const HOUSE_NUMBER_ERROR = "Enter a house number.";
const ADDITION_ERROR =
	"Enter an addition of at most 4 characters.";
const LOOKUP_ERROR =
	"We couldn't find this address. Check the postal code and house number.";
const REQUIRED = "Required";

const POSTAL_CODE = /^\d{4} ?[A-Za-z]{2}$/;
const HOUSE_NUMBER = /^\d+$/;

const SCHEMA = z.object({
	postalCode: z
		.string()
		.regex(POSTAL_CODE, POSTAL_CODE_ERROR),
	houseNumber: z
		.string()
		.regex(HOUSE_NUMBER, HOUSE_NUMBER_ERROR),
	addition: z.string().max(4, ADDITION_ERROR),
});

const TERSE_SCHEMA = z.object({
	postalCode: z.string().regex(POSTAL_CODE, REQUIRED),
	houseNumber: z.string().regex(HOUSE_NUMBER, REQUIRED),
	addition: z.string().max(4, REQUIRED),
});

type AddressValues = z.input<typeof SCHEMA>;

type AddressName = keyof AddressValues;

const EMPTY: AddressValues = {
	postalCode: "",
	houseNumber: "",
	addition: "",
};

const VALID: AddressValues = {
	postalCode: "1234 AB",
	houseNumber: "12",
	addition: "",
};

const EVERY_NAME: readonly AddressName[] = [
	"postalCode",
	"houseNumber",
	"addition",
];

type AddressFormProps = Readonly<{
	group: Omit<FieldGroupProps, "members" | "children">;
	start?: AddressValues;
	checkedOnMount?: boolean;
	terse?: boolean;
	names?: readonly AddressName[];
	houseNumberLabel?: string;
	busy?: boolean;
	narrow?: boolean;
	additionLabelHidden?: boolean;
	additionMaxLength?: number;
}>;

const AddressForm = ({
	group,
	start = EMPTY,
	checkedOnMount = false,
	terse = false,
	names = EVERY_NAME,
	houseNumberLabel = HOUSE_NUMBER_LABEL,
	busy = false,
	narrow = false,
	additionLabelHidden = false,
	additionMaxLength,
}: AddressFormProps): ReactElement => {
	const schema = terse ? TERSE_SCHEMA : SCHEMA;
	const form = useAppForm({
		defaultValues: start,
		validationLogic: revalidateLogic(),
		validators: {
			onMount: checkedOnMount ? schema : undefined,
			onDynamic: schema,
		},
	});

	return (
		<Form.Root
			form={form}
			busy={busy}
			className={narrow ? style.narrow : style.form}>
			<form.FieldGroup {...group} names={names}>
				<form.AppField name="postalCode">
					{field => (
						<field.TextField
							label={POSTAL_CODE_LABEL}
							description={POSTAL_CODE_DESCRIPTION}
							requiredness="required"
							optionalLabel={OPTIONAL_LABEL}
							autoComplete="postal-code"
						/>
					)}
				</form.AppField>
				<form.AppField name="houseNumber">
					{field => (
						<field.TextField
							label={houseNumberLabel}
							requiredness="required"
							optionalLabel={OPTIONAL_LABEL}
						/>
					)}
				</form.AppField>
				<form.AppField name="addition">
					{field => (
						<field.TextField
							label={ADDITION_LABEL}
							labelHidden={additionLabelHidden}
							maxLength={additionMaxLength}
							requiredness="optional"
							optionalLabel={OPTIONAL_LABEL}
						/>
					)}
				</form.AppField>
			</form.FieldGroup>
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

const PlainAddressForm = (
	args: FieldGroupProps,
): ReactElement => <AddressForm group={args} />;

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Layout",
				section: "Things that belong together line up",
			},
			{
				page: "Principles/Accessibility",
				section: "A field's error is its only live region",
			},
			{
				page: "Principles/Accessibility",
				section:
					"A description and an error chain into aria-describedby",
			},
			{
				page: "Patterns",
				section:
					"An invalid form says so when it is submitted, then keeps up",
			},
			{ component: "components/field" },
			{ component: "components/form" },
			{ component: "components/text-field" },
		],
	},
	component: FieldGroup,
	render: PlainAddressForm,
	args: {
		legend: LEGEND,
		description: DESCRIPTION,
		optionalLabel: OPTIONAL_LABEL,
		children: null,
	},
} satisfies Meta<typeof FieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const startsWith =
	(label: string) => (accessibleName: string) =>
		accessibleName.startsWith(label);

const textbox = (canvas: Canvas, label: string) =>
	canvas.getByRole("textbox", { name: startsWith(label) });

const submitButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: SUBMIT_LABEL });

const describers = (control: HTMLElement) =>
	(control.getAttribute("aria-describedby") ?? "")
		.split(" ")
		.filter(id => id !== "")
		.map(id => document.getElementById(id));

const describedByText = (control: HTMLElement) =>
	describers(control).map(element => element?.textContent);

export const Idle: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("group", { name: LEGEND }),
		).toBeVisible();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const OneFieldInvalid: Story = {
	render: args => (
		<AddressForm
			group={args}
			start={{ ...VALID, postalCode: "12" }}
			checkedOnMount
		/>
	),
};

export const SeveralInvalid: Story = {
	render: args => (
		<AddressForm group={args} checkedOnMount />
	),
};

export const GroupLevelError: Story = {
	args: { errors: [LOOKUP_ERROR] },
	render: args => (
		<AddressForm group={args} start={VALID} />
	),
};

export const MemberOutsideNames: Story = {
	render: args => (
		<AddressForm
			group={args}
			start={{ ...EMPTY, addition: "Apartment" }}
			names={["postalCode", "houseNumber"]}
			checkedOnMount
		/>
	),
};

export const WrappingLabel: Story = {
	render: args => (
		<AddressForm
			group={args}
			start={{ ...VALID, postalCode: "12" }}
			houseNumberLabel={LONG_HOUSE_NUMBER_LABEL}
			checkedOnMount
			narrow
		/>
	),
};

const NarrowAddressForm = (
	args: FieldGroupProps,
): ReactElement => (
	<div className={style.phone}>
		<AddressForm group={args} />
	</div>
);

const NARROW_LABELS = [
	POSTAL_CODE_LABEL,
	HOUSE_NUMBER_LABEL,
	ADDITION_LABEL,
];

const rightEdges = (control: HTMLElement) =>
	[
		control.closest("[data-field-group-member]"),
		control.parentElement,
		control,
	].map(element => element?.getBoundingClientRect().right);

export const NarrowRow: Story = {
	render: NarrowAddressForm,
	play: async ({ canvas }) => {
		const controls = NARROW_LABELS.map(label =>
			textbox(canvas, label),
		);
		const row = controls[0]?.closest(
			"[data-field-group-member]",
		)?.parentElement;
		const limits = [
			...controls
				.slice(1)
				.map(
					control =>
						control
							.closest("[data-field-group-member]")
							?.getBoundingClientRect().left,
				),
			row?.getBoundingClientRect().right,
		];

		await expect(row).toBeDefined();
		await expect(
			controls.flatMap((control, index) =>
				rightEdges(control).map(right => {
					const limit = limits[index];
					return (
						right !== undefined &&
						limit !== undefined &&
						right <= limit
					);
				}),
			),
		).not.toContain(false);
	},
};

export const HiddenLabel: Story = {
	render: args => (
		<AddressForm
			group={args}
			start={{ ...VALID, postalCode: "12" }}
			additionLabelHidden
			checkedOnMount
		/>
	),
	play: async ({ canvas }) => {
		const postalCode = textbox(canvas, POSTAL_CODE_LABEL);
		const addition = textbox(canvas, ADDITION_LABEL);

		await expect(addition.getBoundingClientRect().top).toBe(
			postalCode.getBoundingClientRect().top,
		);
	},
};

export const WithCounter: Story = {
	render: args => (
		<AddressForm
			group={args}
			start={{ ...VALID, addition: "A" }}
			additionMaxLength={4}
		/>
	),
	play: async ({ canvas }) => {
		const addition = textbox(canvas, ADDITION_LABEL);
		const group = addition.parentElement;
		const counterText = document.createRange();
		counterText.selectNodeContents(canvas.getByText("1/4"));

		await expect(group).not.toBeNull();
		await expect(
			counterText.getBoundingClientRect().right,
		).toBe(group?.getBoundingClientRect().right);
	},
};

export const FormattedErrors: Story = {
	args: {
		formatError: (field, message) =>
			`${field.label ?? field.name}: ${message}`,
	},
	render: args => (
		<AddressForm group={args} terse checkedOnMount />
	),
};

export const Busy: Story = {
	render: args => (
		<AddressForm group={args} start={VALID} busy />
	),
	play: async ({ canvas }) => {
		await expect(
			textbox(canvas, POSTAL_CODE_LABEL),
		).toBeDisabled();
		await expect(
			textbox(canvas, HOUSE_NUMBER_LABEL),
		).toBeDisabled();
	},
};

const RawAddressField = ({
	label,
}: Readonly<{ label: string }>): ReactElement => {
	const {
		field,
		props: { name, onBlur, ...state },
	} = useConnectedField<string>(label);
	return (
		<TextInput.Root
			{...state}
			value={field.state.value}
			onValueChange={field.handleChange}
			optionalLabel={OPTIONAL_LABEL}
			className={style.customField}>
			<TextInput.Label className={style.customLabel}>
				{label}
			</TextInput.Label>
			<TextInput.Group className={style.customControl}>
				<TextInput.Input name={name} onBlur={onBlur} />
			</TextInput.Group>
			<TextInput.Error />
		</TextInput.Root>
	);
};

const CustomLayoutForm = ({
	legend,
	optionalLabel,
}: FieldGroupProps): ReactElement => {
	const form = useAppForm({
		defaultValues: EMPTY,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: SCHEMA },
	});
	const members = useStore(form.store, state =>
		EVERY_NAME.map(name => ({
			name,
			errors: getFieldErrors(state, [name]),
		})),
	);

	return (
		<Form.Root form={form} className={style.form}>
			<Fieldset.Root members={members}>
				<Fieldset.Legend optionalLabel={optionalLabel}>
					{legend}
				</Fieldset.Legend>
				<div className={style.customRow}>
					<form.AppField name="postalCode">
						{() => (
							<RawAddressField label={POSTAL_CODE_LABEL} />
						)}
					</form.AppField>
					<form.AppField name="houseNumber">
						{() => (
							<RawAddressField label={HOUSE_NUMBER_LABEL} />
						)}
					</form.AppField>
					<form.AppField name="addition">
						{() => (
							<RawAddressField label={ADDITION_LABEL} />
						)}
					</form.AppField>
				</div>
				<Fieldset.Error />
			</Fieldset.Root>
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

export const CustomLayout: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`FieldGroup`, `TextField` and the other shorthands are for the common case. A custom layout drops to the raw tier: `Fieldset` and each control's raw parts, bound with `useConnectedField`, placed by the app's own CSS. Here the row is a grid whose rows the CSS names (`label`, `control`), each field a `minmax(0, 1fr)` column on a subgrid, and each part placed on its named row.",
			},
		},
	},
	render: CustomLayoutForm,
};

const submitEmpty = async (canvas: Canvas) => {
	await userEvent.click(submitButton(canvas));
	return canvas.findByRole("alert");
};

export const DescribedByOwnLines: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const alert = await submitEmpty(canvas);
		const postalCode = textbox(canvas, POSTAL_CODE_LABEL);
		const houseNumber = textbox(canvas, HOUSE_NUMBER_LABEL);

		await waitFor(() =>
			expect(describedByText(postalCode)).toEqual([
				POSTAL_CODE_DESCRIPTION,
				POSTAL_CODE_ERROR,
			]),
		);
		await waitFor(() =>
			expect(describedByText(houseNumber)).toEqual([
				HOUSE_NUMBER_ERROR,
			]),
		);
		await expect(
			describers(houseNumber).every(
				line => line !== null && alert.contains(line),
			),
		).toBe(true);
		await expect(postalCode).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(houseNumber).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	},
};

export const OneLiveRegion: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const alert = await submitEmpty(canvas);

		await expect(alert).toHaveTextContent(
			POSTAL_CODE_ERROR,
		);
		await expect(alert).toHaveTextContent(
			HOUSE_NUMBER_ERROR,
		);
		await expect(canvas.getAllByRole("alert")).toHaveLength(
			1,
		);
	},
};

export const OutsideNamesKeepsItsOwnError: Story = {
	tags: ["!dev", "!autodocs"],
	render: args => (
		<AddressForm
			group={args}
			names={["postalCode", "houseNumber"]}
		/>
	),
	play: async ({ canvas }) => {
		await userEvent.type(
			textbox(canvas, ADDITION_LABEL),
			"Apartment",
		);
		await userEvent.click(submitButton(canvas));

		await waitFor(() =>
			expect(canvas.getAllByRole("alert")).toHaveLength(2),
		);
		const groupAlert = canvas
			.getByText(POSTAL_CODE_ERROR)
			.closest('[role="alert"]');
		const additionAlert = canvas
			.getByText(ADDITION_ERROR)
			.closest('[role="alert"]');
		await expect(groupAlert).not.toBeNull();
		await expect(additionAlert).not.toBeNull();
		await expect(additionAlert).not.toBe(groupAlert);
		await expect(groupAlert).not.toHaveTextContent(
			ADDITION_ERROR,
		);
		await waitFor(() =>
			expect(
				describedByText(textbox(canvas, ADDITION_LABEL)),
			).toEqual([ADDITION_ERROR]),
		);
	},
};

const leaveHouseNumberInvalid = async (canvas: Canvas) => {
	await userEvent.type(
		textbox(canvas, POSTAL_CODE_LABEL),
		VALID.postalCode,
	);
	return submitButton(canvas);
};

const expectHouseNumberFocused = async (canvas: Canvas) => {
	const houseNumber = textbox(canvas, HOUSE_NUMBER_LABEL);
	await waitFor(() =>
		expect(houseNumber).toHaveAttribute(
			"aria-invalid",
			"true",
		),
	);
	await waitFor(() => expect(houseNumber).toHaveFocus());
	await expect(
		textbox(canvas, POSTAL_CODE_LABEL),
	).not.toHaveAttribute("aria-invalid", "true");
};

export const FocusFirstInvalidKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const submit = await leaveHouseNumberInvalid(canvas);
		submit.focus();
		await expect(submit).toHaveFocus();

		await userEvent.keyboard("{Enter}");

		await expectHouseNumberFocused(canvas);
	},
};

export const FocusFirstInvalidMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(
			await leaveHouseNumberInvalid(canvas),
		);

		await expectHouseNumberFocused(canvas);
	},
};

export const FocusFirstInvalidTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await leaveHouseNumberInvalid(canvas),
		});

		await expectHouseNumberFocused(canvas);
	},
};

import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import AttachFileIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import DateRangeIcon from "@material-design-icons/svg/outlined/date_range.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import PhotoCameraIcon from "@material-design-icons/svg/outlined/photo_camera.svg?react";
import RemoveIcon from "@material-design-icons/svg/outlined/remove.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import UploadFileIcon from "@material-design-icons/svg/outlined/upload_file.svg?react";
import VisibilityIcon from "@material-design-icons/svg/outlined/visibility.svg?react";
import VisibilityOffIcon from "@material-design-icons/svg/outlined/visibility_off.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../icon/index.ts";
import { revalidateLogic } from "@tanstack/react-form";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { pdfFile } from "../../lib/storybook/files.ts";
import { z } from "zod";
import { useAppForm } from "../../lib/storybook/app-form.tsx";
import { OPTIONS_LOAD_LABELS } from "../../lib/storybook/options-load.ts";
import { roleGone } from "../../lib/storybook/waits.ts";
import { Form, type FormRootProps } from "./index.ts";
import style from "./form.stories.module.scss";

const NAME_LABEL = "Name";
const NAME_ERROR = "Enter at least 2 characters.";
const EMAIL_LABEL = "Email";
const EMAIL_ERROR = "Enter an email address.";
const NOTES_LABEL = "Notes";
const NOTES_DESCRIPTION =
	"Anything the reviewer should know.";
const PASSWORD_LABEL = "Password";
const SHOW_PASSWORD_LABEL = "Show password";
const HIDE_PASSWORD_LABEL = "Hide password";
const PHONE_LABEL = "Phone number";
const CONTACT_LABEL = "Client contact";
const CLEAR_LABEL = "Clear";
const HOURS_LABEL = "Hours";
const DECREMENT_LABEL = "Decrease";
const INCREMENT_LABEL = "Increase";
const NUMBER_ROLE = "Number field";
const CODE_LABEL = "Invitation code";
const OPTIONAL_LABEL = "optional";
const SUBMIT_LABEL = "Submit";
const BUSY_LABEL = "Submitting";
const REFUSED = "The invoice period has closed.";
const REFUSED_NAME = "Closed";

const CODE_LENGTH = 6;

const codeSlotLabel = (index: number, total: number) =>
	`character ${index} of ${total}`;

const SCHEMA = z.object({
	name: z.string().min(2, NAME_ERROR),
	email: z.string().includes("@", { error: EMAIL_ERROR }),
	notes: z.string(),
	password: z.string(),
	phone: z.string(),
	contact: z.string(),
	hours: z.number().nullable(),
	code: z.string(),
});

type ExampleValues = z.input<typeof SCHEMA>;

const EMPTY: ExampleValues = {
	name: "",
	email: "",
	notes: "",
	password: "",
	phone: "",
	contact: "",
	hours: null,
	code: "",
};

const submitted =
	fn<(value: ExampleValues) => void>().mockName(
		"submitted",
	);

const SUBMIT_DELAY_MS = 600;

type ExampleFormProps = Omit<
	FormRootProps,
	"form" | "children"
>;

const ExampleForm = (props: ExampleFormProps) => {
	const form = useAppForm({
		defaultValues: EMPTY,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: SCHEMA,
			onSubmitAsync: ({ value }) =>
				value.name === REFUSED_NAME ? REFUSED : undefined,
		},
		onSubmit: async ({ value }) => {
			await new Promise(resolve => {
				setTimeout(resolve, SUBMIT_DELAY_MS);
			});
			submitted(value);
		},
	});

	return (
		<Form.Root
			form={form}
			className={style.form}
			{...props}>
			<form.AppField name="name">
				{field => (
					<field.TextField
						label={NAME_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="email">
				{field => (
					<field.EmailField
						label={EMAIL_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
						icon={<Icon svg={MailIcon} label="" />}
					/>
				)}
			</form.AppField>
			<form.AppField name="notes">
				{field => (
					<field.TextareaField
						label={NOTES_LABEL}
						description={NOTES_DESCRIPTION}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="password">
				{field => (
					<field.PasswordField
						label={PASSWORD_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
						showPasswordLabel={SHOW_PASSWORD_LABEL}
						hidePasswordLabel={HIDE_PASSWORD_LABEL}
						showPasswordIcon={
							<Icon svg={VisibilityIcon} label="" />
						}
						hidePasswordIcon={
							<Icon svg={VisibilityOffIcon} label="" />
						}
						autoComplete="new-password"
					/>
				)}
			</form.AppField>
			<form.AppField name="phone">
				{field => (
					<field.PhoneField
						label={PHONE_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="contact">
				{field => (
					<field.SearchField
						label={CONTACT_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
						clearLabel={CLEAR_LABEL}
						clearIcon={<Icon svg={CloseIcon} label="" />}
						icon={<Icon svg={SearchIcon} label="" />}
					/>
				)}
			</form.AppField>
			<form.AppField name="hours">
				{field => (
					<field.NumberField
						label={HOURS_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
						decrementLabel={DECREMENT_LABEL}
						incrementLabel={INCREMENT_LABEL}
						decrementIcon={
							<Icon svg={RemoveIcon} label="" />
						}
						incrementIcon={<Icon svg={AddIcon} label="" />}
						roleDescription={NUMBER_ROLE}
						min={0}
					/>
				)}
			</form.AppField>
			<form.AppField name="code">
				{field => (
					<field.OtpField
						label={CODE_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
						slotLabel={codeSlotLabel}
						length={CODE_LENGTH}
					/>
				)}
			</form.AppField>
			<Form.Errors />
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

const TERMS_LABEL = "I agree to the terms";
const TERMS_ERROR = "Agree to the terms to continue.";
const STATUSES_LABEL = "Statuses";
const STATUSES_ERROR = "Choose at least one status.";
const KIND_LABEL = "Kind";
const KIND_ERROR = "Choose a kind.";
const NOTIFY_LABEL = "Email me about new messages";
const STATUS_LABEL = "Status";
const STATUS_ERROR = "Choose a status.";
const VIEW_LABEL = "View";
const DAYS_LABEL = "Days";

const OWNER_LABEL = "Owner";
const OWNER_ERROR = "Choose an owner.";
const OWNERS = ["Ada", "Grace", "Linus"];

const CHECK_ICON = <Icon svg={CheckIcon} label="" />;
const EXPAND_ICON = <Icon svg={ExpandMoreIcon} label="" />;

const COMBOBOX_LABELS = {
	...OPTIONS_LOAD_LABELS,
	noResultsLabel: "No results.",
	searchLabel: "Search",
	loadingMoreLabel: "Loading more options…",
	resultsLabel: (count: number) => `${count} results`,
	icon: EXPAND_ICON,
	checkIcon: CHECK_ICON,
};

const STATUS_OPTIONS = [
	{ value: "open", label: "Open" },
	{ value: "paid", label: "Paid" },
];

const VIEW_OPTIONS = [
	{ value: "list", label: "List" },
	{ value: "board", label: "Board" },
];

const DAY_OPTIONS = [
	{ value: "mon", label: "Monday" },
	{ value: "tue", label: "Tuesday" },
];

const STATUS_ITEMS = [
	{ value: "open", label: "Open" },
	{ value: "sent", label: "Sent" },
	{ value: "paid", label: "Paid" },
] as const;

const KIND_OPTIONS = [
	{ value: "direct", label: "Direct" },
	{ value: "indirect", label: "Indirect" },
] as const;

const CHOICE_SCHEMA = z.object({
	terms: z.boolean().refine(agreed => agreed, TERMS_ERROR),
	statuses: z.array(z.string()).min(1, STATUSES_ERROR),
	kind: z
		.string()
		.nullable()
		.refine(kind => kind !== null, KIND_ERROR),
	notify: z.boolean(),
	status: z.string().min(1, STATUS_ERROR),
	view: z.string().nullable(),
	days: z.array(z.string()),
	owner: z
		.string()
		.nullable()
		.refine(owner => owner !== null, OWNER_ERROR),
});

type ChoiceValues = z.input<typeof CHOICE_SCHEMA>;

const NO_CHOICES: ChoiceValues = {
	terms: false,
	statuses: [],
	kind: null,
	notify: false,
	status: "",
	view: null,
	days: [],
	owner: null,
};

const choicesSubmitted = fn<
	(value: ChoiceValues) => void
>().mockName("choicesSubmitted");

const ChoiceForm = (props: ExampleFormProps) => {
	const form = useAppForm({
		defaultValues: NO_CHOICES,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: CHOICE_SCHEMA },
		onSubmit: ({ value }) => {
			choicesSubmitted(value);
		},
	});

	return (
		<Form.Root
			form={form}
			className={style.form}
			{...props}>
			<form.AppField name="terms">
				{field => (
					<field.CheckboxField
						label={TERMS_LABEL}
						checkIcon={CHECK_ICON}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="statuses">
				{field => (
					<field.CheckboxGroupField
						label={STATUSES_LABEL}
						items={STATUS_ITEMS}
						checkIcon={CHECK_ICON}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="kind">
				{field => (
					<field.RadioGroupField
						label={KIND_LABEL}
						options={KIND_OPTIONS}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="notify">
				{field => (
					<field.SwitchField
						label={NOTIFY_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="status">
				{field => (
					<field.SelectField
						label={STATUS_LABEL}
						options={STATUS_OPTIONS}
						icon={EXPAND_ICON}
						checkIcon={CHECK_ICON}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
						{...OPTIONS_LOAD_LABELS}
					/>
				)}
			</form.AppField>
			<form.AppField name="owner">
				{field => (
					<field.ComboboxField
						{...COMBOBOX_LABELS}
						label={OWNER_LABEL}
						items={OWNERS}
						itemKey={owner => owner}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}>
						{owner => owner}
					</field.ComboboxField>
				)}
			</form.AppField>
			<form.AppField name="view">
				{field => (
					<field.SegmentedControlField
						label={VIEW_LABEL}
						options={VIEW_OPTIONS}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="days">
				{field => (
					<field.ToggleGroupField
						label={DAYS_LABEL}
						options={DAY_OPTIONS}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Patterns",
				section:
					"An invalid form says so when it is submitted, then keeps up",
			},
			{
				page: "Foundation/Motion",
				section:
					"A wait announces itself late, and then stays a moment",
			},
			{ component: "components/field" },
			{ component: "components/error-text" },
			{ component: "components/email-field" },
			{ component: "components/number-field" },
			{ component: "components/otp-field" },
			{ component: "components/password-field" },
			{ component: "components/phone-field" },
			{ component: "components/search-field" },
			{ component: "components/text-field" },
			{ component: "components/textarea-field" },
		],
	},
	render: ExampleForm,
	args: { busy: false },
} satisfies Meta<ExampleFormProps>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const startsWith =
	(label: string) => (accessibleName: string) =>
		accessibleName.startsWith(label);

const textbox = (canvas: Canvas, name: string) =>
	canvas.getByRole("textbox", {
		name: startsWith(name),
	});

const submitButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: SUBMIT_LABEL });

const fieldsLoaded = async (canvas: Canvas) => {
	await Promise.all([
		...[
			EMAIL_LABEL,
			NOTES_LABEL,
			PHONE_LABEL,
			HOURS_LABEL,
			CODE_LABEL,
		].map(label =>
			canvas.findByRole("textbox", {
				name: startsWith(label),
			}),
		),
		canvas.findByRole("searchbox", {
			name: startsWith(CONTACT_LABEL),
		}),
	]);
};

export const Pristine: Story = {
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await expect(textbox(canvas, NAME_LABEL)).toBeVisible();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const Busy: Story = {
	args: { busy: true },
	play: async ({ canvas, canvasElement }) => {
		await expect(
			textbox(canvas, NAME_LABEL),
		).toBeDisabled();
		await expect(submitButton(canvas)).toBeDisabled();
		await expect(
			canvasElement.querySelector("fieldset"),
		).toHaveAttribute("inert");
	},
};

export const SubmitWithErrors: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.click(submitButton(canvas));

		await expect(
			await canvas.findByText(NAME_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(EMAIL_ERROR),
		).toBeInTheDocument();
		await expect(canvas.getAllByRole("alert")).toHaveLength(
			2,
		);
		await expect(
			textbox(canvas, NAME_LABEL),
		).toHaveAttribute("aria-invalid", "true");
		await expect(submitted).not.toHaveBeenCalled();
	},
};

const errorIndex = (element: HTMLElement) =>
	element.style.getPropertyValue("--error-index");

export const ErrorsCascade: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.click(submitButton(canvas));

		const alerts = await canvas.findAllByRole("alert");
		await expect(alerts.map(errorIndex)).toEqual([
			"0",
			"1",
		]);

		const name = textbox(canvas, NAME_LABEL);
		await userEvent.type(name, "Jan");
		await waitFor(() =>
			expect(
				canvas.queryByText(NAME_ERROR),
			).not.toBeInTheDocument(),
		);
		await userEvent.clear(name);

		const again = await canvas.findByText(NAME_ERROR);
		const block = again.closest<HTMLElement>(
			'[role="alert"]',
		);
		await expect(block).not.toBeNull();
		if (block !== null) {
			await expect(errorIndex(block)).toBe("0");
		}
	},
};

const leaveEmailInvalid = async (canvas: Canvas) => {
	await userEvent.type(textbox(canvas, NAME_LABEL), "Jan");
	return submitButton(canvas);
};

const expectEmailFocused = async (canvas: Canvas) => {
	const email = textbox(canvas, EMAIL_LABEL);
	await waitFor(() =>
		expect(email).toHaveAttribute("aria-invalid", "true"),
	);
	await waitFor(() => expect(email).toHaveFocus());
	await expect(
		textbox(canvas, NAME_LABEL),
	).not.toHaveAttribute("aria-invalid", "true");
	await expect(submitted).not.toHaveBeenCalled();
};

export const FocusFirstInvalidKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		const submit = await leaveEmailInvalid(canvas);
		submit.focus();
		await expect(submit).toHaveFocus();

		await userEvent.keyboard("{Enter}");

		await expectEmailFocused(canvas);
	},
};

export const FocusFirstInvalidMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.click(await leaveEmailInvalid(canvas));

		await expectEmailFocused(canvas);
	},
};

export const FocusFirstInvalidTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await leaveEmailInvalid(canvas),
		});

		await expectEmailFocused(canvas);
	},
};

export const FormLevelError: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.type(
			textbox(canvas, NAME_LABEL),
			REFUSED_NAME,
		);
		await userEvent.type(
			textbox(canvas, EMAIL_LABEL),
			"jan@example.com",
		);
		await userEvent.click(submitButton(canvas));

		await expect(
			await canvas.findByRole("alert"),
		).toHaveTextContent(REFUSED);
		await expect(submitted).not.toHaveBeenCalled();
	},
};

export const Submitted: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await fieldsLoaded(canvas);
		await userEvent.type(
			textbox(canvas, NAME_LABEL),
			"Jan",
		);
		await userEvent.type(
			textbox(canvas, EMAIL_LABEL),
			"jan@example.com",
		);
		const status = canvas.getByRole("status");
		await expect(status).toBeEmptyDOMElement();

		await userEvent.click(submitButton(canvas));

		await waitFor(() =>
			expect(status).toHaveTextContent(BUSY_LABEL),
		);
		await waitFor(() =>
			expect(submitted).toHaveBeenCalledWith({
				...EMPTY,
				name: "Jan",
				email: "jan@example.com",
			}),
		);
		await waitFor(() =>
			expect(status).toBeEmptyDOMElement(),
		);
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

const notifySwitch = (canvas: Canvas) =>
	canvas.getByRole("switch", {
		name: (name: string) => name.startsWith(NOTIFY_LABEL),
	});

const statusTrigger = (canvas: Canvas) =>
	canvas.getByRole("combobox", {
		name: (name: string) => name.startsWith(STATUS_LABEL),
	});

const chooseStatus = async (
	canvas: Canvas,
	name: string,
) => {
	await userEvent.click(statusTrigger(canvas));
	await userEvent.click(
		await screen.findByRole("option", { name }),
	);
	await roleGone("listbox");
};

const ownerControl = (canvas: Canvas) =>
	canvas.getByRole("combobox", {
		name: (name: string) => name.startsWith(OWNER_LABEL),
	});

const chooseOwner = async (
	canvas: Canvas,
	name: string,
) => {
	await userEvent.click(ownerControl(canvas));
	await userEvent.click(
		await screen.findByRole("option", { name }),
	);
	await roleGone("listbox");
	await expect(ownerControl(canvas)).toHaveTextContent(
		name,
	);
};

export const ChoicesSelectBlurTouches: Story = {
	tags: ["!dev", "!autodocs"],
	render: ChoiceForm,
	play: async ({ canvas }) => {
		const status = statusTrigger(canvas);
		status.focus();
		await expect(status).toHaveFocus();
		await expect(
			status.closest("[data-touched]"),
		).toBeNull();

		await userEvent.tab();
		await waitFor(() =>
			expect(
				status.closest("[data-touched]"),
			).not.toBeNull(),
		);
	},
};

export const ChoicesPristine: Story = {
	render: ChoiceForm,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("checkbox", { name: TERMS_LABEL }),
		).not.toBeChecked();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const ChoicesSubmitWithErrors: Story = {
	tags: ["!dev", "!autodocs"],
	render: ChoiceForm,
	play: async ({ canvas }) => {
		await userEvent.click(submitButton(canvas));

		await expect(
			await canvas.findByText(TERMS_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(STATUSES_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(KIND_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(STATUS_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(OWNER_ERROR),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(
				canvas.getByRole("checkbox", { name: TERMS_LABEL }),
			).toHaveFocus(),
		);
		await expect(choicesSubmitted).not.toHaveBeenCalled();
	},
};

export const ChoicesBlurTouches: Story = {
	tags: ["!dev", "!autodocs"],
	render: ChoiceForm,
	play: async ({ canvas }) => {
		const terms = canvas.getByRole("checkbox", {
			name: TERMS_LABEL,
		});
		await userEvent.click(terms);
		await userEvent.click(notifySwitch(canvas));

		await waitFor(() =>
			expect(
				terms.closest("[data-touched]"),
			).not.toBeNull(),
		);
	},
};

export const ChoicesSubmitted: Story = {
	tags: ["!dev", "!autodocs"],
	render: ChoiceForm,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("checkbox", { name: TERMS_LABEL }),
		);
		await userEvent.click(canvas.getByText("Sent"));
		await userEvent.click(
			canvas.getByRole("radio", { name: "Indirect" }),
		);
		await userEvent.click(notifySwitch(canvas));
		await chooseStatus(canvas, "Paid");
		await chooseOwner(canvas, "Grace");
		await userEvent.click(
			canvas.getByRole("button", { name: "Board" }),
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Monday" }),
		);
		await userEvent.click(submitButton(canvas));

		await waitFor(() =>
			expect(choicesSubmitted).toHaveBeenCalledWith({
				terms: true,
				statuses: ["sent"],
				kind: "indirect",
				notify: true,
				status: "paid",
				view: "board",
				days: ["mon"],
				owner: "Grace",
			}),
		);
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

const WORKED_ON_LABEL = "Service date";
const WORKED_ON_ERROR = "Enter the service date.";
const PERIOD_LABEL = "Invoice period";
const PERIOD_ERROR = "Enter the invoice period.";
const START_TIME_LABEL = "Start time";
const START_TIME_ERROR = "Enter the start time.";
const ATTACHMENTS_LABEL = "Attachments";
const ATTACHMENTS_ERROR = "Add at least one attachment.";
const PHOTO_LABEL = "Profile photo";

const CALENDAR_COPY = {
	openCalendarLabel: "Open calendar",
	previousMonthLabel: "Previous month",
	nextMonthLabel: "Next month",
	monthLabel: "Month",
	yearLabel: "Year",
	noMatchingYearLabel: "No matching year.",
};

const CALENDAR_ICONS = {
	previousIcon: <Icon svg={ChevronLeftIcon} label="" />,
	nextIcon: <Icon svg={ChevronRightIcon} label="" />,
	checkIcon: <Icon svg={CheckIcon} label="" />,
	expandIcon: <Icon svg={ExpandMoreIcon} label="" />,
};

const FILE_COPY = {
	dropTargetLabel: "Drop zone for attachments",
	dropHint: "Drag files here",
	dropIcon: <Icon svg={UploadFileIcon} label="" />,
	chooseLabel: "Choose files",
	chooseIcon: <Icon svg={AttachFileIcon} label="" />,
	filesLabel: "Files for attachments",
	removeLabel: "Remove",
	removeIcon: <Icon svg={CloseIcon} label="" />,
	fileHint: (name: string, size: string) =>
		`${name} (${size})`,
	tooLargeError: (name: string, maxSize: string) =>
		`${name} is larger than the maximum size of ${maxSize}.`,
	wrongTypeError: (name: string) =>
		`${name} is not an accepted file type.`,
};

const PHOTO_COPY = {
	previewLabel: "Preview",
	photoSetLabel: "Photo set",
	noPhotoLabel: "No photo",
	removeLabel: "Remove photo",
	removeIcon: <Icon svg={CloseIcon} label="" />,
	icon: <Icon svg={PhotoCameraIcon} label="" />,
};

const INVOICE = pdfFile("invoice-july.pdf");

const FILES_AND_DATES_SCHEMA = z.object({
	workedOn: z
		.string()
		.nullable()
		.refine(value => value !== null, WORKED_ON_ERROR),
	period: z
		.object({ start: z.string(), end: z.string() })
		.nullable()
		.refine(value => value !== null, PERIOD_ERROR),
	startTime: z
		.string()
		.nullable()
		.refine(value => value !== null, START_TIME_ERROR),
	attachments: z
		.array(z.instanceof(File))
		.min(1, ATTACHMENTS_ERROR),
	photo: z.instanceof(File).optional(),
});

type FilesAndDatesValues = z.input<
	typeof FILES_AND_DATES_SCHEMA
>;

const NO_FILES_AND_DATES: FilesAndDatesValues = {
	workedOn: null,
	period: null,
	startTime: null,
	attachments: [],
	photo: undefined,
};

const submittedFilesAndDates = fn<
	(value: FilesAndDatesValues) => void
>().mockName("submittedFilesAndDates");

const FilesAndDatesForm = (props: ExampleFormProps) => {
	const form = useAppForm({
		defaultValues: NO_FILES_AND_DATES,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: FILES_AND_DATES_SCHEMA },
		onSubmit: ({ value }) => submittedFilesAndDates(value),
	});

	return (
		<Form.Root
			form={form}
			className={style.form}
			{...props}>
			<form.AppField name="workedOn">
				{field => (
					<field.DateField
						label={WORKED_ON_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
						openCalendarIcon={
							<Icon svg={CalendarTodayIcon} label="" />
						}
						{...CALENDAR_COPY}
						{...CALENDAR_ICONS}
					/>
				)}
			</form.AppField>
			<form.AppField name="period">
				{field => (
					<field.DateRangeField
						label={PERIOD_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
						visibleMonths={2}
						openCalendarIcon={
							<Icon svg={DateRangeIcon} label="" />
						}
						{...CALENDAR_COPY}
						{...CALENDAR_ICONS}
					/>
				)}
			</form.AppField>
			<form.AppField name="startTime">
				{field => (
					<field.TimeField
						label={START_TIME_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
					/>
				)}
			</form.AppField>
			<form.AppField name="attachments">
				{field => (
					<field.FileField
						label={ATTACHMENTS_LABEL}
						requiredness="required"
						optionalLabel={OPTIONAL_LABEL}
						maxFileSize={1024 ** 2}
						accept={["application/pdf", "image/png"]}
						multiple
						{...FILE_COPY}
					/>
				)}
			</form.AppField>
			<form.AppField name="photo">
				{field => (
					<field.PhotoField
						label={PHOTO_LABEL}
						requiredness="optional"
						optionalLabel={OPTIONAL_LABEL}
						{...PHOTO_COPY}
					/>
				)}
			</form.AppField>
			<Form.Errors />
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

const segmentsOf = async (canvas: Canvas, label: string) =>
	canvas.findAllByRole("spinbutton", {
		name: (name: string) => name.includes(label),
	});

const firstSegmentOf = async (
	canvas: Canvas,
	label: string,
) => {
	const [first] = await segmentsOf(canvas, label);
	if (first === undefined) {
		throw new Error(`${label} renders no segments.`);
	}
	return first;
};

const attachmentsInput = async (canvas: Canvas) => {
	const input = (
		await canvas.findByRole("group", {
			name: (name: string) =>
				name.startsWith(ATTACHMENTS_LABEL),
		})
	).querySelector('input[type="file"]');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error(
			"The file field renders no file input.",
		);
	}
	return input;
};

export const FilesAndDates: Story = {
	render: FilesAndDatesForm,
	play: async ({ canvas }) => {
		await expect(
			await firstSegmentOf(canvas, WORKED_ON_LABEL),
		).toBeVisible();
		await expect(
			await canvas.findByRole("button", {
				name: (name: string) =>
					name.startsWith(PHOTO_LABEL),
			}),
		).toBeVisible();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const FilesAndDatesFileBlurTouches: Story = {
	tags: ["!dev", "!autodocs"],
	render: FilesAndDatesForm,
	play: async ({ canvas }) => {
		const attachments = await canvas.findByRole("group", {
			name: startsWith(ATTACHMENTS_LABEL),
		});
		const choose = within(attachments).getByRole("button", {
			name: FILE_COPY.chooseLabel,
		});
		choose.focus();
		await expect(choose).toHaveFocus();
		await expect(
			choose.closest("[data-touched]"),
		).toBeNull();

		await userEvent.tab();
		await waitFor(() =>
			expect(
				choose.closest("[data-touched]"),
			).not.toBeNull(),
		);
	},
};

export const FilesAndDatesSubmitWithErrors: Story = {
	tags: ["!dev", "!autodocs"],
	render: FilesAndDatesForm,
	play: async ({ canvas }) => {
		await attachmentsInput(canvas);
		await firstSegmentOf(canvas, START_TIME_LABEL);

		await userEvent.click(submitButton(canvas));

		await expect(
			await canvas.findByText(WORKED_ON_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(PERIOD_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(START_TIME_ERROR),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(ATTACHMENTS_ERROR),
		).toBeInTheDocument();
		await expect(canvas.getAllByRole("alert")).toHaveLength(
			4,
		);
		await waitFor(async () =>
			expect(
				await firstSegmentOf(canvas, WORKED_ON_LABEL),
			).toHaveFocus(),
		);
		await expect(
			submittedFilesAndDates,
		).not.toHaveBeenCalled();
	},
};

export const FilesAndDatesSubmitted: Story = {
	tags: ["!dev", "!autodocs"],
	render: FilesAndDatesForm,
	play: async ({ canvas }) => {
		await userEvent.click(
			await firstSegmentOf(canvas, WORKED_ON_LABEL),
		);
		await userEvent.keyboard("07242026");
		await userEvent.click(
			await firstSegmentOf(canvas, PERIOD_LABEL),
		);
		await userEvent.keyboard("0701202607312026");
		await userEvent.click(
			await firstSegmentOf(canvas, START_TIME_LABEL),
		);
		await userEvent.keyboard("0930");
		await userEvent.upload(
			await attachmentsInput(canvas),
			INVOICE,
		);

		await userEvent.click(submitButton(canvas));

		await waitFor(() =>
			expect(submittedFilesAndDates).toHaveBeenCalledWith({
				workedOn: "2026-07-24",
				period: { start: "2026-07-01", end: "2026-07-31" },
				startTime: "09:30",
				attachments: [INVOICE],
				photo: undefined,
			}),
		);
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

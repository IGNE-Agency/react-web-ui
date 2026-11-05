import AttachFileIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import UploadFileIcon from "@material-design-icons/svg/outlined/upload_file.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	within,
} from "storybook/test";
import {
	fileInput,
	pdfFile,
	pickerOpens,
	pngFile,
} from "../../lib/storybook/files.ts";
import { Icon } from "../icon/index.ts";
import {
	FileField,
	type FileFieldProps,
} from "./file-field.tsx";

const LABEL = "Attachments";
const DROP_TARGET = "Drop zone for attachments";
const CHOOSE = "Choose files";
const REMOVE = "Remove";
const tooLarge = (name: string, maxSize: string) =>
	`${name} is larger than the maximum size of ${maxSize} and must be removed.`;
const wrongType = (name: string) =>
	`${name} is not an accepted file type and must be removed.`;
const SCAN_NAME = "signed-timesheet.png";

const KILOBYTE = 1024;

const ACCEPTED = ["application/pdf", "image/png"];

const INVOICE = pdfFile("invoice-july.pdf");

const SCAN = pngFile(SCAN_NAME);

const OVERSIZED_SCAN = new File(
	[new Uint8Array(2 * KILOBYTE)],
	SCAN_NAME,
	{ type: "image/png" },
);

const PROGRAM = new File(["MZ"], "setup.exe", {
	type: "application/x-msdownload",
});

const PlainFileField = (args: FileFieldProps) => (
	<FileField {...args} />
);

const ControlledFileField = (args: FileFieldProps) => {
	const [, updateArgs] = useArgs<FileFieldProps>();

	return (
		<FileField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Accessibility",
				section:
					"Every control has a name, from exactly one mechanism",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
			{ component: "components/field" },
			{ component: "components/attachment-tile" },
		],
	},
	component: FileField,
	render: ControlledFileField,
	args: {
		label: LABEL,
		optionalLabel: "optional",
		dropTargetLabel: DROP_TARGET,
		dropHint: "Drag files here",
		dropIcon: <Icon svg={UploadFileIcon} label="" />,
		chooseLabel: CHOOSE,
		chooseIcon: <Icon svg={AttachFileIcon} label="" />,
		filesLabel: "Files for attachments",
		removeLabel: REMOVE,
		removeIcon: <Icon svg={CloseIcon} label="" />,
		fileHint: (name, size) => `${name} (${size})`,
		tooLargeError: tooLarge,
		wrongTypeError: wrongType,
		value: [],
		onValueChange: fn(),
		multiple: true,
		accept: ACCEPTED,
		maxFileSize: KILOBYTE,
	},
} satisfies Meta<typeof FileField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFiles: Story = {
	args: { value: [INVOICE, SCAN] },
};

export const TooLarge: Story = {
	args: { value: [INVOICE, OVERSIZED_SCAN] },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert").textContent,
		).toBe(tooLarge(OVERSIZED_SCAN.name, "1 kB"));
	},
};

export const WrongType: Story = {
	args: { value: [INVOICE, PROGRAM] },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert").textContent,
		).toBe(wrongType(PROGRAM.name));
	},
};

export const Single: Story = {
	args: { multiple: false, value: [INVOICE] },
};

export const Disabled: Story = {
	args: { value: [INVOICE], disabled: true },
};

export const ReadOnly: Story = {
	args: { value: [INVOICE, SCAN], readOnly: true },
	play: async ({ canvas }) => {
		await expect(
			canvas.queryByRole("button", {
				name: CHOOSE,
			}),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole("button", {
				name: REMOVE,
			}),
		).not.toBeInTheDocument();
	},
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: { errors: ["Add at least one attachment."] },
};

export const Pending: Story = {
	args: { value: [INVOICE], pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "Add the invoice and any signed timesheet.",
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [INVOICE] },
	render: PlainFileField,
	play: async ({ args, canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", {
			name: CHOOSE,
		});
		const picker = pickerOpens(canvasElement);

		await userEvent.tab();
		await expect(
			canvas.getByRole("button", {
				name: DROP_TARGET,
			}),
		).toHaveFocus();
		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(picker).toHaveBeenCalledOnce();

		const tile = canvas.getByRole("row", {
			name: INVOICE.name,
		});
		tile.focus();
		await expect(tile).toHaveFocus();
		await userEvent.keyboard("{Delete}");

		await expect(args.onValueChange).toHaveBeenCalledWith(
			[],
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [INVOICE] },
	render: PlainFileField,
	play: async ({ args, canvas, canvasElement }) => {
		const picker = pickerOpens(canvasElement);

		await userEvent.click(
			canvas.getByRole("button", {
				name: CHOOSE,
			}),
		);
		await expect(picker).toHaveBeenCalledOnce();

		await userEvent.upload(fileInput(canvasElement), SCAN);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith([INVOICE, SCAN]);

		await userEvent.click(
			within(
				canvas.getByRole("row", { name: INVOICE.name }),
			).getByRole("button", {
				name: REMOVE,
			}),
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith([]);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [] },
	render: PlainFileField,
	play: async ({ args, canvas, canvasElement }) => {
		const picker = pickerOpens(canvasElement);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: CHOOSE,
			}),
		});
		await expect(picker).toHaveBeenCalledOnce();

		await userEvent.upload(
			fileInput(canvasElement),
			INVOICE,
		);
		await expect(args.onValueChange).toHaveBeenCalledWith([
			INVOICE,
		]);
	},
};

export const UploadTooLarge: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [] },
	render: PlainFileField,
	play: async ({ args, canvasElement }) => {
		await userEvent.upload(
			fileInput(canvasElement),
			OVERSIZED_SCAN,
		);

		await expect(args.onValueChange).toHaveBeenCalledWith([
			OVERSIZED_SCAN,
		]);
	},
};

export const UploadWrongType: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [] },
	render: PlainFileField,
	play: async ({ args, canvasElement }) => {
		await userEvent.upload(
			fileInput(canvasElement),
			PROGRAM,
		);

		await expect(args.onValueChange).not.toHaveBeenCalled();
	},
};

export const SingleReplaces: Story = {
	tags: ["!dev", "!autodocs"],
	args: { multiple: false, value: [INVOICE] },
	render: PlainFileField,
	play: async ({ args, canvasElement }) => {
		await userEvent.upload(fileInput(canvasElement), SCAN);

		await expect(args.onValueChange).toHaveBeenCalledWith([
			SCAN,
		]);
	},
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
import { STORY_COPY } from "../../lib/storybook/story-providers.tsx";
import { AttachmentTile } from "../attachment-tile/index.ts";
import { Button } from "../button/index.ts";
import { Field } from "../field/index.ts";
import {
	FileField,
	type FileFieldProps,
} from "./file-field.tsx";
import { FileInput } from "./file-input.tsx";

const LABEL = "Attachments";
const DROP_TARGET = "Drop zone for attachments";
const CHOOSE = STORY_COPY.files.choose;
const SCAN_NAME = "signed-timesheet.png";
const FILES_LABEL = "Files for attachments";
const DESCRIPTION =
	"Add the invoice and any signed timesheet.";
const PDF_ERROR = "Attach PDFs only.";

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

const ComposedFileInput = () => {
	const [files, setFiles] = useState<readonly File[]>([]);
	const notPdf = files.some(
		file => file.type !== "application/pdf",
	);

	return (
		<FileInput.Root
			filled={files.length > 0}
			errors={notPdf ? [PDF_ERROR] : undefined}
			requiredness="required">
			<FileInput.Legend>
				{LABEL} <Field.Requiredness />
			</FileInput.Legend>
			<FileInput.DropTarget aria-label={DROP_TARGET}>
				<FileInput.Hint>Drag files here</FileInput.Hint>
				<FileInput.Trigger
					allowsMultiple
					onSelect={list =>
						setFiles(list === null ? [] : [...list])
					}
					render={
						<Button variant="secondary" size="sm">
							{CHOOSE}
						</Button>
					}
				/>
				{files.length === 0 ? null : (
					<FileInput.List label={FILES_LABEL}>
						{files.map(file => (
							<FileInput.Item
								key={file.name}
								id={file.name}
								textValue={file.name}>
								<AttachmentTile.Preview
									name={file.name}
									src={undefined}>
									<AttachmentTile.Extension />
									<AttachmentTile.Name />
								</AttachmentTile.Preview>
							</FileInput.Item>
						))}
					</FileInput.List>
				)}
			</FileInput.DropTarget>
			<FileInput.Description>
				{DESCRIPTION}
			</FileInput.Description>
			<FileInput.Error />
		</FileInput.Root>
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
		dropTargetLabel: DROP_TARGET,
		filesLabel: FILES_LABEL,
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
		).toBe(
			STORY_COPY.files.tooLargeFile(
				OVERSIZED_SCAN.name,
				"1 kB",
			),
		);
	},
};

export const WrongType: Story = {
	args: { value: [INVOICE, PROGRAM] },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert").textContent,
		).toBe(STORY_COPY.files.wrongType(PROGRAM.name));
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
				name: STORY_COPY.remove,
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
		description: DESCRIPTION,
	},
};

export const Composed: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedFileInput,
	play: async ({ canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", {
			name: CHOOSE,
		});

		await expect(
			canvas.getByRole("group", {
				name: `${LABEL} ${STORY_COPY.required}`,
			}),
		).toBeInTheDocument();
		await expect(trigger).toHaveAccessibleDescription(
			DESCRIPTION,
		);

		await userEvent.upload(fileInput(canvasElement), SCAN);

		const error = await canvas.findByRole("alert");
		await expect(error).toHaveTextContent(PDF_ERROR);
		await expect(
			trigger.getAttribute("aria-describedby")?.split(" "),
		).toContain(error.id);
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
				name: STORY_COPY.remove,
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

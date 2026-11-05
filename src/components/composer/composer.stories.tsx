import SendIcon from "@material-design-icons/svg/outlined/arrow_forward.svg?react";
import AttachIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import {
	fileInput,
	pngFile,
} from "../../lib/storybook/files.ts";
import { roleGone } from "../../lib/storybook/waits.ts";
import { Button } from "../button/index.ts";
import {
	Composer,
	type ComposerAttachmentOptions,
	type ComposerProps,
} from "./composer.tsx";
import type { ComposerSendPayload } from "./composer.context.ts";
import type {
	MentionCandidate,
	MentionSource,
} from "./mention-sources.ts";
import { serializeMention } from "./mention-text.tsx";
import { Icon } from "../icon/index.ts";

type Person = Readonly<{
	id: string;
	name: string;
	label: string;
}>;

const EDITOR_LABEL = "Comment";
const PLACEHOLDER =
	"Write a comment, use @ to mention someone";
const DRAFT = "Could you take another look?";
const IMAGE_NAME = "scan.png";
const CLEAR_LABEL = "Clear draft";
const FOCUS_LABEL = "Go to comment";
const SEND = "Send";
const ATTACHMENTS = "Attachments";
const MENTIONS = "People to mention";
const ADD_ATTACHMENT = "Add attachment";
const REMOVE = "Remove";

const person = (id: string, name: string): Person => ({
	id,
	name,
	label: name.replace(/\s+/g, ""),
});

const PEOPLE = [
	person("user-anne", "Anne de Vries"),
	person("user-bram", "Bram Jansen"),
	person("user-chris", "Chris Bakker"),
] as const;

const [ANNE, BRAM, CHRIS] = PEOPLE;

const PEOPLE_SOURCE: MentionSource = {
	resolve: query =>
		Promise.resolve(
			PEOPLE.filter(({ label }) =>
				label
					.toLowerCase()
					.includes(query.trim().toLowerCase()),
			).map(({ id, name, label }): MentionCandidate => ({
				id,
				label,
				row: name,
			})),
		),
};

const MAX_FILE_SIZE = 1024;

const imageFile = () => pngFile(IMAGE_NAME);

const documentFile = (size = 128) =>
	new File(["x".repeat(size)], "timesheet.pdf", {
		type: "application/pdf",
	});

const fileHint = (name: string, size: string) =>
	`${name} (${size})`;

const tooLargeError = (maxSize: string) =>
	`Some files exceed the maximum size of ${maxSize} and must be removed before sending.`;

const ATTACHMENT_OPTIONS: ComposerAttachmentOptions = {
	label: ATTACHMENTS,
	removeLabel: REMOVE,
	removeIcon: <CloseIcon />,
	fileIcon: <DescriptionIcon />,
	fileHint,
	tooLargeError,
	attachLabel: ADD_ATTACHMENT,
	attachIcon: <AttachIcon />,
};

const ComposerParts = ({
	defaultValue,
	disabled,
	maxLength,
	maxFileSize,
	onSend,
}: ComposerProps) => (
	<Composer.Root
		defaultValue={defaultValue}
		disabled={disabled}
		maxLength={maxLength}
		maxFileSize={maxFileSize}
		onSend={onSend}>
		<Composer.Attachments
			label={ATTACHMENTS}
			removeLabel={REMOVE}
			removeIcon={<Icon svg={CloseIcon} label="" />}
			fileHint={fileHint}
		/>
		<Composer.AttachmentsError
			tooLargeError={tooLargeError}
		/>
		<Composer.Editor
			label={EDITOR_LABEL}
			placeholder={PLACEHOLDER}>
			<Composer.Mentions
				label={MENTIONS}
				sources={[PEOPLE_SOURCE]}
			/>
		</Composer.Editor>
		<Composer.Toolbar>
			<Composer.MaxLength />
			<Composer.AttachButton label={ADD_ATTACHMENT}>
				<Icon svg={AttachIcon} label="" />
			</Composer.AttachButton>
			<Composer.SendButton label={SEND}>
				<Icon svg={SendIcon} label="" />
			</Composer.SendButton>
		</Composer.Toolbar>
	</Composer.Root>
);

const ComposerWithHandle = (args: ComposerProps) => {
	const [composer] = useState(() =>
		Composer.createHandle(),
	);

	return (
		<>
			<Composer {...args} handle={composer} />
			<Button
				variant="secondary"
				onClick={() => composer.clear()}>
				{CLEAR_LABEL}
			</Button>
			<Button
				variant="secondary"
				onClick={() => composer.focus()}>
				{FOCUS_LABEL}
			</Button>
		</>
	);
};

type Canvas = ReturnType<typeof within>;

const editor = (canvas: Canvas) =>
	canvas.getByRole("combobox", {
		name: EDITOR_LABEL,
	});

const sendButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: SEND });

const attachments = () =>
	screen.findByRole("grid", {
		name: ATTACHMENTS,
	});

const sentOnce = async (
	onSend: ComposerProps["onSend"],
	payload: ComposerSendPayload,
) => {
	await expect(onSend).toHaveBeenCalledOnce();
	await expect(onSend).toHaveBeenCalledWith(payload);
};

const mentionOption = (who: Person) =>
	screen.findByRole("option", { name: who.name });

const meta = {
	parameters: {
		layout: "padded",
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
		],
	},
	component: Composer,
	args: {
		label: EDITOR_LABEL,
		placeholder: PLACEHOLDER,
		mentions: { label: MENTIONS, sources: [PEOPLE_SOURCE] },
		attachments: ATTACHMENT_OPTIONS,
		sendLabel: SEND,
		sendIcon: <SendIcon />,
		maxLength: 2000,
		onSend: fn(),
	},
	argTypes: {
		mentions: { control: false },
		attachments: { control: false },
		sendIcon: { control: false },
	},
} satisfies Meta<typeof Composer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	play: async ({ canvas }) => {
		await expect(
			editor(canvas),
		).toHaveAccessibleDescription(PLACEHOLDER);
		await expect(sendButton(canvas)).toBeDisabled();
	},
};

export const Drafted: Story = {
	args: {
		defaultValue: `${serializeMention(ANNE)} ${DRAFT}`,
	},
	play: async ({ canvas }) => {
		await expect(editor(canvas)).toHaveTextContent(
			`${ANNE.label} ${DRAFT}`,
		);
		await expect(sendButton(canvas)).toBeEnabled();
	},
};

export const OverMaxLength: Story = {
	args: {
		maxLength: 10,
		defaultValue: DRAFT,
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText(`${DRAFT.length}/10`),
		).toBeVisible();
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		defaultValue: DRAFT,
	},
	play: async ({ canvas }) => {
		await expect(editor(canvas)).toHaveAttribute(
			"contenteditable",
			"false",
		);
		await expect(sendButton(canvas)).toBeDisabled();
		await expect(
			canvas.getByRole("button", {
				name: ADD_ATTACHMENT,
			}),
		).toBeDisabled();
	},
};

export const Parts: Story = {
	render: ComposerParts,
	play: async ({ canvas }) => {
		await expect(
			editor(canvas),
		).toHaveAccessibleDescription(PLACEHOLDER);
		await expect(sendButton(canvas)).toBeDisabled();
	},
};

export const Typing: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(DRAFT);

		await expect(editor(canvas)).toHaveTextContent(DRAFT);
		await expect(sendButton(canvas)).toBeEnabled();
	},
};

export const SendKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(DRAFT);
		await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
		await expect(args.onSend).not.toHaveBeenCalled();

		await userEvent.keyboard(DRAFT);
		await userEvent.keyboard("{Enter}");

		await sentOnce(args.onSend, {
			text: `${DRAFT}\n${DRAFT}`,
			mentionIds: [],
			attachments: [],
		});
	},
};

export const SendMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(DRAFT);
		await userEvent.click(sendButton(canvas));

		await sentOnce(args.onSend, {
			text: DRAFT,
			mentionIds: [],
			attachments: [],
		});
	},
};

export const SendTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(DRAFT);
		await userEvent.pointer({
			keys: "[TouchA]",
			target: sendButton(canvas),
		});

		await sentOnce(args.onSend, {
			text: DRAFT,
			mentionIds: [],
			attachments: [],
		});
	},
};

export const Sending: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		defaultValue: DRAFT,
		onSend: fn(
			() =>
				new Promise<void>(resolve => {
					setTimeout(resolve, 500);
				}),
		),
	},
	play: async ({ args, canvas }) => {
		await userEvent.click(sendButton(canvas));

		await expect(sendButton(canvas)).toBeDisabled();
		await userEvent.click(editor(canvas));
		await userEvent.keyboard("{Enter}");
		await expect(args.onSend).toHaveBeenCalledOnce();

		await waitFor(() =>
			expect(sendButton(canvas)).toBeEnabled(),
		);
	},
};

export const MentionKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		const input = editor(canvas);
		await userEvent.click(input);
		await userEvent.keyboard("@");

		await mentionOption(ANNE);
		await waitFor(() =>
			expect(input).toHaveAttribute(
				"aria-expanded",
				"true",
			),
		);
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(async () =>
			expect(await mentionOption(BRAM)).toHaveAttribute(
				"aria-selected",
				"true",
			),
		);
		await userEvent.keyboard("{Enter}");
		await roleGone("listbox", { name: MENTIONS });
		await expect(args.onSend).not.toHaveBeenCalled();

		await userEvent.keyboard(DRAFT);
		await userEvent.keyboard("{Enter}");

		await sentOnce(args.onSend, {
			text: `${BRAM.label} ${DRAFT}`,
			mentionIds: [BRAM.id],
			attachments: [],
		});
	},
};

export const MentionDismiss: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const input = editor(canvas);
		await userEvent.click(input);
		await userEvent.keyboard("@");
		await mentionOption(ANNE);

		await userEvent.keyboard("{Escape}");

		await roleGone("listbox", { name: MENTIONS });
		await expect(input).toHaveAttribute(
			"aria-expanded",
			"false",
		);
		await expect(input).toHaveTextContent("@");
	},
};

export const MentionFiltered: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(`@${CHRIS.label.slice(0, 3)}`);

		await waitFor(() =>
			expect(screen.getAllByRole("option")).toHaveLength(1),
		);
		await expect(await mentionOption(CHRIS)).toBeVisible();
	},
};

export const MentionMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard("@");
		await userEvent.click(await mentionOption(CHRIS));
		await roleGone("listbox", { name: MENTIONS });

		await userEvent.click(sendButton(canvas));

		await sentOnce(args.onSend, {
			text: `${CHRIS.label} `,
			mentionIds: [CHRIS.id],
			attachments: [],
		});
	},
};

export const MentionTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard("@");
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await mentionOption(ANNE),
		});
		await roleGone("listbox", { name: MENTIONS });

		await userEvent.click(sendButton(canvas));

		await sentOnce(args.onSend, {
			text: `${ANNE.label} `,
			mentionIds: [ANNE.id],
			attachments: [],
		});
	},
};

export const Attachments: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas, canvasElement }) => {
		const image = imageFile();
		const pdf = documentFile();
		await userEvent.upload(fileInput(canvasElement), [
			image,
			pdf,
		]);

		const grid = await attachments();
		const imageTile = canvas.getByRole("row", {
			name: image.name,
		});
		await waitFor(() =>
			expect(
				imageTile.querySelector("img"),
			).toHaveAttribute(
				"src",
				expect.stringMatching(/^data:image\/png;base64,/),
			),
		);
		await expect(
			canvas.getByRole("row", { name: pdf.name }),
		).toHaveTextContent("pdf");
		await expect(grid).toBeVisible();

		await userEvent.click(sendButton(canvas));

		await sentOnce(args.onSend, {
			text: "",
			mentionIds: [],
			attachments: [image, pdf],
		});
	},
};

export const BrokenImage: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		const broken = new File([DRAFT], IMAGE_NAME, {
			type: "image/png",
		});
		await userEvent.upload(
			fileInput(canvasElement),
			broken,
		);
		await attachments();

		const tile = canvas.getByRole("row", {
			name: broken.name,
		});
		await waitFor(() =>
			expect(tile.querySelector("img")).toBeNull(),
		);
		await expect(tile).toHaveTextContent("png");
	},
};

export const RemoveAttachmentKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		const pdf = documentFile();
		await userEvent.upload(fileInput(canvasElement), pdf);
		await attachments();

		await userEvent.tab();
		await expect(
			canvas.getByRole("row", { name: pdf.name }),
		).toHaveFocus();
		await userEvent.keyboard("{Delete}");

		await waitFor(() =>
			expect(
				canvas.queryByRole("grid", {
					name: ATTACHMENTS,
				}),
			).not.toBeInTheDocument(),
		);
		await expect(editor(canvas)).toHaveFocus();
	},
};

export const RemoveAttachmentMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		const pdf = documentFile();
		const image = imageFile();
		await userEvent.upload(fileInput(canvasElement), [
			pdf,
			image,
		]);
		await attachments();

		await userEvent.click(
			within(
				canvas.getByRole("row", { name: pdf.name }),
			).getByRole("button", {
				name: REMOVE,
			}),
		);

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: pdf.name }),
			).not.toBeInTheDocument(),
		);
		await expect(
			canvas.getByRole("row", { name: image.name }),
		).toBeVisible();
	},
};

export const RemoveAttachmentTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		const pdf = documentFile();
		await userEvent.upload(fileInput(canvasElement), pdf);
		await attachments();

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: REMOVE,
			}),
		});

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: pdf.name }),
			).not.toBeInTheDocument(),
		);
	},
};

export const OversizedAttachment: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		maxFileSize: MAX_FILE_SIZE,
		defaultValue: DRAFT,
	},
	play: async ({ canvas, canvasElement }) => {
		await userEvent.upload(
			fileInput(canvasElement),
			documentFile(MAX_FILE_SIZE * 2),
		);

		await expect(
			await canvas.findByRole("alert"),
		).toBeVisible();
		await expect(sendButton(canvas)).toBeDisabled();

		await userEvent.click(
			canvas.getByRole("button", {
				name: REMOVE,
			}),
		);

		await waitFor(() =>
			expect(
				canvas.queryByRole("alert"),
			).not.toBeInTheDocument(),
		);
		await expect(sendButton(canvas)).toBeEnabled();
	},
};

export const Handle: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposerWithHandle,
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(editor(canvas));
		await userEvent.keyboard(DRAFT);
		await userEvent.upload(
			fileInput(canvasElement),
			documentFile(),
		);
		await attachments();

		await userEvent.click(
			canvas.getByRole("button", {
				name: CLEAR_LABEL,
			}),
		);

		await waitFor(() =>
			expect(editor(canvas).textContent).toBe(""),
		);
		await expect(
			canvas.queryByRole("grid", {
				name: ATTACHMENTS,
			}),
		).not.toBeInTheDocument();
		await expect(sendButton(canvas)).toBeDisabled();

		await userEvent.click(
			canvas.getByRole("button", {
				name: FOCUS_LABEL,
			}),
		);
		await expect(editor(canvas)).toHaveFocus();
	},
};

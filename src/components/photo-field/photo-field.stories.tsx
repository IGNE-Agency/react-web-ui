import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import PhotoCameraIcon from "@material-design-icons/svg/outlined/photo_camera.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fireEvent,
	fn,
	spyOn,
	userEvent,
	waitFor,
} from "storybook/test";
import {
	fileInput,
	pickerOpens,
	pngFile,
} from "../../lib/storybook/files.ts";
import { Icon } from "../icon/index.ts";
import {
	PhotoField,
	type PhotoFieldProps,
} from "./photo-field.tsx";

const LABEL = "Profile photo";
const REMOVE = "Remove photo";
const PHOTO_SET = "Photo set";
const NO_PHOTO = "No photo";
const PREVIEW = "Preview";

const PORTRAIT = pngFile("portrait.png");

const STORED = <Icon svg={PersonIcon} label="" />;

const PlainPhotoField = (args: PhotoFieldProps) => (
	<PhotoField {...args} />
);

const ControlledPhotoField = (args: PhotoFieldProps) => {
	const [, updateArgs] = useArgs<PhotoFieldProps>();

	return (
		<PhotoField
			{...args}
			onValueChange={value => {
				void args.onValueChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
};

const StatefulPhotoField = (args: PhotoFieldProps) => {
	const [value, setValue] = useState(args.value);

	return (
		<PhotoField
			{...args}
			value={value}
			onValueChange={next => setValue(next)}
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
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{ component: "components/field" },
		],
	},
	component: PhotoField,
	render: ControlledPhotoField,
	args: {
		label: LABEL,
		optionalLabel: "optional",
		previewLabel: PREVIEW,
		photoSetLabel: PHOTO_SET,
		noPhotoLabel: NO_PHOTO,
		removeLabel: REMOVE,
		removeIcon: <Icon svg={CloseIcon} label="" />,
		icon: <Icon svg={PhotoCameraIcon} label="" />,
		accept: ["image/png", "image/jpeg"],
		value: undefined,
		onValueChange: fn(),
	},
} satisfies Meta<typeof PhotoField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Stored: Story = {
	args: { defaultPreview: STORED, hasStoredImage: true },
};

export const Picked: Story = {
	args: { value: PORTRAIT },
};

export const ReadOnly: Story = {
	args: {
		defaultPreview: STORED,
		hasStoredImage: true,
		readOnly: true,
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("img", { name: LABEL }),
		).toHaveAccessibleDescription(PHOTO_SET);
		await expect(
			canvas.queryByRole("button"),
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
	args: { errors: ["Add a photo of your face."] },
};

export const Pending: Story = {
	args: { value: PORTRAIT, pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "A square photo works best.",
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: PORTRAIT },
	render: PlainPhotoField,
	play: async ({ args, canvas, canvasElement }) => {
		const well = canvas.getByRole("button", {
			name: LABEL,
		});
		const picker = pickerOpens(canvasElement);

		await userEvent.tab();
		await expect(well).toHaveFocus();
		await expect(well).toHaveAccessibleDescription(
			PHOTO_SET,
		);
		await userEvent.keyboard("{Enter}");
		await expect(picker).toHaveBeenCalledOnce();

		await userEvent.keyboard("{Delete}");
		await expect(args.onValueChange).toHaveBeenCalledWith(
			undefined,
		);
		await expect(well).toHaveFocus();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainPhotoField,
	play: async ({ args, canvas, canvasElement }) => {
		const picker = pickerOpens(canvasElement);

		await userEvent.click(
			canvas.getByRole("button", { name: LABEL }),
		);
		await expect(picker).toHaveBeenCalledOnce();

		await userEvent.upload(
			fileInput(canvasElement),
			PORTRAIT,
		);
		await expect(args.onValueChange).toHaveBeenCalledWith(
			PORTRAIT,
		);
	},
};

export const MouseRemove: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: PORTRAIT },
	render: PlainPhotoField,
	play: async ({ args, canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: REMOVE }),
		);

		await expect(args.onValueChange).toHaveBeenCalledWith(
			undefined,
		);
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: LABEL }),
			).toHaveFocus(),
		);
	},
};

export const PreviewUrl: Story = {
	tags: ["!dev", "!autodocs"],
	render: StatefulPhotoField,
	play: async ({ canvas, canvasElement }) => {
		const created = spyOn(URL, "createObjectURL");
		const revoked = spyOn(URL, "revokeObjectURL");

		await userEvent.upload(
			fileInput(canvasElement),
			PORTRAIT,
		);
		const preview = await canvas.findByRole("img", {
			name: PREVIEW,
		});
		const url = preview.getAttribute("src");
		await expect(created).toHaveBeenCalledOnce();
		await expect(created).toHaveReturnedWith(url);

		const well = canvas.getByRole("button", {
			name: LABEL,
		});
		await fireEvent.dragOver(well);
		await expect(well).toHaveAttribute("data-dragover");
		await expect(created).toHaveBeenCalledOnce();
		await expect(revoked).not.toHaveBeenCalled();

		await userEvent.click(
			canvas.getByRole("button", { name: REMOVE }),
		);
		await waitFor(() =>
			expect(revoked).toHaveBeenCalledWith(url),
		);
		created.mockRestore();
		revoked.mockRestore();
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainPhotoField,
	play: async ({ args, canvas, canvasElement }) => {
		const picker = pickerOpens(canvasElement);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", { name: LABEL }),
		});
		await expect(picker).toHaveBeenCalledOnce();

		await userEvent.upload(
			fileInput(canvasElement),
			PORTRAIT,
		);
		await expect(args.onValueChange).toHaveBeenCalledWith(
			PORTRAIT,
		);
	},
};

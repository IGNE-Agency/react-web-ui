import EditIcon from "@material-design-icons/svg/outlined/edit.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import PhoneIcon from "@material-design-icons/svg/outlined/phone.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Button } from "../button/button.tsx";
import { DetailList } from "./detail-list.tsx";

const PHONE = "Phone number";
const PHONE_NUMBER = "+31 20 123 4567";
const EMAIL = "Email address";
const EMAIL_ADDRESS = "ada@example.com";
const CHANGE_PHONE = "Change phone number";

const changePhone = fn();

const ROWS = {
	terms: (
		<>
			<DetailList.Row term="Name">
				Ada Lovelace
			</DetailList.Row>
			<DetailList.Row term={PHONE}>
				{PHONE_NUMBER}
			</DetailList.Row>
			<DetailList.Row term={EMAIL}>
				{EMAIL_ADDRESS}
			</DetailList.Row>
		</>
	),
	icons: (
		<>
			<DetailList.IconRow svg={PhoneIcon} label={PHONE}>
				{PHONE_NUMBER}
			</DetailList.IconRow>
			<DetailList.IconRow svg={MailIcon} label={EMAIL}>
				{EMAIL_ADDRESS}
			</DetailList.IconRow>
		</>
	),
	action: (
		<>
			<DetailList.Row term="Name">
				Ada Lovelace
			</DetailList.Row>
			<DetailList.Row
				term={PHONE}
				action={
					<Button
						variant="tertiary"
						size="sm"
						iconOnly
						icon={EditIcon}
						label={CHANGE_PHONE}
						onClick={changePhone}
					/>
				}>
				{PHONE_NUMBER}
			</DetailList.Row>
		</>
	),
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
		],
	},
	component: DetailList.Root,
	args: {
		children: mappedArg(ROWS, "terms"),
	},
	argTypes: {
		children: {
			options: Object.keys(ROWS),
			mapping: ROWS,
			control: "radio",
		},
	},
} satisfies Meta<typeof DetailList.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Terms: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas
				.getAllByRole("term")
				.map(term => term.textContent),
		).toContain(PHONE);
		await expect(
			canvas
				.getAllByRole("definition")
				.map(definition => definition.textContent),
		).toContain(PHONE_NUMBER);
	},
};

export const IconTerms: Story = {
	args: { children: mappedArg(ROWS, "icons") },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("img", { name: PHONE }),
		).toBeVisible();
	},
};

export const WithAction: Story = {
	args: { children: mappedArg(ROWS, "action") },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: CHANGE_PHONE }),
		).toBeVisible();
	},
};

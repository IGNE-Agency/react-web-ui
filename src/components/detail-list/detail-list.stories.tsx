import EditIcon from "@material-design-icons/svg/outlined/edit.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import PhoneIcon from "@material-design-icons/svg/outlined/phone.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { IconButton } from "../button/button.tsx";
import { Icon } from "../icon/icon.tsx";
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
			<DetailList.Row>
				<DetailList.Term>Name</DetailList.Term>
				<DetailList.Detail>Ada Lovelace</DetailList.Detail>
			</DetailList.Row>
			<DetailList.Row>
				<DetailList.Term>{PHONE}</DetailList.Term>
				<DetailList.Detail>
					{PHONE_NUMBER}
				</DetailList.Detail>
			</DetailList.Row>
			<DetailList.Row>
				<DetailList.Term>{EMAIL}</DetailList.Term>
				<DetailList.Detail>
					{EMAIL_ADDRESS}
				</DetailList.Detail>
			</DetailList.Row>
		</>
	),
	icons: (
		<>
			<DetailList.IconRow>
				<DetailList.Term>
					<Icon svg={PhoneIcon} label={PHONE} />
				</DetailList.Term>
				<DetailList.Detail>
					{PHONE_NUMBER}
				</DetailList.Detail>
			</DetailList.IconRow>
			<DetailList.IconRow>
				<DetailList.Term>
					<Icon svg={MailIcon} label={EMAIL} />
				</DetailList.Term>
				<DetailList.Detail>
					{EMAIL_ADDRESS}
				</DetailList.Detail>
			</DetailList.IconRow>
		</>
	),
	action: (
		<>
			<DetailList.Row>
				<DetailList.Term>Name</DetailList.Term>
				<DetailList.Detail>Ada Lovelace</DetailList.Detail>
			</DetailList.Row>
			<DetailList.Row>
				<DetailList.Term>{PHONE}</DetailList.Term>
				<DetailList.Detail>
					{PHONE_NUMBER}
				</DetailList.Detail>
				<DetailList.Action>
					<IconButton
						variant="tertiary"
						size="sm"
						label={CHANGE_PHONE}
						onClick={changePhone}>
						<Icon svg={EditIcon} label="" />
					</IconButton>
				</DetailList.Action>
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

import { type ReactNode, useState } from "react";
import { userEvent } from "storybook/test";
import { Button } from "../../components/button/index.ts";

/** The name of the button `PendingToggle` renders. */
export const PENDING_TOGGLE_LABEL = "Validate";

/**
 * A field beside a button that starts and stops its wait, for a story to
 * time `pending` against.
 *
 * @example
 * <PendingToggle>{pending => <SwitchField {...args} pending={pending} />}</PendingToggle>
 */
export const PendingToggle = ({
	children,
}: Readonly<{
	children: (pending: boolean) => ReactNode;
}>): ReactNode => {
	const [pending, setPending] = useState(false);
	return (
		<>
			{children(pending)}
			<Button
				aria-pressed={pending}
				onClick={() => setPending(!pending)}>
				{PENDING_TOGGLE_LABEL}
			</Button>
		</>
	);
};

/**
 * Presses `toggle` and tells whether anything in `container` carried
 * `data-pending` in the very render that started the wait, read before any
 * timer can run.
 *
 * @example
 * await expect(await pendingOnPress(toggle, canvasElement)).toBe(false);
 */
export const pendingOnPress = async (
	toggle: HTMLElement,
	container: Element,
): Promise<boolean> => {
	const shown = new Promise<boolean>(resolve => {
		const observer = new MutationObserver(() => {
			observer.disconnect();
			resolve(
				container.querySelector("[data-pending]") !== null,
			);
		});
		observer.observe(toggle, {
			attributes: true,
			attributeFilter: ["aria-pressed"],
		});
	});
	await userEvent.click(toggle);
	return shown;
};

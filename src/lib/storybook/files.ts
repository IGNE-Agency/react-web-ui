import { fn } from "storybook/test";

const PIXEL_PNG =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaPhfDwAEhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * A one-pixel PNG named `name`, for a story that stages an image.
 *
 * @example
 * const SCAN = pngFile("referral-letter.png");
 */
export const pngFile = (name: string): File =>
	new File(
		[
			Uint8Array.from(atob(PIXEL_PNG), char =>
				char.charCodeAt(0),
			),
		],
		name,
		{ type: "image/png" },
	);

/**
 * A minimal PDF named `name`, for a story that stages a document.
 *
 * @example
 * const INVOICE = pdfFile("invoice-july.pdf");
 */
export const pdfFile = (name: string): File =>
	new File(["%PDF-1.4"], name, { type: "application/pdf" });

/**
 * The file input a story renders, which a play function uploads through.
 *
 * @example
 * await userEvent.upload(fileInput(canvasElement), INVOICE);
 */
export const fileInput = (
	canvasElement: HTMLElement,
): HTMLInputElement => {
	const input = canvasElement.querySelector(
		'input[type="file"]',
	);
	if (!(input instanceof HTMLInputElement)) {
		throw new Error("The story renders no file input.");
	}
	return input;
};

/**
 * A spy called when the story's file picker would open; the picker itself
 * stays shut.
 *
 * @example
 * const picker = pickerOpens(canvasElement);
 * await userEvent.keyboard("{Enter}");
 * await expect(picker).toHaveBeenCalledOnce();
 */
export const pickerOpens = (canvasElement: HTMLElement) => {
	const picker = fn();
	fileInput(canvasElement).addEventListener(
		"click",
		event => {
			event.preventDefault();
			picker();
		},
		{ once: true },
	);
	return picker;
};

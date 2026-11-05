import type { ReactNode } from "react";
import type { Tone, ToneVariant } from "../../lib/tone.ts";

/**
 * One chip in an {@link ActiveFilters} row. `onRemove` defaults to clearing the
 * whole field; `tone`/`variant` colour the chip.
 */
export type ActiveFilterDescriptor = Readonly<{
	content: ReactNode;
	/** A short plain-text label, required when `content` is not a string. */
	textValue?: string;
	tone?: Tone;
	variant?: ToneVariant;
	onRemove?: () => void;
}>;

/**
 * Per-field renderers for active-filter chips. Each receives the committed
 * value and returns one descriptor, or an array of them for one chip per value.
 */
export type ActiveFilterDescribers<TFilters> = Readonly<{
	[K in keyof TFilters]?: (
		value: NonNullable<TFilters[K]>,
	) =>
		| ActiveFilterDescriptor
		| readonly ActiveFilterDescriptor[];
}>;

/**
 * Builds a describer that renders one chip reading `Label: a, b, c` from a
 * multi-value filter. `render` maps one value to its display text.
 *
 * @example
 * // statuses?: DeclarationStatus[]
 * describeList({
 * 	label: "Status",
 * 	render: (status) => statusLabels[status](),
 * })
 */
export const describeList =
	<T>({
		label,
		render = String,
		tone,
	}: Readonly<{
		label: string;
		render?: (value: T) => string;
		tone?: Tone;
	}>) =>
	(values: ReadonlyArray<T>): ActiveFilterDescriptor => {
		const content = `${label}: ${values.map(render).join(", ")}`;
		return { content, textValue: content, tone };
	};

/**
 * Builds a describer for a single-value filter, rendering one chip reading
 * `Label: value`. `render` maps the value to its display text.
 *
 * @example
 * // rangeStartAt?: string (ISO)
 * describeValue({ label: "From", render: formatDate })
 */
export const describeValue =
	<T>({
		label,
		render = String,
		tone,
	}: Readonly<{
		label: string;
		render?: (value: T) => string;
		tone?: Tone;
	}>) =>
	(value: T): ActiveFilterDescriptor => {
		const content = `${label}: ${render(value)}`;
		return { content, textValue: content, tone };
	};

/**
 * Builds a describer for a boolean flag — one chip showing the label when the
 * flag is on.
 *
 * @example describeFlag("Archived")
 */
export const describeFlag =
	(label: string, tone?: Tone) =>
	(): ActiveFilterDescriptor => ({
		content: label,
		textValue: label,
		tone,
	});

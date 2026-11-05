/**
 * A status colour role, shared by every leaf that carries one.
 *
 * @example
 * const tone: Tone = "warning";
 */
export type Tone =
	| "neutral"
	| "info"
	| "success"
	| "warning"
	| "error";

/**
 * How a toned leaf fills: a tint, the tone's ink as a fill, or an outline.
 *
 * @example
 * <Badge tone="info" variant="solid">3</Badge>
 */
export type ToneVariant = "subtle" | "solid" | "outline";

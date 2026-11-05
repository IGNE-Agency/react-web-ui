import registerAPCACheck from "apca-check";
import axe from "axe-core";

const MUTED_ROLE = "--sys-color-text-muted";

const mutedColour = (node: Element) => {
	const probe = node.ownerDocument.createElement("span");
	probe.style.color = `var(${MUTED_ROLE})`;
	node.ownerDocument.body.append(probe);
	const colour = getComputedStyle(probe).color;
	probe.remove();
	return colour;
};

const isMuted = (node: Element) =>
	getComputedStyle(node).color === mutedColour(node);

const contentTextThreshold = (fontSize: string) =>
	Number.parseFloat(fontSize) >= 32 ? 45 : 60;

/**
 * Registers the APCA contrast rules: body text at bronze, and muted text at
 * APCA's minimum for content text that is not body text.
 *
 * @example
 * axe.reset = () => {
 * 	resetAxe();
 * 	registerContrastChecks();
 * };
 */
export const registerContrastChecks = () => {
	registerAPCACheck("bronze");
	registerAPCACheck("custom", contentTextThreshold);
	axe.configure({
		checks: [
			{
				id: "muted-text",
				evaluate: (node: Element) => isMuted(node),
				metadata: {
					impact: "serious",
					messages: {
						pass: "Muted text, held to the content-text minimum",
						fail: "Not muted text",
					},
				},
			},
			{
				id: "body-text",
				evaluate: (node: Element) => !isMuted(node),
				metadata: {
					impact: "serious",
					messages: {
						pass: "Body text, held to the body-text minimum",
						fail: "Not body text",
					},
				},
			},
		],
		rules: [
			{ id: "color-contrast", enabled: false },
			{
				id: "color-contrast-apca-bronze",
				all: [],
				any: [
					"muted-text",
					"color-contrast-apca-bronze-conformance",
				],
			},
			{
				id: "color-contrast-apca-custom",
				all: [],
				any: [
					"body-text",
					"color-contrast-apca-custom-conformance",
				],
			},
		],
	});
};

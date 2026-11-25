import { type RefObject, useEffect, useRef } from "react";

const WORD_JOINER = String.fromCodePoint(0x2060);
const RESET_DELAY_MS = 200;

const isIOS = (): boolean =>
	/iP(hone|ad|od)/.test(navigator.userAgent) ||
	(navigator.userAgent.includes("Macintosh") &&
		navigator.maxTouchPoints > 1);

const isProse = (
	root: HTMLElement,
	node: Node,
): boolean => {
	const control =
		node.parentElement?.closest("a, button") ?? null;
	return (
		Boolean(node.nodeValue) &&
		(control === null || !root.contains(control))
	);
};

const lastProseNode = (root: HTMLElement): Node | null => {
	const walker = root.ownerDocument.createTreeWalker(
		root,
		NodeFilter.SHOW_TEXT,
	);
	let last: Node | null = null;
	while (walker.nextNode()) {
		if (isProse(root, walker.currentNode)) {
			last = walker.currentNode;
		}
	}
	return last;
};

/**
 * A ref for a live region that mounts with its text already in it. While
 * `enabled`, it appends a word joiner to the region's last text outside a link
 * or button after mount, and takes it off 200 ms later, so a screen reader
 * hears a change and announces the region. A region that mounts empty is left
 * alone. Skipped on iOS.
 *
 * @example
 * const ref = useAnnounceOnMount<HTMLDivElement>(true);
 * return <div ref={ref} role="status">No invoices yet</div>;
 */
export const useAnnounceOnMount = <T extends HTMLElement>(
	enabled: boolean,
): RefObject<T | null> => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const root = ref.current;
		if (!enabled || root === null || isIOS()) {
			return undefined;
		}
		const text = lastProseNode(root);
		if (text === null) {
			return undefined;
		}
		const original = text.nodeValue;
		const marked = `${original ?? ""}${WORD_JOINER}`;
		const restore = () => {
			if (text.nodeValue === marked) {
				text.nodeValue = original;
			}
		};
		text.nodeValue = marked;
		const timer = setTimeout(restore, RESET_DELAY_MS);
		return () => {
			clearTimeout(timer);
			restore();
		};
	}, [enabled]);

	return ref;
};

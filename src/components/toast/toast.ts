import {
	Toast,
	type ToastManager,
} from "@base-ui/react/toast";
import type { ReactNode } from "react";
import type { Tone } from "../../lib/tone.ts";

/** A toast's status role; drives its colour. */
export type ToastTone = Exclude<Tone, "neutral">;

/** An action button rendered inside a toast, such as Retry on a failed send. */
export type ToastAction = Readonly<{
	/** Button label. */
	label: string;
	/** Invoked when the button is clicked. */
	onClick: () => void;
	/** Visual tier for the action button. @default "secondary" */
	variant?: "primary" | "secondary" | "tertiary";
}>;

/** The data every kit toast carries. */
export type ToastData = Readonly<{
	tone: ToastTone;
	/** A glyph before the title, such as one for the tone. */
	icon?: ReactNode;
	/** Heading above the body, where one line will not carry the news. */
	title?: ReactNode;
	body: ReactNode;
	actions?: ReadonlyArray<ToastAction>;
}>;

/** Options accepted by the push helpers. */
export type ToastOptions = Readonly<{
	/**
	 * Dedupe key. While a toast pushed with this key is still open, a second
	 * push with the same key replaces its content, tone and timeout in place and
	 * returns the existing id.
	 */
	key?: string;
	/**
	 * Heading above the body. Without it the body is the toast's own heading, for
	 * copy short enough to read at a glance.
	 */
	title?: ReactNode;
	/** A glyph before the title, such as one for the tone. Left out, none shows. */
	icon?: ReactNode;
	/** Action buttons rendered in the toast. */
	actions?: ReadonlyArray<ToastAction>;
	/**
	 * Auto-dismiss timeout in ms. `0` keeps the toast until dismissed. Defaults
	 * to 5000, or `0` when actions are present.
	 */
	timeout?: number;
}>;

/** The global toast manager, living outside React so non-component code can push. */
export const toastManager: ToastManager<ToastData> =
	Toast.createToastManager<ToastData>();

const DEFAULT_TIMEOUT_MS = 5000;

const activeKeys = new Map<string, string>();

let viewportReady = false;
const buffered: Array<() => void> = [];

/**
 * Releases the toasts pushed before the viewport subscribed to the manager.
 * Called once by `ToastProvider`, whose own effect runs after base-ui's
 * subscription; the manager drops anything emitted before that.
 *
 * @example
 * useEffect(flushBufferedToasts, []);
 */
export const flushBufferedToasts = (): void => {
	viewportReady = true;
	for (const send of buffered.splice(0)) {
		send();
	}
};

const emit = (send: () => void): void => {
	if (viewportReady) {
		send();
	} else {
		buffered.push(send);
	}
};

const push = (
	tone: ToastTone,
	body: ReactNode,
	options: ToastOptions = {},
): string => {
	const { key, title, icon, actions, timeout } = options;

	const resolvedTimeout =
		timeout ??
		(actions && actions.length > 0
			? 0
			: DEFAULT_TIMEOUT_MS);
	const content = {
		type: tone,
		timeout: resolvedTimeout,
		data: { tone, icon, title, body, actions },
	};

	const existing =
		key === undefined ? undefined : activeKeys.get(key);
	if (existing !== undefined) {
		emit(() => {
			toastManager.update(existing, content);
		});
		return existing;
	}

	const id = crypto.randomUUID();
	emit(() => {
		toastManager.add({
			...content,
			id,
			onClose:
				key !== undefined
					? () => {
							if (activeKeys.get(key) === id) {
								activeKeys.delete(key);
							}
						}
					: undefined,
		});
	});

	if (key !== undefined) {
		activeKeys.set(key, id);
	}
	return id;
};

/** The toast push helpers {@link toast} hands out. */
export type ToastHelpers = Readonly<{
	/** Pushes a success toast. Returns the toast id. */
	success: (
		body: ReactNode,
		options?: ToastOptions,
	) => string;
	/** Pushes an error toast. Returns the toast id. */
	error: (
		body: ReactNode,
		options?: ToastOptions,
	) => string;
	/** Pushes an info toast. Returns the toast id. */
	info: (body: ReactNode, options?: ToastOptions) => string;
	/** Pushes a warning toast. Returns the toast id. */
	warning: (
		body: ReactNode,
		options?: ToastOptions,
	) => string;
	/** Pushes a toast of a tone known only at runtime. Returns the toast id. */
	notify: (
		tone: ToastTone,
		body: ReactNode,
		options?: ToastOptions,
	) => string;
	/** Dismisses a toast by id. */
	dismiss: (id: string) => void;
}>;

/**
 * Pushes toasts from anywhere, components or not, into the viewport
 * `ToastProvider` renders. `key` dedupes: one failed item raises one toast,
 * and its latest push replaces that toast's content.
 *
 * @example
 * toast.error("The comment failed to send.", {
 * 	key: `outbox-${item.id}`,
 * 	actions: [{ label: "Retry", onClick: () => retry(item.id) }],
 * });
 */
export const toast: ToastHelpers = {
	success: (body, options) =>
		push("success", body, options),
	error: (body, options) => push("error", body, options),
	info: (body, options) => push("info", body, options),
	warning: (body, options) =>
		push("warning", body, options),
	notify: (tone, body, options) =>
		push(tone, body, options),
	dismiss: id => toastManager.close(id),
};

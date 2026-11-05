import { PreviewCard } from "@base-ui/react/preview-card";
import {
	AnchorMdx,
	DocsContext,
} from "@storybook/addon-docs/blocks";
import {
	type ComponentProps,
	Suspense,
	use,
	useContext,
	useEffect,
	useState,
} from "react";
import { NAVIGATE_URL } from "storybook/internal/core-events";
import { useBusyPhase } from "../../src/lib/hooks/use-busy-phase.ts";
import mdxStyles from "../mdx-components.module.scss";
import {
	type DocsEntry,
	docsEntries,
	groupOf,
	nameOf,
	previewStoryOf,
} from "./docs-index.ts";
import { edgeColourOf } from "./edge-colour.ts";
import { Skeleton } from "../../src/components/skeleton/index.ts";
import { Spinner } from "../../src/components/spinner/index.ts";
import { previewOf } from "./page-previews.ts";
import type {
	PagePreview,
	PreviewRun,
} from "./preview-types.ts";
import {
	docsTargetOf,
	isPlainClick,
	storybookHrefOf,
} from "./target.ts";
import styles from "./preview-link.module.scss";

const loaded = new Set<string>();

const loadDrawing = async (
	entry: DocsEntry,
	preload: () => Promise<unknown>,
) => {
	await preload();
	loaded.add(entry.importPath);
};

const preload = (id: string) => {
	void docsEntries().then(entries => {
		const entry = entries.find(page => page.id === id);
		const drawing =
			entry === undefined
				? undefined
				: previewOf(entry)?.drawing;
		return entry === undefined || drawing === undefined
			? undefined
			: loadDrawing(entry, drawing.preload);
	});
};

const pageHrefOf = (href: string) => {
	const id = new URLSearchParams(
		window.location.search,
	).get("id");
	return href.startsWith("#") && id !== null
		? `?path=/docs/${id}${href}`
		: href;
};

const Runs = ({
	runs,
}: Readonly<{ runs: readonly PreviewRun[] }>) =>
	runs.map((run, index) =>
		run.code ? (
			<code key={index} className={mdxStyles.inline}>
				{run.text}
			</code>
		) : (
			run.text
		),
	);

const Arrow = ({
	drawing,
	field,
	art,
}: Readonly<{
	drawing: boolean;
	field?: string | undefined;
	art?: SVGSVGElement | undefined;
}>) => {
	const [edge, setEdge] = useState<string>();
	return (
		<PreviewCard.Arrow
			ref={node => {
				if (node === null || art === undefined) {
					return undefined;
				}
				const sample = () =>
					setEdge(edgeColourOf(art, node));
				sample();
				const observer = new MutationObserver(sample);
				observer.observe(node, {
					attributes: true,
					attributeFilter: ["style", "data-side"],
				});
				return () => observer.disconnect();
			}}
			className={styles.arrow}
			data-drawing={drawing ? "" : undefined}
			style={{ "--preview-field": edge ?? field }}>
			<svg
				width="16"
				height="8"
				viewBox="0 0 16 8"
				overflow="visible">
				<path
					className={styles.arrowFill}
					d="M0 9 V8 L8 0 L16 8 V9 Z"
				/>
			</svg>
		</PreviewCard.Arrow>
	);
};

const Loader = () =>
	useBusyPhase({ busy: true }) === "fresh" ? null : (
		<Spinner className={styles.loader} />
	);

const PreviewDrawing = ({
	entry,
	drawing,
	onArt,
}: Readonly<{
	entry: DocsEntry;
	drawing: NonNullable<PagePreview["drawing"]>;
	onArt: (art: SVGSVGElement) => void;
}>) => {
	const [ready, setReady] = useState(() =>
		loaded.has(entry.importPath),
	);
	const [late] = useState(!ready);
	const phase = useBusyPhase({ busy: !ready });

	useEffect(() => {
		let live = true;
		const load = async () => {
			await loadDrawing(entry, drawing.preload);
			if (live) {
				setReady(true);
			}
		};
		void load();
		return () => {
			live = false;
		};
	}, [entry, drawing]);

	return (
		<div
			className={styles.drawing}
			data-late={late ? "" : undefined}
			aria-hidden>
			{phase === "fresh" ? null : (
				<Spinner className={styles.loader} />
			)}
			{ready && phase === "fresh" ? (
				<Suspense fallback={null}>
					<drawing.Component />
					<span
						hidden
						ref={node => {
							const art = node?.previousElementSibling;
							if (art instanceof SVGSVGElement) {
								onArt(art);
							}
						}}
					/>
				</Suspense>
			) : null}
		</div>
	);
};

const themeOfDocument = () =>
	document.documentElement.dataset["theme"] === "dark"
		? "dark"
		: "light";

const PreviewStory = ({
	story,
}: Readonly<{ story: string }>) => {
	const [ready, setReady] = useState(false);
	const phase = useBusyPhase({ busy: !ready });
	const shown = ready && phase === "fresh";

	return (
		<div
			className={`${styles.drawing} ${styles.story}`}
			aria-hidden>
			{shown ? null : <Loader />}
			<iframe
				className={styles.frame}
				src={`./iframe.html?id=${story}&viewMode=story&globals=theme:${themeOfDocument()}`}
				// oxlint-disable-next-line react/iframe-missing-sandbox -- Storybook's own story iframe, which needs its scripts and its origin.
				sandbox="allow-scripts allow-same-origin"
				inert
				tabIndex={-1}
				title=""
				data-shown={shown ? "" : undefined}
				onLoad={() => setReady(true)}
			/>
		</div>
	);
};

const Placeholder = () => (
	<>
		<Arrow drawing />
		<div className={styles.drawing} aria-hidden>
			<Loader />
		</div>
		<div className={styles.body}>
			<Skeleton className={styles.kickerSkeleton} />
			<Skeleton className={styles.titleSkeleton} />
			<span className={styles.leadSkeleton}>
				<Skeleton />
				<Skeleton />
				<Skeleton className={styles.lastLine} />
			</span>
		</div>
	</>
);

const Preview = ({
	id,
	anchor,
}: Readonly<{ id: string; anchor?: string }>) => {
	const [art, setArt] = useState<SVGSVGElement>();
	const entry = use(docsEntries()).find(
		page => page.id === id,
	);
	if (entry === undefined) {
		return null;
	}
	const page = previewOf(entry);
	const story =
		page?.drawing === undefined
			? use(previewStoryOf(entry))
			: undefined;
	const section =
		anchor === undefined
			? undefined
			: page?.sections[anchor];
	const lead = section?.lead ?? page?.lead ?? [];

	return (
		<>
			{page?.drawing === undefined ? (
				story === undefined ? (
					<Arrow drawing={false} />
				) : (
					<>
						<Arrow drawing field="var(--sys-color-bg)" />
						<PreviewStory story={story} />
					</>
				)
			) : (
				<>
					<Arrow drawing art={art} />
					<PreviewDrawing
						entry={entry}
						drawing={page.drawing}
						onArt={setArt}
					/>
				</>
			)}
			<div className={styles.body}>
				{section?.number === undefined ? null : (
					<span className={styles.numeral} aria-hidden>
						{String(section.number).padStart(2, "0")}
					</span>
				)}
				<span className={styles.kicker}>
					{section === undefined
						? groupOf(entry)
						: nameOf(entry)}
				</span>
				<span className={styles.title}>
					{section?.title ?? page?.title ?? nameOf(entry)}
				</span>
				{lead.length === 0 ? null : (
					<p className={styles.lead}>
						<Runs runs={lead} />
					</p>
				)}
			</div>
		</>
	);
};

/**
 * A link in a docs page. A link to a docs page or one of its sections opens a
 * card on hover with the page's opening drawing and the heading and first
 * lines of what it points at; any other link renders as Storybook's own.
 *
 * @example
 * const mdxComponents = { a: PreviewLink };
 */
export const PreviewLink = ({
	href,
	children,
	...props
}: ComponentProps<"a">) => {
	const { channel } = useContext(DocsContext);
	const page =
		href === undefined ? undefined : pageHrefOf(href);
	const target =
		page === undefined ? undefined : docsTargetOf(page);

	if (page === undefined || target === undefined) {
		return (
			<AnchorMdx
				href={href ?? ""}
				target={props.target ?? "_self"}
				{...props}>
				{children}
			</AnchorMdx>
		);
	}

	return (
		<PreviewCard.Root>
			<PreviewCard.Trigger
				href={storybookHrefOf(page)}
				onPointerEnter={() => preload(target.to)}
				onFocus={() => preload(target.to)}
				onClick={event => {
					if (!isPlainClick(event)) {
						return;
					}
					event.preventDefault();
					channel.emit(NAVIGATE_URL, page);
				}}>
				{children}
			</PreviewCard.Trigger>
			<PreviewCard.Portal>
				<PreviewCard.Positioner
					className={styles.positioner}
					sideOffset={8}
					collisionPadding={16}
					collisionAvoidance={{ fallbackAxisSide: "none" }}>
					<PreviewCard.Popup className={styles.card}>
						<Suspense fallback={<Placeholder />}>
							<Preview
								id={target.to}
								anchor={target.anchor}
							/>
						</Suspense>
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		</PreviewCard.Root>
	);
};

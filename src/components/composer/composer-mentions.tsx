import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	type MenuRenderFn,
	MenuOption,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
	$createTextNode,
	$insertNodes,
	type TextNode,
} from "lexical";
import {
	type ReactNode,
	useEffect,
	useEffectEvent,
	useId,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useComposerContext } from "./composer.context.ts";
import style from "./composer-editor.module.scss";
import { $createMentionNode } from "./mention-node.tsx";
import type {
	MentionCandidate,
	MentionSource,
} from "./mention-sources.ts";

const QUERY_DEBOUNCE_MS = 200;

class MentionTypeaheadOption extends MenuOption {
	readonly candidate: MentionCandidate;

	constructor(candidate: MentionCandidate) {
		super(candidate.id);
		this.candidate = candidate;
	}
}

type MentionMenuProps = Readonly<{
	label: string;
	listbox: HTMLElement;
	idPrefix: string;
	options: readonly MentionTypeaheadOption[];
	selectedIndex: number | null;
	onHighlight: (index: number) => void;
	onSelect: (option: MentionTypeaheadOption) => void;
}>;

const MentionMenu = ({
	label,
	listbox,
	idPrefix,
	options,
	selectedIndex,
	onHighlight,
	onSelect,
}: MentionMenuProps): ReactNode => {
	const { setMentionMenuOpen, setMentionsActiveOption } =
		useComposerContext();
	const labelId = `${idPrefix}-label`;
	const optionId = (index: number): string =>
		`${idPrefix}-${index}`;
	const activeOptionId =
		selectedIndex === null ? null : optionId(selectedIndex);

	useEffect(() => {
		listbox.setAttribute("aria-labelledby", labelId);
		return () => listbox.removeAttribute("aria-labelledby");
	}, [listbox, labelId]);

	useEffect(() => {
		setMentionMenuOpen(true);
		return () => setMentionMenuOpen(false);
	}, [setMentionMenuOpen]);

	useEffect(() => {
		setMentionsActiveOption(activeOptionId);
		return () => setMentionsActiveOption(null);
	}, [setMentionsActiveOption, activeOptionId]);

	return (
		<>
			<ul role="presentation" className={style.menu}>
				{options.map((option, index) => (
					<li
						key={option.key}
						id={optionId(index)}
						ref={element => {
							option.setRefElement(element);
						}}
						role="option"
						aria-selected={index === selectedIndex}
						className={style.menuItem}
						data-highlighted={
							index === selectedIndex ? "" : undefined
						}
						onMouseEnter={() => onHighlight(index)}
						onMouseDown={event => event.preventDefault()}
						onClick={() => {
							onHighlight(index);
							onSelect(option);
						}}>
						{option.candidate.row}
					</li>
				))}
			</ul>
			<span id={labelId} hidden>
				{label}
			</span>
		</>
	);
};

export type ComposerMentionsProps = Readonly<{
	/** The typeahead list's accessible name, such as "People to mention". */
	label: string;
	/** Where the candidates for a query come from. */
	sources: readonly MentionSource[];
}>;

/** An `@` typeahead inside `Composer.Editor` that inserts mentions from `sources`. */
export const ComposerMentions = ({
	label,
	sources,
}: ComposerMentionsProps): ReactNode => {
	const [editor] = useLexicalComposerContext();
	const { registerMentions } = useComposerContext();
	const listboxId = useId();
	const [query, setQuery] = useState<string | null>(null);
	const [options, setOptions] = useState<
		MentionTypeaheadOption[]
	>([]);
	const resolveCandidates = useEffectEvent(
		(search: string) =>
			Promise.all(
				sources.map(source => source.resolve(search)),
			),
	);

	const triggerFn = useBasicTypeaheadTriggerMatch("@", {
		minLength: 0,
	});

	useEffect(() => {
		registerMentions(listboxId);
		return () => registerMentions(null);
	}, [registerMentions, listboxId]);

	useEffect(() => {
		if (query === null) {
			return undefined;
		}
		let active = true;
		const load = async (): Promise<void> => {
			try {
				const results = await resolveCandidates(query);
				if (active) {
					setOptions(
						results
							.flat()
							.map(
								candidate =>
									new MentionTypeaheadOption(candidate),
							),
					);
				}
			} catch {
				if (active) {
					setOptions([]);
				}
			}
		};
		const timer = setTimeout(() => {
			void load();
		}, QUERY_DEBOUNCE_MS);
		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [query]);

	const onSelectOption = (
		selectedOption: MentionTypeaheadOption,
		nodeToReplace: TextNode | null,
		closeMenu: () => void,
	): void => {
		editor.update(() => {
			const mentionNode = $createMentionNode(
				selectedOption.candidate.label,
				selectedOption.candidate.id,
			);
			if (nodeToReplace === null) {
				$insertNodes([mentionNode]);
			} else {
				nodeToReplace.replace(mentionNode);
			}
			const space = $createTextNode(" ");
			mentionNode.insertAfter(space);
			space.select();
			closeMenu();
		});
	};

	const menuRenderFn: MenuRenderFn<
		MentionTypeaheadOption
	> = (
		anchorElementRef,
		{
			selectedIndex,
			selectOptionAndCleanUp,
			setHighlightedIndex,
		},
	) => {
		const listbox = anchorElementRef.current;
		if (listbox === null || options.length === 0) {
			return null;
		}
		return createPortal(
			<MentionMenu
				label={label}
				listbox={listbox}
				idPrefix={listboxId}
				options={options}
				selectedIndex={selectedIndex}
				onHighlight={setHighlightedIndex}
				onSelect={selectOptionAndCleanUp}
			/>,
			listbox,
		);
	};

	return (
		<LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
			onQueryChange={next => {
				setQuery(next);
				if (next === null) {
					setOptions([]);
				}
			}}
			onSelectOption={onSelectOption}
			options={options}
			triggerFn={triggerFn}
			menuRenderFn={menuRenderFn}
		/>
	);
};

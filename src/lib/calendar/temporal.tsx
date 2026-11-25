import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ComponentPropsWithRef,
	type Context,
	createContext,
	type ReactNode,
	useContext,
} from "react";
import {
	Button as AriaButton,
	DateInput as AriaDateInput,
	DateSegment as AriaDateSegment,
	Dialog as AriaDialog,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
	Popover as AriaPopover,
} from "react-aria-components";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	useFieldState,
} from "../../components/field/index.ts";
import {
	FieldWiringContext,
	useFieldWiring,
} from "../../components/field/field-wiring.tsx";
import {
	InputPartsContext,
	useInputPartsContext,
} from "../../components/field/input-parts.tsx";
import { focusControlOnRim } from "../../components/field/rim-focus.ts";
import { withFieldFocus } from "../../components/field/use-field-focus.ts";
import { usePopupEdgePadding } from "../popup-edge-padding.ts";
import style from "./temporal.module.scss";

export type TemporalStateProps = Readonly<{
	/** States the root does not own, projected over its own onto the element. */
	state?: FieldState;
}>;

/** The react-aria picker props a date or time root owns, so its own props leave them out. */
export type TemporalOwnedProps =
	| "value"
	| "defaultValue"
	| "onChange"
	| "onBlur"
	| "minValue"
	| "maxValue"
	| "name"
	| "startName"
	| "endName"
	| "isDisabled"
	| "isReadOnly"
	| "isRequired"
	| "isInvalid"
	| "validationBehavior"
	| "aria-labelledby"
	| "aria-describedby"
	| "className"
	| "style"
	| "children";

/** The props every date or time root takes beside the react-aria picker's own. */
export type TemporalRootBaseProps = Omit<
	FieldProps,
	"label" | "description"
> &
	Readonly<{
		/** Called once focus has left the control. */
		onBlur?: FieldBlurHandler;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Shows the value without letting it be changed. */
		readOnly?: boolean;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		/** Applied to the field frame, so callers can size the control. */
		className?: string;
		/** The field's parts. */
		children?: ReactNode;
	}>;

/** The props a date or time root wires onto the react-aria picker it renders. */
export type TemporalPickerProps = Readonly<{
	"aria-labelledby": string;
	"aria-describedby": string | undefined;
	isDisabled: boolean;
	isReadOnly: boolean | undefined;
	isRequired: boolean;
	isInvalid: boolean;
	validationBehavior: "aria";
	className: string | undefined;
	/** Marks the picker's wrapper, whose parts a field group's row places. */
	"data-field-contents": "";
}>;

export type TemporalFrameProps = Omit<
	TemporalRootBaseProps,
	"onBlur" | "children"
> &
	Readonly<{
		/** The control holds a value. */
		filled: boolean;
		/** Renders the react-aria picker, given the props that wire it to the field and a stable name for it. */
		render: (
			picker: TemporalPickerProps,
			controlId: string,
		) => ReactNode;
	}>;

/**
 * The field frame a date or time root draws: it reads the field's state, hands
 * it with the ids to every part, and wires the picker it renders to them.
 *
 * @example
 * <TemporalFrame filled={day !== null} render={picker => <AriaDatePicker {...picker}>…</AriaDatePicker>} />
 */
export const TemporalFrame = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending = false,
	disabled,
	readOnly,
	filled,
	state,
	className,
	render,
}: TemporalFrameProps): ReactNode => {
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled,
		state,
	});
	const wiring = useFieldWiring(field.invalid);

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<FieldWiringContext value={wiring}>
				<Field.Root
					disabled={field.disabled}
					invalid={field.invalid}
					requiredness={field.state.requiredness}
					dirty={dirty}
					touched={touched}
					phase={field.phase}
					className={className}
					{...fieldStateAttributes(field.state)}>
					{render(
						{
							"aria-labelledby": wiring.ids.labelId,
							"aria-describedby": wiring.describedBy,
							isDisabled: field.state.disabled === true,
							isReadOnly: field.state.readonly,
							isRequired:
								field.state.requiredness === "required",
							isInvalid: field.state.validity === "invalid",
							validationBehavior: "aria",
							className: style.picker,
							"data-field-contents": "",
						},
						wiring.ids.controlId,
					)}
				</Field.Root>
			</FieldWiringContext>
		</InputPartsContext>
	);
};

/** Whether focus is anywhere in the picker, its popover included, for the group to stay warm. */
export const TemporalFocusContext: Context<boolean> =
	createContext(false);

export type TemporalGroupProps = Omit<
	AriaGroupProps,
	"children"
> &
	TemporalStateProps &
	Readonly<{ children?: ReactNode }>;

/**
 * The shell carrying the border, the ring and the inlay row, projecting its
 * root's state onto itself.
 *
 * @example
 * <DateInput.Group><DateInput.Input>…</DateInput.Input></DateInput.Group>
 */
export const TemporalGroup = ({
	state: ownState,
	className,
	children,
	...props
}: TemporalGroupProps): ReactNode => {
	const root = useInputPartsContext();
	const pickerFocused = useContext(TemporalFocusContext);
	const focus = useFieldFocus(props);
	const state = { ...root.state, ...ownState };
	return (
		<AriaGroup
			className={clsx(style.group, className)}
			onMouseDown={focusControlOnRim}
			isReadOnly={state.readonly}
			{...fieldStateAttributes(
				withFieldFocus(
					{
						...state,
						focused:
							state.focused === true || pickerFocused,
					},
					focus,
				),
			)}
			{...props}
			{...focus.props}>
			{children}
		</AriaGroup>
	);
};

export type TemporalSegmentProps = Omit<
	ComponentProps<typeof AriaDateSegment>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * One editable unit of a date or time, which an `Input` renders per segment.
 *
 * @example
 * <DateInput.Input>{segment => <DateInput.Segment segment={segment} />}</DateInput.Input>
 */
export const TemporalSegment = ({
	className,
	...props
}: TemporalSegmentProps): ReactNode => (
	<AriaDateSegment
		className={clsx(style.segment, className)}
		{...props}
	/>
);

export type TemporalInputProps = Omit<
	ComponentProps<typeof AriaDateInput>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The segments of one date or time, bare inside a `Group`. Its children render
 * each segment.
 *
 * @example
 * <DateInput.Input>{segment => <DateInput.Segment segment={segment} />}</DateInput.Input>
 */
export const TemporalInput = ({
	className,
	...props
}: TemporalInputProps): ReactNode => (
	<AriaDateInput
		className={clsx(style.input, className)}
		{...props}
	/>
);

export type TemporalRangeInputProps = Omit<
	TemporalInputProps,
	"slot"
> &
	Readonly<{
		/** The end of the range the segments edit. */
		slot: "start" | "end";
	}>;

/**
 * The segments of one end of a date range, sized to its content.
 *
 * @example
 * <DateRangeInput.Input slot="start">{segment => <DateRangeInput.Segment segment={segment} />}</DateRangeInput.Input>
 */
export const TemporalRangeInput = ({
	className,
	...props
}: TemporalRangeInputProps): ReactNode => (
	<AriaDateInput
		className={clsx(style.rangeInput, className)}
		{...props}
	/>
);

export type TemporalRangeSeparatorProps =
	useRender.ComponentProps<"span">;

/**
 * The mark between a range's start and end, such as a dash. Decoration only.
 *
 * @example
 * <DateRangeInput.Separator>–</DateRangeInput.Separator>
 */
export const TemporalRangeSeparator = ({
	render,
	className,
	ref,
	...props
}: TemporalRangeSeparatorProps): ReactNode =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.rangeSeparator, className),
		},
	});

export type TemporalRangeSpacerProps =
	useRender.ComponentProps<"span">;

/**
 * The space that pushes a range's inlays to the end of its group.
 *
 * @example
 * <DateRangeInput.Spacer />
 */
export const TemporalRangeSpacer = ({
	render,
	className,
	ref,
	...props
}: TemporalRangeSpacerProps): ReactNode =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.rangeSpacer, className),
		},
	});

export type TemporalButtonProps = Omit<
	ComponentPropsWithRef<"button">,
	"type" | "children"
> &
	Readonly<{
		/** The button to render, a kit `Button` or `IconButton`, which renders react-aria's button underneath. */
		render: useRender.RenderProp;
	}>;

/**
 * The button that opens the calendar. It renders whichever button it is given.
 *
 * @example
 * <DateInput.Trigger
 * 	ref={triggerRef}
 * 	render={
 * 		<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 			<CalendarTodayIcon />
 * 		</IconButton>
 * 	}
 * />
 */
export const TemporalTrigger = ({
	render,
	className,
	ref,
	...props
}: TemporalButtonProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			className: clsx(style.trigger, className),
			render: <AriaButton />,
		},
	});

export type TemporalPopoverProps = Omit<
	ComponentProps<typeof AriaPopover>,
	"className" | "ref"
> &
	Readonly<{ className?: string }>;

/**
 * The floating surface the calendar lands on, aligned to whatever `triggerRef`
 * names: the calendar button, rather than the whole field. It keeps clear of the
 * viewport's edges.
 *
 * @example
 * <DateInput.Popover triggerRef={triggerRef}><DateInput.Dialog>…</DateInput.Dialog></DateInput.Popover>
 */
export const TemporalPopover = ({
	className,
	placement = "bottom end",
	...props
}: TemporalPopoverProps): ReactNode => {
	const { ref, collisionPadding } = usePopupEdgePadding();

	return (
		<AriaPopover
			ref={ref}
			containerPadding={collisionPadding}
			className={clsx(style.popover, className)}
			placement={placement}
			{...props}
		/>
	);
};

export type TemporalDialogProps = Omit<
	ComponentProps<typeof AriaDialog>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The dialog inside the popover, which holds the calendar and its focus.
 *
 * @example
 * <DateInput.Dialog><DateInput.Calendar>…</DateInput.Calendar></DateInput.Dialog>
 */
export const TemporalDialog = ({
	className,
	...props
}: TemporalDialogProps): ReactNode => (
	<AriaDialog
		className={clsx(style.dialog, className)}
		{...props}
	/>
);

export type TemporalPopupProps = Omit<
	TemporalPopoverProps,
	"children"
> &
	Readonly<{
		/** The calendar the dialog holds. */
		children: TemporalDialogProps["children"];
	}>;

/**
 * The `Popover` with its `Dialog`, in one part.
 *
 * @example
 * <DateInput.Popup triggerRef={triggerRef}><DateInput.Calendar>…</DateInput.Calendar></DateInput.Popup>
 */
export const TemporalPopup = ({
	children,
	...props
}: TemporalPopupProps): ReactNode => (
	<TemporalPopover {...props}>
		<TemporalDialog>{children}</TemporalDialog>
	</TemporalPopover>
);

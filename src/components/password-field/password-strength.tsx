import { Meter } from "@base-ui/react/meter";
import { useRender } from "@base-ui/react/use-render";
import type { Score } from "@zxcvbn-ts/core";
import { clsx } from "clsx";
import {
	type Context,
	createContext,
	type ReactElement,
	type ReactNode,
} from "react";
import {
	type PasswordStrengthResult,
	usePasswordStrength,
	type ZxcvbnLanguages,
} from "../../lib/password-strength/password-strength.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { useLocale } from "../locale-provider/index.ts";
import style from "./password-field.module.scss";

/** The name of each strength band, from 0 (weakest) to 4 (strongest). */
export type PasswordScoreLabels = Readonly<
	Record<Score, string>
>;

const MAX_SCORE = 4;

const StrengthContext: Context<PasswordStrengthResult | null> =
	createContext<PasswordStrengthResult | null>(null);

const useStrength = (): PasswordStrengthResult =>
	useRequiredContext(
		StrengthContext,
		"PasswordStrength parts must be rendered within <PasswordStrength.Root>.",
	);

const BandContext: Context<string | null> = createContext<
	string | null
>(null);

const useBand = (): string =>
	useRequiredContext(
		BandContext,
		"PasswordStrength.Value must be rendered within <PasswordStrength.Meter>.",
	);

export type PasswordStrengthRootProps =
	useRender.ComponentProps<"div"> &
		Readonly<{
			password: string;
			/**
			 * zxcvbn language packs beside the kit's English and Dutch ones, by lowercase
			 * language tag: `{ de: () => import("@zxcvbn-ts/language-de") }`.
			 */
			languages?: ZxcvbnLanguages;
		}>;

/**
 * Judges `password` with zxcvbn in the locale's language and hands the result
 * to the parts inside it. It suspends while that language's dictionaries load,
 * and renders nothing for an empty password.
 *
 * @example
 * <PasswordStrength.Root password={password}>…</PasswordStrength.Root>
 */
const Root = ({
	password,
	languages,
	className,
	render,
	ref,
	...props
}: PasswordStrengthRootProps): ReactNode => {
	const strength = usePasswordStrength(
		password,
		useLocale(),
		languages,
	);
	const element = useRender({
		render,
		ref,
		enabled: strength !== null,
		props: {
			...props,
			className: clsx(style.strength, className),
		},
	});
	return strength === null ? null : (
		<StrengthContext value={strength}>
			{element}
		</StrengthContext>
	);
};

export type PasswordStrengthMeterProps = Omit<
	Meter.Root.Props,
	"value" | "max" | "getAriaValueText"
> &
	Readonly<{
		/** The name of each band, such as "Very weak" for 0. */
		scoreLabels: PasswordScoreLabels;
	}>;

/**
 * The strength band as a meter, read as the band's name. It sets `data-score`,
 * which the `Value` and `Indicator` inside it colour by.
 *
 * @example
 * <PasswordStrength.Meter scoreLabels={SCORE_LABELS}>…</PasswordStrength.Meter>
 */
const StrengthMeter = ({
	scoreLabels,
	className,
	...props
}: PasswordStrengthMeterProps): ReactNode => {
	const { score } = useStrength();
	const band = scoreLabels[score];
	return (
		<BandContext value={band}>
			<Meter.Root
				value={score}
				max={MAX_SCORE}
				data-score={score}
				getAriaValueText={() => band}
				className={clsx(style.meter, className)}
				{...props}
			/>
		</BandContext>
	);
};

/**
 * The meter's label, such as "Password strength".
 *
 * @example
 * <PasswordStrength.Label>Password strength</PasswordStrength.Label>
 */
const Label = ({
	className,
	...props
}: Meter.Label.Props): ReactNode => (
	<Meter.Label
		className={clsx(style.meterLabel, className)}
		{...props}
	/>
);

export type PasswordStrengthValueProps = Omit<
	Meter.Value.Props,
	"children"
>;

/**
 * The band's name, such as "Fair", from the meter's `scoreLabels`.
 *
 * @example
 * <PasswordStrength.Value />
 */
const Value = ({
	className,
	...props
}: PasswordStrengthValueProps): ReactNode => {
	const band = useBand();
	return (
		<Meter.Value
			className={clsx(style.meterValue, className)}
			{...props}>
			{() => band}
		</Meter.Value>
	);
};

/**
 * The bar the indicator fills.
 *
 * @example
 * <PasswordStrength.Track><PasswordStrength.Indicator /></PasswordStrength.Track>
 */
const Track = ({
	className,
	...props
}: Meter.Track.Props): ReactNode => (
	<Meter.Track
		className={clsx(style.meterTrack, className)}
		{...props}
	/>
);

/**
 * The fill of the track, as far as the band reaches and in its colour.
 *
 * @example
 * <PasswordStrength.Indicator />
 */
const Indicator = ({
	className,
	...props
}: Meter.Indicator.Props): ReactNode => (
	<Meter.Indicator
		className={clsx(style.meterIndicator, className)}
		{...props}
	/>
);

export type PasswordStrengthFeedbackProps = Omit<
	useRender.ComponentProps<"p">,
	"children"
>;

/**
 * zxcvbn's own warning, in the locale's language. Renders nothing without one.
 *
 * @example
 * <PasswordStrength.Feedback />
 */
const Feedback = ({
	className,
	render,
	ref,
	...props
}: PasswordStrengthFeedbackProps): ReactElement | null => {
	const { warning } = useStrength();
	return useRender({
		defaultTagName: "p",
		render,
		ref,
		enabled: warning !== "",
		props: {
			...props,
			className: clsx(style.feedback, className),
			children: warning,
		},
	});
};

export type PasswordStrengthSuggestionsProps = Omit<
	useRender.ComponentProps<"ul">,
	"children"
> &
	Readonly<{
		/** Renders one of zxcvbn's suggestions, such as a `Suggestion`. */
		children: (suggestion: string) => ReactNode;
	}>;

/**
 * zxcvbn's own suggestions, in the locale's language, as a list. Renders
 * nothing without any.
 *
 * @example
 * <PasswordStrength.Suggestions>
 * 	{suggestion => <PasswordStrength.Suggestion key={suggestion}>{suggestion}</PasswordStrength.Suggestion>}
 * </PasswordStrength.Suggestions>
 */
const Suggestions = ({
	className,
	render,
	ref,
	children,
	...props
}: PasswordStrengthSuggestionsProps): ReactElement | null => {
	const { suggestions } = useStrength();
	return useRender({
		defaultTagName: "ul",
		render,
		ref,
		enabled: suggestions.length > 0,
		props: {
			...props,
			className: clsx(style.suggestions, className),
			children: suggestions.map(children),
		},
	});
};

/**
 * One of zxcvbn's suggestions.
 *
 * @example
 * <PasswordStrength.Suggestion>{suggestion}</PasswordStrength.Suggestion>
 */
const Suggestion = ({
	className,
	render,
	ref,
	...props
}: useRender.ComponentProps<"li">): ReactElement =>
	useRender({
		defaultTagName: "li",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.feedback, className),
		},
	});

export type PasswordStrengthProps = Readonly<{
	password: string;
	/** The meter's label, such as "Password strength". */
	label: string;
	/** The name of each band, such as "Very weak" for 0. */
	scoreLabels: PasswordScoreLabels;
	/**
	 * zxcvbn language packs beside the kit's English and Dutch ones, by lowercase
	 * language tag: `{ de: () => import("@zxcvbn-ts/language-de") }`.
	 */
	languages?: ZxcvbnLanguages;
	className?: string;
}>;

const Prefab = ({
	password,
	label,
	scoreLabels,
	languages,
	className,
}: PasswordStrengthProps): ReactNode => (
	<Root
		password={password}
		languages={languages}
		className={className}>
		<StrengthMeter scoreLabels={scoreLabels}>
			<Label>{label}</Label>
			<Value />
			<Track>
				<Indicator />
			</Track>
		</StrengthMeter>
		<Feedback />
		<Suggestions>
			{suggestion => (
				<Suggestion key={suggestion}>
					{suggestion}
				</Suggestion>
			)}
		</Suggestions>
	</Root>
);

/** The parts of a password strength meter, hanging off its prefab. */
export type PasswordStrengthParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Meter: typeof StrengthMeter;
		Label: typeof Label;
		Value: typeof Value;
		Track: typeof Track;
		Indicator: typeof Indicator;
		Feedback: typeof Feedback;
		Suggestions: typeof Suggestions;
		Suggestion: typeof Suggestion;
	}>;

/**
 * The strength band of a password as a labelled meter, followed by zxcvbn's own
 * warning and suggestions in the locale's language. It suspends while that
 * language's dictionaries load, and renders nothing for an empty password. The
 * parts hanging off it compose a meter by hand.
 *
 * @example
 * <PasswordStrength password={password} label="Password strength" scoreLabels={SCORE_LABELS} />
 */
export const PasswordStrength: PasswordStrengthParts =
	Object.assign(Prefab, {
		Root,
		Meter: StrengthMeter,
		Label,
		Value,
		Track,
		Indicator,
		Feedback,
		Suggestions,
		Suggestion,
	});

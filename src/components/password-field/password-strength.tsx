import { Meter } from "@base-ui/react/meter";
import type { Score } from "@zxcvbn-ts/core";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	usePasswordStrength,
	type ZxcvbnLanguages,
} from "../../lib/password-strength/password-strength.ts";
import { useLocale } from "../locale-provider/index.ts";
import style from "./password-field.module.scss";

/** The name of each strength band, from 0 (weakest) to 4 (strongest). */
export type PasswordScoreLabels = Readonly<
	Record<Score, string>
>;

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

const MAX_SCORE = 4;

/**
 * The strength band of a password as a labelled meter, followed by zxcvbn's own
 * warning and suggestions in the locale's language. It suspends while that
 * language's dictionaries load, and renders nothing for an empty password.
 *
 * @example
 * <PasswordStrength password={password} label="Password strength" scoreLabels={SCORE_LABELS} />
 */
export const PasswordStrength = ({
	password,
	label,
	scoreLabels,
	languages,
	className,
}: PasswordStrengthProps): ReactNode => {
	const strength = usePasswordStrength(
		password,
		useLocale(),
		languages,
	);
	if (strength === null) {
		return null;
	}
	const band = scoreLabels[strength.score];

	return (
		<div className={clsx(style.strength, className)}>
			<Meter.Root
				value={strength.score}
				max={MAX_SCORE}
				data-score={strength.score}
				getAriaValueText={() => band}
				className={style.meter}>
				<Meter.Label className={style.meterLabel}>
					{label}
				</Meter.Label>
				<Meter.Value className={style.meterValue}>
					{() => band}
				</Meter.Value>
				<Meter.Track className={style.meterTrack}>
					<Meter.Indicator
						className={style.meterIndicator}
					/>
				</Meter.Track>
			</Meter.Root>

			{strength.warning !== "" && (
				<p className={style.feedback}>{strength.warning}</p>
			)}
			{strength.suggestions.length > 0 && (
				<ul className={style.suggestions}>
					{strength.suggestions.map(suggestion => (
						<li key={suggestion} className={style.feedback}>
							{suggestion}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

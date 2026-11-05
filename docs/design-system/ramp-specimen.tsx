import { StoryProviders } from "../../src/lib/storybook/story-providers.tsx";
import styles from "./ramp-specimen.module.scss";
import { Swatch, SwatchGroup } from "./swatch";
import { nameOf, type Ramp, RAMPS } from "./tokens";

const LABELLED_EVERY = 250;

const RampRow = ({ ramp }: Readonly<{ ramp: Ramp }>) => (
	<div className={styles.ramp}>
		<div className={styles.about}>
			<span className={styles.name}>{ramp.name}</span>
			<span className={styles.use}>{ramp.description}</span>
		</div>
		<div
			className={styles.strip}
			style={{ "--steps": ramp.tokens.length }}>
			{ramp.tokens.map(id => {
				const step = Number(nameOf(id));
				return (
					<div key={id} className={styles.step}>
						<Swatch id={id} />
						{step % LABELLED_EVERY === 0 ? (
							<span className={styles.number} aria-hidden>
								{step}
							</span>
						) : null}
					</div>
				);
			})}
		</div>
	</div>
);

/**
 * Every step of every colour ramp as strips of swatches, the first ramp large
 * and the rest beneath it, each with what the ramp is for. A
 * swatch copies its hex on click.
 *
 * @example
 * <RampSpecimen />
 */
export const RampSpecimen = () => {
	return (
		<StoryProviders>
			<SwatchGroup>
				<div className={styles.ramps}>
					{RAMPS.map(ramp => (
						<RampRow key={ramp.id} ramp={ramp} />
					))}
				</div>
			</SwatchGroup>
		</StoryProviders>
	);
};

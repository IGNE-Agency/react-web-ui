import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import MoreVertIcon from "@material-design-icons/svg/outlined/more_vert.svg?react";
import ReplayIcon from "@material-design-icons/svg/outlined/replay.svg?react";
import { clsx } from "clsx";
import {
	type CSSProperties,
	type ReactNode,
	useState,
} from "react";
import { Button } from "../../src/components/button/index.ts";
import { Icon } from "../../src/components/icon/index.ts";
import { StoryProviders } from "../../src/lib/storybook/story-providers.tsx";
import { resolver } from "./tokens.gen.js";
import { variableNameOf } from "../../src/terrazzo/index";
import styles from "./motion-specimen.module.scss";

const MOTION = "sys.motion.";
const TRANSITIONS_PER_TASK = 20;
const SLOWDOWN = 8;
const CURVE = { width: 40, height: 24, base: 28 } as const;

type Scene =
	| "menu"
	| "dialog"
	| "comment"
	| "selection"
	| "checkbox";

type Bezier = readonly [number, number, number, number];

type Duration = Readonly<{
	id: string;
	name: string;
	milliseconds: number;
	description: string | undefined;
}>;

type Easing = Readonly<{
	id: string;
	name: string;
	curve: Bezier;
	description: string | undefined;
}>;

type Stage = Readonly<{
	/** Whether the scene sits where its movement starts. */
	start: boolean;
	/** Whether the scene's keyframe animations run. */
	playing: boolean;
}>;

const SCENE_DURATION: Readonly<Record<Scene, string>> = {
	menu: "instant",
	dialog: "short",
	comment: "short",
	selection: "instant",
	checkbox: "short",
};

const tokens = resolver.apply({ theme: "light" });

const isId = (id: string): id is keyof typeof tokens =>
	id in tokens;

const motionTokens = Object.keys(tokens)
	.filter(isId)
	.filter(id => id.startsWith(MOTION))
	.map(id => ({
		id,
		name: id.slice(MOTION.length),
		token: tokens[id],
	}));

const durations: readonly Duration[] = motionTokens
	.flatMap(({ id, name, token }) =>
		token.$type === "duration"
			? [
					{
						id,
						name,
						milliseconds:
							token.$value.value *
							(token.$value.unit === "s" ? 1000 : 1),
						description: token.$description,
					},
				]
			: [],
	)
	.toSorted((a, b) => a.milliseconds - b.milliseconds);

const easings: readonly Easing[] = motionTokens.flatMap(
	({ id, name, token }) => {
		if (token.$type !== "cubicBezier") {
			return [];
		}
		const [x1, y1, x2, y2] = token.$value;
		return [
			{
				id,
				name,
				curve: [
					Number(x1),
					Number(y1),
					Number(x2),
					Number(y2),
				],
				description: token.$description,
			},
		];
	},
);

const longest = Math.max(
	...durations.map(({ milliseconds }) => milliseconds),
);

const slowed: CSSProperties = Object.fromEntries(
	durations.map(({ id, milliseconds }) => [
		variableNameOf(id),
		`${milliseconds * SLOWDOWN}ms`,
	]),
);

const present = (flag: boolean) => (flag ? "" : undefined);

const Bone = ({
	className,
}: Readonly<{ className?: string }>) => (
	<span className={clsx(styles.bone, className)} />
);

const MenuScene = ({ start }: Stage) => (
	<div className={styles.menuScene}>
		<MoreVertIcon className={styles.trigger} />
		<div
			className={styles.menu}
			data-starting-style={present(start)}>
			<div className={styles.item}>
				<Bone className={styles.itemIcon} />
				<Bone className={styles.itemLong} />
			</div>
			<div className={styles.item}>
				<Bone className={styles.itemIcon} />
				<Bone className={styles.itemShort} />
			</div>
		</div>
	</div>
);

const DialogScene = ({ start }: Stage) => (
	<>
		<div className={styles.page}>
			<Bone className={styles.pageHeading} />
			<Bone />
			<Bone />
			<Bone className={styles.pageShort} />
		</div>
		<div
			className={styles.backdrop}
			data-starting-style={present(start)}
		/>
		<div
			className={styles.dialog}
			data-starting-style={present(start)}>
			<Bone className={styles.dialogTitle} />
			<Bone />
			<Bone className={styles.pageShort} />
		</div>
	</>
);

const CommentScene = ({ playing }: Stage) => (
	<>
		<div className={styles.bubble}>
			<Bone className={styles.bubbleLong} />
		</div>
		<div className={clsx(playing && styles.arriving)}>
			<div className={styles.bubble}>
				<Bone className={styles.bubbleShort} />
			</div>
		</div>
	</>
);

const SelectionScene = ({ start }: Stage) => (
	<>
		<div
			className={styles.selectionBar}
			data-selected={present(start)}>
			<span className={styles.summary}>
				<Bone className={styles.total} />
				<Bone className={styles.count} />
			</span>
			<span className={styles.actions}>
				<Bone className={styles.action} />
				<Bone
					className={clsx(styles.action, styles.bulk)}
				/>
			</span>
		</div>
		<div className={styles.rows}>
			<Bone />
			<Bone />
			<Bone />
		</div>
	</>
);

const CheckboxScene = ({ start }: Stage) => (
	<span
		className={styles.box}
		data-checked={present(!start)}>
		<span
			className={styles.indicator}
			data-checked={present(!start)}>
			<CheckIcon fill="currentColor" aria-hidden="true" />
		</span>
	</span>
);

const SceneView = ({
	scene,
	...stage
}: Stage & Readonly<{ scene: Scene }>): ReactNode => {
	switch (scene) {
		case "menu":
			return <MenuScene {...stage} />;
		case "dialog":
			return <DialogScene {...stage} />;
		case "comment":
			return <CommentScene {...stage} />;
		case "selection":
			return <SelectionScene {...stage} />;
		case "checkbox":
		default:
			return <CheckboxScene {...stage} />;
	}
};

const Frame = ({
	scene,
	stage,
	style,
}: Readonly<{
	scene: Scene;
	stage: Stage;
	style: CSSProperties;
}>) => (
	<div
		className={styles.frame}
		data-scene={scene}
		style={style}
		aria-hidden>
		<SceneView scene={scene} {...stage} />
	</div>
);

const Curve = ({
	easing: {
		id,
		curve: [x1, y1, x2, y2],
	},
	duration,
	playing,
}: Readonly<{
	easing: Easing;
	duration: Duration | undefined;
	playing: boolean;
}>) => {
	const x = (value: number) => value * CURVE.width;
	const y = (value: number) =>
		CURVE.base - value * CURVE.height;
	const tracing = playing && duration !== undefined;
	return (
		<svg
			viewBox="-4 -8 48 40"
			className={styles.curve}
			style={{
				"--trace-x": `${x(1)}px`,
				"--trace-y": `${y(1) - y(0)}px`,
				"--trace-duration": `${(duration?.milliseconds ?? 0) * SLOWDOWN}ms`,
				"--trace-easing": `var(${variableNameOf(id)})`,
			}}
			aria-hidden>
			<path
				d={`M${x(0)} ${y(0)} C${x(x1)} ${y(y1)} ${x(x2)} ${y(y2)} ${x(1)} ${y(1)}`}
			/>
			<g
				className={clsx(
					styles.time,
					tracing && styles.tracing,
				)}>
				<g
					className={clsx(
						styles.progress,
						tracing && styles.tracing,
					)}>
					<circle cx={x(0)} cy={y(0)} r="3.5" />
				</g>
			</g>
		</svg>
	);
};

const useReplay = () => {
	const [play, setPlay] = useState<
		Readonly<{ run: number; start: boolean }>
	>({ run: 0, start: false });
	const replay = () => {
		setPlay({ run: play.run + 1, start: true });
		requestAnimationFrame(() =>
			requestAnimationFrame(() =>
				setPlay(current => ({ ...current, start: false })),
			),
		);
	};
	return {
		run: play.run,
		stage: { start: play.start, playing: play.run > 0 },
		replay,
	};
};

const Replay = ({
	label,
	onClick,
}: Readonly<{ label: string; onClick: () => void }>) => (
	<Button
		variant="tertiary"
		size="sm"
		iconOnly
		icon={<Icon svg={ReplayIcon} label="" />}
		label={label}
		className={styles.replay}
		onClick={onClick}
	/>
);

const DurationRow = () => {
	const { run, stage, replay } = useReplay();
	return (
		<div className={styles.durationRow}>
			<div className={styles.rowControls}>
				<Replay label="Replay durations" onClick={replay} />
			</div>
			<div
				className={styles.durations}
				style={{ "--count": durations.length }}>
				{durations.map(
					({ id, name, milliseconds, description }) => (
						<div key={id} className={styles.duration}>
							<Frame
								key={run}
								scene="menu"
								stage={stage}
								style={{
									"--sys-motion-instant": `${milliseconds}ms`,
								}}
							/>
							<span className={styles.name}>{name}</span>
							<span className={styles.meta}>
								{description === undefined
									? `${milliseconds} ms`
									: `${milliseconds} ms · ${description}`}
							</span>
							<span className={styles.cost}>
								<span
									className={styles.costBar}
									style={{
										inlineSize: `${(milliseconds / longest) * 100}%`,
									}}
								/>
								<span className={styles.meta}>
									{`${(milliseconds * TRANSITIONS_PER_TASK) / 1000} s per task`}
								</span>
							</span>
						</div>
					),
				)}
			</div>
		</div>
	);
};

const EasingLane = ({
	easing,
	scene,
}: Readonly<{
	easing: Easing;
	scene: Scene | undefined;
}>) => {
	const { run, stage, replay } = useReplay();
	const duration =
		scene === undefined
			? undefined
			: durations.find(
					({ name }) => name === SCENE_DURATION[scene],
				);
	return (
		<div className={styles.easing}>
			<div className={styles.label}>
				<span className={styles.name}>
					<Curve
						key={run}
						easing={easing}
						duration={duration}
						playing={stage.playing}
					/>
					{easing.name}
					{scene === undefined ? null : (
						<Replay
							label={`Replay ${easing.name}`}
							onClick={replay}
						/>
					)}
				</span>
				{easing.description === undefined ? null : (
					<span className={styles.meta}>
						{easing.description}
					</span>
				)}
				{duration === undefined ? null : (
					<span className={styles.meta}>
						{`On ${duration.name}: ${duration.milliseconds} ms, shown at ${duration.milliseconds * SLOWDOWN} ms`}
					</span>
				)}
			</div>
			{scene === undefined ? null : (
				<Frame
					key={run}
					scene={scene}
					stage={stage}
					style={slowed}
				/>
			)}
		</div>
	);
};

/**
 * The motion tokens, moving the way the product moves them: one popup surface
 * opening at every duration, with what twenty such moves cost a task, then each
 * easing on the element that uses it, slowed down so its curve can be seen.
 * Durations and easings come from the token set; `scenes` names the element
 * each easing is shown on, in order. The duration row and each easing replay
 * on their own.
 *
 * @example
 * <MotionSpecimen scenes={{ standard: "menu", overshoot: "checkbox" }} />
 */
export const MotionSpecimen = ({
	scenes,
}: Readonly<{
	scenes: Readonly<Record<string, Scene>>;
}>) => {
	const order = Object.keys(scenes);
	const rank = (name: string) =>
		order.includes(name)
			? order.indexOf(name)
			: order.length;

	return (
		<StoryProviders
			toastCloseIcon={<Icon svg={CloseIcon} label="" />}>
			<div className={styles.motion}>
				<DurationRow />
				<div className={styles.easings}>
					{easings
						.toSorted((a, b) => rank(a.name) - rank(b.name))
						.map(easing => (
							<EasingLane
								key={easing.id}
								easing={easing}
								scene={scenes[easing.name]}
							/>
						))}
				</div>
			</div>
		</StoryProviders>
	);
};

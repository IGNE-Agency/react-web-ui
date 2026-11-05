import { act, useEffect } from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { render } from "vitest-browser-react";
import {
	type BusyPhase,
	type BusyPhaseOptions,
	useBusyPhase,
} from "../src/lib/hooks/use-busy-phase.ts";

const Probe = ({
	onPhase,
	...options
}: BusyPhaseOptions &
	Readonly<{ onPhase: (phase: BusyPhase) => void }>) => {
	const phase = useBusyPhase(options);
	useEffect(() => onPhase(phase), [onPhase, phase]);
	return <output>{phase}</output>;
};

const elapse = (ms: number) =>
	act(() => vi.advanceTimersByTimeAsync(ms));

const setup = async (busy: boolean) => {
	const onPhase = vi.fn<(phase: BusyPhase) => void>();
	const screen = await render(
		<Probe busy={busy} onPhase={onPhase} />,
	);
	return {
		phase: () => screen.container.textContent,
		phases: () =>
			onPhase.mock.calls.map(([phase]) => phase),
		setBusy: (next: boolean) =>
			screen.rerender(
				<Probe busy={next} onPhase={onPhase} />,
			),
	};
};

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useBusyPhase", () => {
	test("shows nothing for a wait shorter than 150 ms", async () => {
		const probe = await setup(true);
		await elapse(149);
		await probe.setBusy(false);
		await elapse(1000);

		expect(probe.phases()).toEqual(["fresh"]);
	});

	test("shows busy once a wait lasts 150 ms", async () => {
		const probe = await setup(true);
		await elapse(149);
		expect(probe.phase()).toBe("fresh");

		await elapse(1);
		expect(probe.phase()).toBe("busy");
	});

	test("holds busy for 200 ms once shown, though the work ends at once", async () => {
		const probe = await setup(true);
		await elapse(150);
		await probe.setBusy(false);
		await elapse(199);
		expect(probe.phase()).toBe("busy");

		await elapse(1);
		expect(probe.phase()).toBe("fresh");
	});

	test("settles at once when the wait has outlasted the hold", async () => {
		const probe = await setup(true);
		await elapse(150 + 200);
		await probe.setBusy(false);

		expect(probe.phase()).toBe("fresh");
	});

	test("escalates to slow at 4 s and stuck at 8 s", async () => {
		const probe = await setup(true);
		await elapse(3999);
		expect(probe.phase()).toBe("busy");

		await elapse(1);
		expect(probe.phase()).toBe("slow");

		await elapse(3999);
		expect(probe.phase()).toBe("slow");

		await elapse(1);
		expect(probe.phase()).toBe("stuck");
	});

	test("keeps showing, without a gap, when work resumes during the hold", async () => {
		const probe = await setup(true);
		await elapse(150);
		await probe.setBusy(false);
		await elapse(100);
		await probe.setBusy(true);
		await elapse(1000);

		expect(probe.phase()).toBe("busy");
		expect(probe.phases()).toEqual(["fresh", "busy"]);
	});

	test("starts over for a new wait once settled", async () => {
		const probe = await setup(true);
		await elapse(150);
		await probe.setBusy(false);
		await elapse(200);
		await probe.setBusy(true);
		await elapse(149);
		expect(probe.phase()).toBe("fresh");

		await elapse(1);
		expect(probe.phase()).toBe("busy");
	});

	test("never leaves fresh while idle", async () => {
		const probe = await setup(false);
		await elapse(10_000);

		expect(probe.phases()).toEqual(["fresh"]);
	});

	test("takes its thresholds from the caller", async () => {
		const onPhase = vi.fn<(phase: BusyPhase) => void>();
		const screen = await render(
			<Probe
				busy
				busyAfter={50}
				busyMinDuration={500}
				slowAfter={1000}
				stuckAfter={2000}
				onPhase={onPhase}
			/>,
		);
		await elapse(50);
		expect(screen.container.textContent).toBe("busy");

		await elapse(950);
		expect(screen.container.textContent).toBe("slow");

		await elapse(1000);
		expect(screen.container.textContent).toBe("stuck");
	});
});

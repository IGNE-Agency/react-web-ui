import {
	type ComponentType,
	lazy,
	type ReactNode,
	Suspense,
} from "react";
import { FieldPlaceholder } from "../../components/field-placeholder/index.ts";

/**
 * A bridge loaded on first render, with a `FieldPlaceholder` until it arrives,
 * so a form that never renders it never downloads it. Register it in
 * `app-form.tsx` with its type spelled out.
 *
 * @example
 * const DateField: (props: TSFDateFieldProps) => ReactNode = deferred(() =>
 * 	import("../../components/date-field/tsf-date-field.tsx").then(module => module.TSFDateField),
 * );
 */
export const deferred = <TProps extends object>(
	load: () => Promise<ComponentType<TProps>>,
): ((props: TProps) => ReactNode) => {
	const Deferred = lazy(() =>
		load().then(Component => ({ default: Component })),
	);
	const Placeheld = (props: TProps): ReactNode => (
		<Suspense fallback={<FieldPlaceholder />}>
			<Deferred {...props} />
		</Suspense>
	);
	return Placeheld;
};

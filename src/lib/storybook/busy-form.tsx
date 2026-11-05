import type { ReactNode } from "react";
import { Form } from "../../components/form/index.ts";
import { useAppForm } from "./app-form.tsx";

/**
 * Renders `children` inside a `Form.Root` that is busy, as one is while it
 * submits.
 *
 * @example
 * <BusyForm><SwitchField {...args} /></BusyForm>
 */
export const BusyForm = ({
	children,
}: Readonly<{ children: ReactNode }>): ReactNode => {
	const form = useAppForm({ defaultValues: {} });
	return (
		<Form.Root form={form} busy>
			{children}
		</Form.Root>
	);
};

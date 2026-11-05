import type { Decorator } from "@storybook/react-vite";
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

const FixtureQueryClient = ({
	createClient,
	children,
}: Readonly<{
	createClient: () => QueryClient;
	children: ReactNode;
}>) => {
	const [queryClient] = useState(createClient);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
};

/**
 * A story decorator that renders the story inside its own query client, for
 * stories that need fixture data.
 *
 * @example
 * export const Loaded: Story = {
 * 	decorators: [withQueryClient(() => loadedClient())],
 * };
 */
export const withQueryClient =
	(createClient: () => QueryClient): Decorator =>
	Story => (
		<FixtureQueryClient createClient={createClient}>
			<Story />
		</FixtureQueryClient>
	);

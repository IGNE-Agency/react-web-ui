import type { Decorator } from "@storybook/react-vite";
import {
	type AnyRoute,
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterContextProvider,
} from "@tanstack/react-router";

/**
 * A memory-history router for stories that render links. Pass `decorator` to
 * the meta's `decorators` and `reset` to its `beforeEach`, so every story
 * starts at `startPath`. Pass a `routeTree` for stories that read the matched
 * routes.
 *
 * @example
 * const { history, decorator, reset } = createStoryRouter();
 * const meta = { decorators: [decorator], beforeEach: reset } satisfies Meta<typeof LinkButton>;
 */
export const createStoryRouter = (
	startPath = "/story",
	routeTree: AnyRoute = createRootRoute(),
) => {
	const history = createMemoryHistory({
		initialEntries: [startPath],
	});
	const router = createRouter({
		routeTree,
		history,
	});
	const decorator: Decorator = Story => (
		<RouterContextProvider router={router}>
			<Story />
		</RouterContextProvider>
	);
	const reset = async () => {
		history.replace(startPath);
		await router.load();
	};

	return { history, decorator, reset };
};

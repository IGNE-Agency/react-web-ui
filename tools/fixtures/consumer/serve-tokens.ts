import { createServer } from "vite";

const server = await createServer({
	server: { middlewareMode: true },
});

await server.close();

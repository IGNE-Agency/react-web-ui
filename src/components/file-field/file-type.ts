/** The part of a `File` an `accept` list is decided on. */
export type TypedFile = Readonly<{
	name: string;
	type: string;
}>;

const matchesToken = (
	file: TypedFile,
	token: string,
): boolean => {
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();

	if (token.startsWith(".")) {
		return name.endsWith(token);
	}
	if (token.endsWith("/*")) {
		return type.startsWith(token.slice(0, -1));
	}
	return type === token;
};

/**
 * Whether a file matches an `accept` list the way the native file picker does:
 * by MIME type, a `type/*` wildcard or a `.ext` extension, ignoring case. An
 * empty list accepts every file.
 *
 * @example
 * isAccepted({ name: "scan.PNG", type: "image/png" }, ["image/*", ".pdf"]); // true
 */
export const isAccepted = (
	file: TypedFile,
	accept: readonly string[],
): boolean => {
	const tokens = accept
		.map(token => token.trim().toLowerCase())
		.filter(token => token !== "");

	return (
		tokens.length === 0 ||
		tokens.some(token => matchesToken(file, token))
	);
};

/**
 * The files an `accept` list rejects, in the order they were given.
 *
 * @example
 * wrongTypeFiles([{ name: "a.pdf", type: "application/pdf" }, { name: "b.exe", type: "" }], [".pdf"]); // [{ name: "b.exe", type: "" }]
 */
export const wrongTypeFiles = <TFile extends TypedFile>(
	files: readonly TFile[],
	accept: readonly string[],
): readonly TFile[] =>
	files.filter(file => !isAccepted(file, accept));

import { describe, expect, test } from "vitest";
import { docCommentOf } from "../.storybook/doc-comment.ts";

describe("docCommentOf", () => {
	test("renders a multi-line example as one tsx block, dedented", () => {
		expect(
			docCommentOf(
				'A labelled numeric field.\n\n@example\n<NumberField\n\tlabel="VAT rate"\n\tvalue={rate}\n/>',
			).markdown,
		).toBe(
			'A labelled numeric field.\n\n```tsx\n<NumberField\n\tlabel="VAT rate"\n\tvalue={rate}\n/>\n```',
		);
	});

	test("renders a one-line example as a code block, not as HTML", () => {
		expect(
			docCommentOf(
				'Composite button.\n\n@example\n<Button variant="primary">Apply</Button>',
			).markdown,
		).toBe(
			'Composite button.\n\n```tsx\n<Button variant="primary">Apply</Button>\n```',
		);
	});

	test("takes code on the tag's own line", () => {
		expect(
			docCommentOf(
				'Describes a flag.\n\n@example describeFlag("Archived")',
			).markdown,
		).toBe(
			'Describes a flag.\n\n```tsx\ndescribeFlag("Archived")\n```',
		);
	});

	test("strips the indent every example line shares", () => {
		expect(
			docCommentOf("@example\n  <A>\n    <B />\n  </A>")
				.markdown,
		).toBe("```tsx\n<A>\n  <B />\n</A>\n```");
	});

	test("sets a mid-line default apart from the prose", () => {
		expect(
			docCommentOf(
				'Colour role, for irreversible\nactions. @default "brand"',
			),
		).toEqual({
			markdown: "Colour role, for irreversible\nactions.",
			defaultValue: '"brand"',
		});
	});

	test("turns links into code and leaves package names and addresses alone", () => {
		expect(
			docCommentOf(
				"Wraps {@link TextInput} over @tanstack/react-form, mailing anna@example.com.",
			),
		).toEqual({
			markdown:
				"Wraps `TextInput` over @tanstack/react-form, mailing anna@example.com.",
			defaultValue: undefined,
		});
	});

	test("names other tags instead of printing them raw", () => {
		expect(
			docCommentOf("Old.\n\n@deprecated Use {@link Next}.")
				.markdown,
		).toBe("Old.\n\n**Deprecated.** Use `Next`.");
	});
});

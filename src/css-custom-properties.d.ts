export {};

declare module "react" {
	// oxlint-disable-next-line typescript/consistent-type-definitions -- declaration merging needs an interface
	interface CSSProperties {
		[customProperty: `--${string}`]:
			| string
			| number
			| undefined;
	}
}

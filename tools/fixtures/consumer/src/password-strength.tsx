import { LocaleProvider } from "@maanlamp/react-web-ui/locale-provider";
import { PasswordStrength } from "@maanlamp/react-web-ui/password-field";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.body).render(
	<LocaleProvider locale="nl-NL">
		<Suspense>
			<PasswordStrength
				password="correct horse battery staple"
				label="Password strength"
				scoreLabels={{
					0: "Very weak",
					1: "Weak",
					2: "Fair",
					3: "Strong",
					4: "Very strong",
				}}
			/>
		</Suspense>
	</LocaleProvider>,
);

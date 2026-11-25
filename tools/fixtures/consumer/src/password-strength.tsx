import { LocaleProvider } from "@igne-agency/react-web-ui/locale-provider";
import { PasswordStrength } from "@igne-agency/react-web-ui/password-field";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.body).render(
	<LocaleProvider locale="nl-NL">
		<Suspense>
			<PasswordStrength password="correct horse battery staple" />
		</Suspense>
	</LocaleProvider>,
);

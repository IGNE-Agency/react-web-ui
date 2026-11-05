import { createAppForm } from "@maanlamp/react-web-ui/forms";
import { TSFTextField } from "@maanlamp/react-web-ui/text-field";
import { createRoot } from "react-dom/client";

const { useAppForm } = createAppForm({
	TextField: TSFTextField,
});

const Name = () => {
	const form = useAppForm({ defaultValues: { name: "" } });
	return (
		<form.AppField name="name">
			{field => (
				<field.TextField
					label="Name"
					optionalLabel="optional"
				/>
			)}
		</form.AppField>
	);
};

createRoot(document.body).render(<Name />);

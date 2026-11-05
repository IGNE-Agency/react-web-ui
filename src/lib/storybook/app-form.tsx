import type { ReactNode } from "react";
import { TSFCheckboxField } from "../../components/checkbox-field/tsf-checkbox-field.tsx";
import { TSFCheckboxGroupField } from "../../components/checkbox-group-field/tsf-checkbox-group-field.tsx";
import { TSFComboboxField } from "../../components/combobox-field/tsf-combobox-field.tsx";
import type { TSFDateFieldProps } from "../../components/date-field/tsf-date-field.tsx";
import type { TSFDateRangeFieldProps } from "../../components/date-range-field/tsf-date-range-field.tsx";
import type { TSFEmailFieldProps } from "../../components/email-field/tsf-email-field.tsx";
import type { TSFFileFieldProps } from "../../components/file-field/tsf-file-field.tsx";
import type { TSFNumberFieldProps } from "../../components/number-field/tsf-number-field.tsx";
import type { TSFOtpFieldProps } from "../../components/otp-field/tsf-otp-field.tsx";
import { TSFPasswordField } from "../../components/password-field/tsf-password-field.tsx";
import type { TSFPhoneFieldProps } from "../../components/phone-field/tsf-phone-field.tsx";
import { TSFPhotoField } from "../../components/photo-field/tsf-photo-field.tsx";
import { TSFRadioGroupField } from "../../components/radio-group-field/tsf-radio-group-field.tsx";
import type { TSFSearchFieldProps } from "../../components/search-field/tsf-search-field.tsx";
import { TSFSegmentedControlField } from "../../components/segmented-control-field/tsf-segmented-control-field.tsx";
import { TSFSelectField } from "../../components/select-field/tsf-select-field.tsx";
import { TSFSwitchField } from "../../components/switch-field/tsf-switch-field.tsx";
import { TSFTextField } from "../../components/text-field/tsf-text-field.tsx";
import type { TSFTextareaFieldProps } from "../../components/textarea-field/tsf-textarea-field.tsx";
import type { TSFTimeFieldProps } from "../../components/time-field/tsf-time-field.tsx";
import { TSFToggleGroupField } from "../../components/toggle-group-field/tsf-toggle-group-field.tsx";
import {
	type AppForm,
	createAppForm,
} from "../forms/create-app-form.ts";
import { deferred } from "./deferred.tsx";

const DateField: (props: TSFDateFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/date-field/tsf-date-field.tsx").then(
			module => module.TSFDateField,
		),
	);
const DateRangeField: (
	props: TSFDateRangeFieldProps,
) => ReactNode = deferred(() =>
	import("../../components/date-range-field/tsf-date-range-field.tsx").then(
		module => module.TSFDateRangeField,
	),
);
const EmailField: (props: TSFEmailFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/email-field/tsf-email-field.tsx").then(
			module => module.TSFEmailField,
		),
	);
const FileField: (props: TSFFileFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/file-field/tsf-file-field.tsx").then(
			module => module.TSFFileField,
		),
	);
const NumberField: (
	props: TSFNumberFieldProps,
) => ReactNode = deferred(() =>
	import("../../components/number-field/tsf-number-field.tsx").then(
		module => module.TSFNumberField,
	),
);
const OtpField: (props: TSFOtpFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/otp-field/tsf-otp-field.tsx").then(
			module => module.TSFOtpField,
		),
	);
const PhoneField: (props: TSFPhoneFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/phone-field/tsf-phone-field.tsx").then(
			module => module.TSFPhoneField,
		),
	);
const SearchField: (
	props: TSFSearchFieldProps,
) => ReactNode = deferred(() =>
	import("../../components/search-field/tsf-search-field.tsx").then(
		module => module.TSFSearchField,
	),
);
const TextareaField: (
	props: TSFTextareaFieldProps,
) => ReactNode = deferred(() =>
	import("../../components/textarea-field/tsf-textarea-field.tsx").then(
		module => module.TSFTextareaField,
	),
);
const TimeField: (props: TSFTimeFieldProps) => ReactNode =
	deferred(() =>
		import("../../components/time-field/tsf-time-field.tsx").then(
			module => module.TSFTimeField,
		),
	);

type FieldComponents = Readonly<{
	CheckboxField: typeof TSFCheckboxField;
	CheckboxGroupField: typeof TSFCheckboxGroupField;
	ComboboxField: typeof TSFComboboxField;
	DateField: typeof DateField;
	DateRangeField: typeof DateRangeField;
	EmailField: typeof EmailField;
	FileField: typeof FileField;
	NumberField: typeof NumberField;
	OtpField: typeof OtpField;
	PasswordField: typeof TSFPasswordField;
	PhoneField: typeof PhoneField;
	PhotoField: typeof TSFPhotoField;
	RadioGroupField: typeof TSFRadioGroupField;
	SearchField: typeof SearchField;
	SegmentedControlField: typeof TSFSegmentedControlField;
	SelectField: typeof TSFSelectField;
	SwitchField: typeof TSFSwitchField;
	TextField: typeof TSFTextField;
	TextareaField: typeof TextareaField;
	TimeField: typeof TimeField;
	ToggleGroupField: typeof TSFToggleGroupField;
}>;

const fieldComponents: FieldComponents = {
	CheckboxField: TSFCheckboxField,
	CheckboxGroupField: TSFCheckboxGroupField,
	ComboboxField: TSFComboboxField,
	DateField,
	DateRangeField,
	EmailField,
	FileField,
	NumberField,
	OtpField,
	PasswordField: TSFPasswordField,
	PhoneField,
	PhotoField: TSFPhotoField,
	RadioGroupField: TSFRadioGroupField,
	SearchField,
	SegmentedControlField: TSFSegmentedControlField,
	SelectField: TSFSelectField,
	SwitchField: TSFSwitchField,
	TextField: TSFTextField,
	TextareaField,
	TimeField,
	ToggleGroupField: TSFToggleGroupField,
};

const appForm: AppForm<FieldComponents> =
	createAppForm(fieldComponents);

/**
 * The form hook of the kit's stories and tests, with every field's bridge
 * registered under its plain name.
 *
 * @example
 * const form = useAppForm({
 * 	defaultValues: { email: "" },
 * 	onSubmit: ({ value }) => save(value),
 * });
 */
export const useAppForm: AppForm<FieldComponents>["useAppForm"] =
	appForm.useAppForm;

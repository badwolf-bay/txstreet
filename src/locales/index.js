import { enUS, de } from "date-fns/locale";
import en from "./en.json";
import deMessages from "./de.json";

const supportedLocales = {
	en: {
		title: "English",
		fns: enUS,
		messages: en,
	},
	de: {
		title: "Deutsche",
		fns: de,
		messages: deMessages,
	},
};

export default supportedLocales;

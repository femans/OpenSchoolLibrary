import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';

const config: Config = {
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./locales/en/common.json')).default
		},
		{
			locale: 'en',
			key: 'admin',
			loader: async () => (await import('./locales/en/admin.json')).default
		},
		{
			locale: 'en',
			key: 'reader',
			loader: async () => (await import('./locales/en/reader.json')).default
		},
		{
			locale: 'nl',
			key: 'common',
			loader: async () => (await import('./locales/nl/common.json')).default
		},
		{
			locale: 'nl',
			key: 'admin',
			loader: async () => (await import('./locales/nl/admin.json')).default
		},
		{
			locale: 'nl',
			key: 'reader',
			loader: async () => (await import('./locales/nl/reader.json')).default
		}
	]
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);

export const defaultLocale = 'en';

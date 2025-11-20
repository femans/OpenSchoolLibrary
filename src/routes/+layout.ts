import type { LayoutLoad } from './$types';
import { loadTranslations, defaultLocale } from '$lib/i18n';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ url }) => {
  const { pathname } = url;
  
  // Get locale from localStorage or use default
  let locale = defaultLocale;
  if (browser) {
    const stored = localStorage.getItem('locale');
    if (stored) {
      locale = stored;
    }
  }
  
  await loadTranslations(locale, pathname);
  
  return {};
};

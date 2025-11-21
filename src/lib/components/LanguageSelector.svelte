<script lang="ts">
  import { locale, locales } from '$lib/i18n';
  import { browser } from '$app/environment';
  
  function changeLocale(newLocale: string) {
    if (browser) {
      locale.set(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  }

  function getFlag(lang: string): string {
    const flags: Record<string, string> = {
      'en': '🇬🇧',
      'nl': '🇳🇱'
    };
    return flags[lang] || '🌐';
  }
</script>

<div class="language-selector">
  <select 
    value={$locale} 
    on:change={(e) => changeLocale(e.currentTarget.value)}
    class="px-3 py-1 border border-white rounded bg-blue-500 text-white hover:bg-blue-400 cursor-pointer"
  >
    {#each $locales as loc}
      <option value={loc} class="bg-white text-black">{getFlag(loc)} {loc.toUpperCase()}</option>
    {/each}
  </select>
</div>

<style>
  .language-selector select {
    cursor: pointer;
  }
</style>

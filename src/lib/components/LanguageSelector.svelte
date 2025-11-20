<script lang="ts">
  import { locale, locales } from '$lib/i18n';
  import { browser } from '$app/environment';
  
  function changeLocale(newLocale: string) {
    if (browser) {
      locale.set(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  }
</script>

<div class="language-selector">
  <select 
    value={$locale} 
    on:change={(e) => changeLocale(e.currentTarget.value)}
    class="px-2 py-1 border rounded bg-white dark:bg-gray-800"
  >
    {#each $locales as loc}
      <option value={loc}>{loc.toUpperCase()}</option>
    {/each}
  </select>
</div>

<style>
  .language-selector select {
    cursor: pointer;
  }
</style>

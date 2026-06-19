import { useState, useEffect } from 'react';

// Реактивно отслеживает активную тему по data-theme на <html>
// (его ставит SettingsButton). Возвращает 'light' | 'dark'.
export function useTheme() {
  const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

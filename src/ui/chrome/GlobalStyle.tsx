import { useEffect } from 'react';
import { Platform } from 'react-native';

// Global chrome styling, injected once on web (PM globals.css port):
// brass vignette over the background per theme mode, native scrollbars hidden
// in favour of BrassRail, and the shared CSS keyframes. Web-only by design —
// on native there is no document.
const SCROLL_CSS = `
  [data-brassscroll] { scrollbar-width: none; }
  [data-brassscroll]::-webkit-scrollbar { display: none; }
`;

const KEYFRAMES = `
  @keyframes pigeon-bob {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
  }
`;

export function GlobalStyle({ mode, bg, bgGlow }: { mode: 'dark' | 'light'; bg: string; bgGlow: string }) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const vignette =
      mode === 'dark'
        ? `background-color: ${bg}; background-image: ${bgGlow}; background-attachment: fixed;`
        : `background-color: ${bg}; background-attachment: fixed;`;
    let el = document.getElementById('pigeonpost-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'pigeonpost-style';
      document.head.appendChild(el);
    }
    el.textContent = `html { scrollbar-width: none; }\nhtml::-webkit-scrollbar { display: none; }\n${SCROLL_CSS}\n${KEYFRAMES}\nbody { ${vignette} }\nbody, #root { min-height: 100%; }`;
  }, [mode, bg, bgGlow]);
  return null;
}

import { useEffect } from 'react';
import { useGame } from '../store/game.ts';

export function useKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space') {
        const { game, roll } = useGame.getState();
        if (!e.repeat && game?.phase === 'roll' && !game.players[game.current].isBot) { e.preventDefault(); roll(); }
        // Otherwise let Space activate a focused button or link; elsewhere stop it scrolling the page.
        else if (!(e.target instanceof Element && e.target.closest('button, a'))) e.preventDefault();
      } else if ((e.key === 'f' || e.key === 'F') && !e.repeat) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

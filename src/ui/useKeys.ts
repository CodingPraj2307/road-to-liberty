import { useEffect } from 'react';
import { useGame } from '../store/game.ts';

/** Shared by the F key and the header's full screen button. */
export function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
}

/** F toggles full screen everywhere; Space rolls only while the board is showing (`play`). */
export function useKeys(play: boolean) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space' && play) {
        const { game, feedback, roll } = useGame.getState();
        // No roll while the last result is still showing: it would pop a new card over it.
        if (!e.repeat && !feedback && game?.phase === 'roll' && !game.players[game.current].isBot) { e.preventDefault(); roll(); }
        // Otherwise let Space activate a focused button or link; elsewhere stop it scrolling the page.
        else if (!(e.target instanceof Element && e.target.closest('button, a'))) e.preventDefault();
      } else if ((e.key === 'f' || e.key === 'F') && !e.repeat) toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play]);
}

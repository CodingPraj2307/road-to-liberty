import { useEffect, useRef, type RefObject } from 'react';
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

/**
 * While `onEnter` is set, Enter calls it from anywhere on the page. It is caught on the window and its default is
 * prevented, so Enter can never press a header button (Quit) while a card is up.
 */
export function useEnter(onEnter: (() => void) | null) {
  useEffect(() => {
    if (!onEnter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      onEnter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEnter]);
}

/** Focuses the element once it mounts without scrolling to it, so a tall card still opens at its top. */
export function useFocusOnMount<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return ref;
}

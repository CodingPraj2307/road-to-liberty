import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useGame } from '../store/game.ts';
import { PRIMARY } from './Setup.tsx';

/** If the game screen crashes, offer a way back to the title screen instead of a blank page. */
export class GameErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Rights Rush crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="grid min-h-dvh place-items-center p-4">
        <div className="max-w-[36rem] rounded-md border-[3px] border-ink bg-cream px-8 py-6 text-center shadow-[0_6px_0_var(--color-ink)]">
          <h1 className="font-display text-[2.4rem] leading-tight text-crimson">Something went wrong</h1>
          <p className="mt-2">This game cannot go on. You can start a new one.</p>
          <button type="button" autoFocus onClick={() => useGame.getState().quit()} className={`mt-5 ${PRIMARY}`}>
            Back to the title screen
          </button>
        </div>
      </div>
    );
  }
}

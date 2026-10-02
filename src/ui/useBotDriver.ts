import { useEffect } from 'react';
import { useGame } from '../store/game.ts';
import { botCorrect } from '../engine/bot.ts';
import * as E from '../engine/game.ts';
import { cardDelayMs, readMs } from './motion.ts';

/** How long the bot's card stays on screen before it acts (unfinished liberty gets its half-length reading time). */
const BOT_CARD_MS = 1200;

export function useBotDriver() {
  const game = useGame(s => s.game);
  const fastBot = useGame(s => s.fastBot);
  const feedback = useGame(s => s.feedback);
  useEffect(() => {
    if (!game || game.phase === 'over' || feedback || !game.players[game.current].isBot) return;
    const delay = fastBot ? 0 : game.phase === 'roll' ? 500
      : cardDelayMs(game) + (game.pending!.kind === 'unfinished' ? readMs(5000, true) : BOT_CARD_MS);
    const t = setTimeout(() => {
      const s = useGame.getState(); const g = s.game!;
      if (g.phase === 'roll') return s.roll();
      const k = g.pending!.kind;
      if (k === 'right' || k === 'whoSaid') {
        const [correct, g2] = botCorrect(g);
        useGame.setState({ game: E.answer(g2, correct), feedback: { pending: g.pending!, correct, who: g.current } });
      } else s.acknowledge();
    }, delay);
    return () => clearTimeout(t);
  }, [game, fastBot, feedback]);
}

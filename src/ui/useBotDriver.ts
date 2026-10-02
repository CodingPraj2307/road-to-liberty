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
  // A token still walking (say, the human's long walk back after a failed Finish) holds the bot's next roll.
  // Only the roll waits on it, so a card's timing is not restarted when the bot's own token starts or stops.
  const holdRoll = useGame(s => s.animating && s.game?.phase === 'roll');
  useEffect(() => {
    if (!game || game.phase === 'over' || feedback || holdRoll || !game.players[game.current].isBot) return;
    const delay = fastBot ? 0 : game.phase === 'roll' ? 500
      : cardDelayMs(game) + (game.pending!.kind === 'unfinished' ? readMs(5000, true) : BOT_CARD_MS);
    const t = setTimeout(() => {
      const s = useGame.getState(); const g = s.game!;
      if (g.phase === 'roll') return s.animating ? undefined : s.roll();
      const k = g.pending!.kind;
      if (k === 'right' || k === 'whoSaid') {
        const [correct, g2] = botCorrect(g);
        useGame.setState({ game: E.answer(g2, correct), feedback: { pending: g.pending!, correct, who: g.current } });
      } else s.acknowledge();
    }, delay);
    return () => clearTimeout(t);
  }, [game, fastBot, feedback, holdRoll]);
}

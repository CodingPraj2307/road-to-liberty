import { useEffect } from 'react';
import { useGame } from '../store/game.ts';
import { botCorrect } from '../engine/bot.ts';
import * as E from '../engine/game.ts';
import { BOT_RESULT_MS, FAST_BOT_RESULT_MS, cardDelayMs } from './motion.ts';

/** How long the bot's question card stays on screen before it answers. */
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
    // Question cards are answered quickly (the result card that follows holds the explanation);
    // Grievance, Founder and Unfinished cards stay up long enough to read their explanation.
    const question = game.pending?.kind === 'right' || game.pending?.kind === 'whoSaid';
    const delay = game.phase === 'roll' ? (fastBot ? 0 : 500)
      : question ? (fastBot ? 0 : cardDelayMs(game) + BOT_CARD_MS)
      : cardDelayMs(game) + (fastBot ? FAST_BOT_RESULT_MS : BOT_RESULT_MS);
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

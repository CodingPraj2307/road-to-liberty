import { useBotDriver } from './ui/useBotDriver.ts';
import { useKeys } from './ui/useKeys.ts';

export default function App() {
  useBotDriver();
  useKeys();
  return <h1>Rights Rush</h1>
}

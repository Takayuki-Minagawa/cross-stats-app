import { useCallback, useEffect, useMemo, useState } from 'react';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { mulberry32, randn } from '../../lib/random';
import { mean } from '../../lib/stats';
import { useLang } from '../../i18n';
import { useProgress } from '../../contexts/ProgressContext';
import { useToast } from '../../contexts/ToastContext';
import { confetti } from '../../lib/confetti';

const GAME_ID = 'correlation';
const START_HEARTS = 3;
const MAX_HEARTS = 5;

type Round = {
  xs: number[];
  ys: number[];
  r: number;
  slope: number;
  intercept: number;
};

type Grade = 'perfect' | 'great' | 'good' | 'miss';

type Result = { guess: number; r: number; grade: Grade; points: number };

const text = {
  ja: {
    title: '相関当てゲーム',
    lede: '散布図を見て、相関係数 r を当てよう！ 誤差 0.05 以内なら Perfect でライフ +1。0.15 を超えて外すとライフ −1。ライフが尽きるまで何点取れるかな？',
    round: (n: number) => `ラウンド ${n}`,
    score: 'スコア',
    best: 'ベスト',
    streak: '連続',
    guess: 'あなたの予想 r',
    submit: '決定！ (Enter)',
    next: '次のラウンドへ (Enter)',
    answer: (r: string) => `正解 r = ${r}`,
    yourGuess: (g: string) => `あなたの予想 ${g}`,
    grades: { perfect: 'Perfect!! ❤️+1', great: 'Great!', good: 'Good', miss: 'Miss… 💔−1' },
    plus: (p: number) => `+${p} 点`,
    overTitle: 'ゲームオーバー',
    overBody: (s: number, n: number) => `${n} ラウンドで ${s} 点を獲得しました`,
    newRecord: '🎉 自己ベスト更新！',
    restart: 'もう一度あそぶ',
    history: 'これまでの結果',
    whatIsR: '相関係数 r とは？',
    whatIsRBody:
      '2 つの変数がどれだけ直線的に連動しているかを −1 〜 1 で表す指標です。右上がりなら正、右下がりなら負、無関係なら 0 付近になります。',
    tipTitle: 'コツ',
    tips: [
      '点の雲が細長い楕円ほど |r| は 1 に近い',
      '丸い雲なら r ≈ 0。向き (右上がり / 右下がり) で符号を決める',
      '|r| = 0.5 でも見た目は意外とばらつきが大きい',
    ],
  },
  en: {
    title: 'Guess the Correlation',
    lede: 'Look at the scatter plot and guess the correlation r! Within 0.05 is Perfect and earns a life. Miss by more than 0.15 and you lose one. How far can you go?',
    round: (n: number) => `Round ${n}`,
    score: 'Score',
    best: 'Best',
    streak: 'Streak',
    guess: 'Your guess r',
    submit: 'Lock it in! (Enter)',
    next: 'Next round (Enter)',
    answer: (r: string) => `Answer r = ${r}`,
    yourGuess: (g: string) => `Your guess ${g}`,
    grades: { perfect: 'Perfect!! ❤️+1', great: 'Great!', good: 'Good', miss: 'Miss… 💔−1' },
    plus: (p: number) => `+${p} pts`,
    overTitle: 'Game over',
    overBody: (s: number, n: number) => `You scored ${s} points in ${n} rounds`,
    newRecord: '🎉 New personal best!',
    restart: 'Play again',
    history: 'History',
    whatIsR: 'What is the correlation r?',
    whatIsRBody:
      'A number from −1 to 1 describing how strongly two variables move together along a straight line. Upward slopes are positive, downward slopes negative, and unrelated data sits near 0.',
    tipTitle: 'Tips',
    tips: [
      'The thinner the elliptical cloud, the closer |r| is to 1',
      'A round cloud means r ≈ 0; the tilt decides the sign',
      'Even |r| = 0.5 looks surprisingly scattered',
    ],
  },
} as const;

function makeRound(seed: number): Round {
  const rng = mulberry32(seed);
  // 強い相関〜無相関まで偏りなく出題する
  const rho = (rng() * 2 - 1) * 0.98;
  const n = 30 + Math.floor(rng() * 50);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = randn(rng);
    xs.push(x);
    ys.push(rho * x + Math.sqrt(1 - rho * rho) * randn(rng));
  }
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const r = sxy / Math.sqrt(sxx * syy);
  const slope = sxy / sxx;
  return { xs, ys, r, slope, intercept: my - slope * mx };
}

function grade(err: number): Grade {
  if (err <= 0.05) return 'perfect';
  if (err <= 0.1) return 'great';
  if (err <= 0.15) return 'good';
  return 'miss';
}

const basePoints: Record<Grade, number> = { perfect: 100, great: 60, good: 30, miss: 0 };

const newSeed = () => 1 + Math.floor(Math.random() * 1_000_000);

export function CorrelationGame() {
  const { lang } = useLang();
  const tr = text[lang];
  const { best, submitScore } = useProgress();
  const { show } = useToast();

  const [seed, setSeed] = useState(newSeed);
  const [guess, setGuess] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<Result[]>([]);
  const [phase, setPhase] = useState<'guess' | 'reveal' | 'over'>('guess');
  const [record, setRecord] = useState(false);

  const round = useMemo(() => makeRound(seed), [seed]);
  const last = history[history.length - 1];

  const submit = useCallback(() => {
    if (phase !== 'guess') return;
    const g = grade(Math.abs(guess - round.r));
    const points = g === 'miss' ? 0 : basePoints[g] + streak * 10;
    const nextHearts = g === 'perfect' ? Math.min(MAX_HEARTS, hearts + 1) : g === 'miss' ? hearts - 1 : hearts;
    setHistory((h) => [...h, { guess, r: round.r, grade: g, points }]);
    setScore((s) => s + points);
    setStreak((s) => (g === 'miss' ? 0 : s + 1));
    setHearts(nextHearts);
    setPhase('reveal');
    if (g === 'perfect') confetti({ count: 70, originY: 0.3 });
  }, [phase, guess, round.r, streak, hearts]);

  const next = useCallback(() => {
    if (phase !== 'reveal') return;
    if (hearts <= 0) {
      setPhase('over');
      const isRecord = submitScore(GAME_ID, score);
      setRecord(isRecord);
      if (isRecord && score > 0) {
        confetti({ count: 200 });
        show({ icon: '🏆', title: tr.newRecord, body: `${score}` });
      }
      return;
    }
    setSeed(newSeed());
    setGuess(0);
    setPhase('guess');
  }, [phase, hearts, score, submitScore, show, tr.newRecord]);

  const restart = () => {
    setSeed(newSeed());
    setGuess(0);
    setHearts(START_HEARTS);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setRecord(false);
    setPhase('guess');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 長押しの連続発火・IME 変換確定・他 UI (検索パレット等) で処理済みのキーは無視する
      if (e.key !== 'Enter' || e.repeat || e.isComposing || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      // ボタン自身の Enter と二重発火させない。テキスト入力中の Enter も対象外 (スライダーは対象)
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA')) return;
      if (target instanceof HTMLInputElement && target.type !== 'range') return;
      if (phase === 'guess') submit();
      else if (phase === 'reveal') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, submit, next]);

  // 散布図の座標変換 (データ範囲 ±3.2 を 0..300 に写像)
  const S = 300;
  const lim = 3.2;
  const px = (x: number) => ((x + lim) / (2 * lim)) * S;
  const py = (y: number) => S - ((y + lim) / (2 * lim)) * S;
  const bestScore = Math.max(best[GAME_ID] ?? 0, phase === 'over' ? score : 0);

  return (
    <>
      <header className="page-header cat-play">
        <div className="page-icon" aria-hidden="true">
          🎯
        </div>
        <div className="page-header-body">
          <h1>{tr.title}</h1>
          <p className="lede">{tr.lede}</p>
        </div>
      </header>

      <div className="game-hud">
        <span className="hud-item">{tr.round(history.length + (phase === 'guess' ? 1 : 0))}</span>
        <span className="hud-item hearts" aria-label={`${hearts}`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span key={i} className={i < hearts ? 'heart on' : 'heart'}>
              ♥
            </span>
          ))}
        </span>
        <span className="hud-item">
          {tr.score} <strong>{score}</strong>
        </span>
        <span className="hud-item">
          {tr.streak} <strong>{streak}</strong>
        </span>
        <span className="hud-item">
          {tr.best} <strong>{bestScore}</strong>
        </span>
      </div>

      <div className="game-grid">
        <div className="panel game-board">
          <svg viewBox={`0 0 ${S} ${S}`} className="scatter" role="img" aria-label="scatter plot" key={seed}>
            <rect x="0" y="0" width={S} height={S} className="scatter-bg" rx="8" />
            <line x1={S / 2} y1="0" x2={S / 2} y2={S} className="scatter-axis" />
            <line x1="0" y1={S / 2} x2={S} y2={S / 2} className="scatter-axis" />
            {round.xs.map((x, i) => (
              <circle
                key={i}
                cx={px(x)}
                cy={py(round.ys[i])}
                r="4.2"
                className="scatter-dot"
                style={{ animationDelay: `${i * 12}ms` }}
              />
            ))}
            {phase !== 'guess' && (
              <line
                x1={px(-lim)}
                y1={py(round.intercept + round.slope * -lim)}
                x2={px(lim)}
                y2={py(round.intercept + round.slope * lim)}
                className="scatter-fit"
              />
            )}
          </svg>
        </div>

        <div className="panel game-side">
          {phase === 'guess' && (
            <>
              <Slider
                label={tr.guess}
                value={guess}
                min={-1}
                max={1}
                step={0.01}
                onChange={setGuess}
                format={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
              />
              <div className="guess-scale" aria-hidden="true">
                <span>−1</span>
                <span>0</span>
                <span>+1</span>
              </div>
              <button type="button" className="btn primary big" onClick={submit}>
                {tr.submit}
              </button>
            </>
          )}

          {phase === 'reveal' && last && (
            <div className={`reveal grade-${last.grade}`}>
              <div className="reveal-grade">{tr.grades[last.grade]}</div>
              <div className="reveal-answer">{tr.answer(last.r.toFixed(2))}</div>
              <div className="reveal-guess">{tr.yourGuess(last.guess.toFixed(2))}</div>
              <div className="reveal-points">{tr.plus(last.points)}</div>
              <button type="button" className="btn primary big" onClick={next}>
                {tr.next}
              </button>
            </div>
          )}

          {phase === 'over' && (
            <div className="reveal game-over">
              <div className="reveal-grade">{tr.overTitle}</div>
              <div className="reveal-answer">{tr.overBody(score, history.length)}</div>
              {record && score > 0 && <div className="reveal-points">{tr.newRecord}</div>}
              <button type="button" className="btn primary big" onClick={restart}>
                {tr.restart}
              </button>
            </div>
          )}

          {history.length > 0 && (
            <div className="history">
              <div className="history-title">{tr.history}</div>
              <div className="history-chips">
                {history.map((h, i) => (
                  <span key={i} className={`chip grade-${h.grade}`} title={`${h.guess.toFixed(2)} / ${h.r.toFixed(2)}`}>
                    {h.r.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{tr.whatIsR}</h3>
        <p>{tr.whatIsRBody}</p>
        <MathBlock
          tex={String.raw`r = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_i (x_i - \bar{x})^2}\,\sqrt{\sum_i (y_i - \bar{y})^2}}`}
        />
        <h3>{tr.tipTitle}</h3>
        <ul>
          {tr.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

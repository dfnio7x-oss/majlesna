import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, MessageSquarePlus, Send, ShieldAlert, Sparkles, Timer, UserCheck, Vote } from 'lucide-react';
import type { GameProps } from './GameShell';
import {
  LIAR_WORD_PAIRS,
  SECRET_VOTE_PROMPTS,
  SPY_LOCATIONS,
  TABOO_CARDS,
  TWO_TRUTHS_SOLO_BANK,
  WEIRD_TRANSLATOR_BANK,
  WHO_AM_I_CARDS,
  WOULD_YOU_RATHER_BANK,
} from '../../data/phase2Bank';
import { soundEngine } from '../../utils/soundEngine';

/* ============================================================================
 * 21. SECRET AGENT (Spyfall Location Deduction)
 * ============================================================================ */
export const GameSecretAgent: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onRoomAction,
  onScoreProgress,
}) => {
  const gs = room?.gameState as {
    seed?: number;
    impostorId?: string;
    votes?: Record<string, string>;
    revealed?: boolean;
  } | undefined;

  const seed = gs?.seed ?? Math.floor(Math.random() * 100);
  const loc = SPY_LOCATIONS[seed % SPY_LOCATIONS.length];
  const isOnline = mode === 'online' && room;
  const isImpostor = isOnline ? Boolean(secrets.isImpostor) : false;

  // Local / Solo pass & play multi-round campaign
  const [totalCampaignRounds, setTotalCampaignRounds] = useState(3);
  const [campaignRound, setCampaignRound] = useState(1);
  const [campaignScore, setCampaignScore] = useState(0);
  const [localPlayers] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [localLocations] = useState(() => [...SPY_LOCATIONS].sort(() => Math.random() - 0.5));
  const [localSpyIdx, setLocalSpyIdx] = useState(() => Math.floor(Math.random() * 4));
  const [peekIdx, setPeekIdx] = useState<number | null>(null);
  const [roundFeedback, setRoundFeedback] = useState<string | null>(null);
  const localLoc = localLocations[(campaignRound - 1) % localLocations.length];

  if (isOnline) {
    const votes = gs?.votes ?? {};
    const myVote = votes[playerId];
    return (
      <div className="max-w-xl mx-auto space-y-5 text-center">
        <div
          className={`p-5 rounded-2xl border-2 ${
            isImpostor
              ? 'bg-[#C84B31]/10 border-[#C84B31]'
              : 'bg-[#2D6A4F]/10 border-[#2D6A4F]'
          }`}
        >
          <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'بطاقتك السرية' : 'Your Secret Card'}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] mt-1">
            {isImpostor
              ? lang === 'ar'
                ? 'أنت العميل السري! استنتج الموقع دون أن تنكشف'
                : 'You are the Secret Agent! Blend in & guess the location'
              : `${lang === 'ar' ? 'الموقع:' : 'Location:'} ${loc[lang]}`}
          </h2>
        </div>

        <div className="space-y-2 text-start">
          <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'صوّت لكشف العميل السري:' : 'Vote to accuse the Secret Agent:'}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {room.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onRoomAction?.({ action: 'party_vote', targetId: p.id });
                }}
                className={`p-3 rounded-xl border text-sm font-semibold cursor-pointer ${
                  myVote === p.id
                    ? 'bg-[#C84B31] text-white border-[#C84B31]'
                    : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
                }`}
              >
                {p.name} ({Object.values(votes).filter((v) => v === p.id).length})
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playPoint();
            onFinish({ outcome: 'win', score: 85, summaryText: `${loc[lang]}` });
          }}
          className="h-11 px-6 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold tactile-btn cursor-pointer"
        >
          {lang === 'ar' ? 'إنهاء وكشف الهوية' : 'Reveal & Finish Round'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 text-center">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>
          {lang === 'ar'
            ? `الجولة ${campaignRound}/${totalCampaignRounds}`
            : `Round ${campaignRound}/${totalCampaignRounds}`}
        </span>
        <div className="flex items-center gap-1">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                if (campaignRound === 1) setTotalCampaignRounds(n);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                totalCampaignRounds === n
                  ? 'bg-[#C84B31] text-white border-[#C84B31]'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28]'
              }`}
            >
              {n} {lang === 'ar' ? 'جولات' : 'rds'}
            </button>
          ))}
        </div>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{campaignScore} pts</span>
      </div>

      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar'
          ? 'مرّر الجهاز ليرى كل لاعب بطاقته سراً، ثم صوّتوا للعميل السري!'
          : 'Pass the device so each player peeks privately, then vote for the Secret Agent!'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {localPlayers.map((pl, idx) => (
          <button
            key={pl}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPeekIdx(peekIdx === idx ? null : idx);
            }}
            className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
              peekIdx === idx
                ? 'bg-[#C84B31] text-white border-[#C84B31]'
                : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
            }`}
          >
            <Eye className="w-4 h-4 mx-auto mb-1" />
            {pl}
          </button>
        ))}
      </div>

      {peekIdx !== null && (
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
          <p className="font-display font-bold text-base text-[#1C1917] dark:text-[#F5F2EB]">
            {peekIdx === localSpyIdx
              ? lang === 'ar'
                ? 'أنت العميل السري!'
                : 'You are the Secret Agent!'
              : `${lang === 'ar' ? 'الموقع السري:' : 'Location:'} ${localLoc[lang]}`}
          </p>
          <button
            type="button"
            onClick={() => setPeekIdx(null)}
            className="mt-2 text-xs text-[#C84B31] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إخفاء البطاقة' : 'Hide Card'}</span>
          </button>
        </div>
      )}

      {roundFeedback && (
        <p className="text-xs font-bold text-[#2B4C7E] dark:text-[#60A5FA]">{roundFeedback}</p>
      )}

      <div className="space-y-2 text-start">
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'اختر المشتبه به النهائي:' : 'Accuse the suspected Agent:'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {localPlayers.map((pl, idx) => (
            <button
              key={pl}
              type="button"
              onClick={() => {
                const caught = idx === localSpyIdx;
                if (caught) soundEngine.playPoint();
                else soundEngine.playError();
                const nextScore = campaignScore + (caught ? 40 : 10);
                setCampaignScore(nextScore);
                onScoreProgress?.(nextScore);
                if (campaignRound >= totalCampaignRounds) {
                  onFinish({
                    outcome: nextScore >= totalCampaignRounds * 25 ? 'win' : 'draw',
                    score: nextScore,
                    summaryText: lang === 'ar'
                      ? `اكتملت ${totalCampaignRounds} جولات (${nextScore} نقطة)`
                      : `Completed ${totalCampaignRounds} rounds (${nextScore} pts)`,
                  });
                } else {
                  setRoundFeedback(
                    lang === 'ar'
                      ? `العميل كان ${localPlayers[localSpyIdx]} (${localLoc.ar})`
                      : `Agent was ${localPlayers[localSpyIdx]} (${localLoc.en})`
                  );
                  setCampaignRound((r) => r + 1);
                  setLocalSpyIdx(Math.floor(Math.random() * 4));
                  setPeekIdx(null);
                }
              }}
              className="h-10 rounded-xl border text-xs font-semibold bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31] text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
            >
              {pl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 22. WHO'S THE LIAR?
 * ============================================================================ */
const LIAR_CLUE_PRESETS: Record<
  string,
  { mainClues: { ar: string[]; en: string[] }; decoyClue: { ar: string; en: string } }
> = {
  Coffee: {
    mainClues: { ar: ['كوب ساخن صباحاً', 'محمص وداكن اللون'], en: ['Morning roasted cup', 'Rich espresso aroma'] },
    decoyClue: { ar: 'أوراق خضراء تُنقع في الماء', en: 'Steeped green leaves' },
  },
  Sun: {
    mainClues: { ar: ['حرارة قوية ظهراً', 'مركز المجموعة الشمسية'], en: ['Blazing noon warmth', 'Star at solar center'] },
    decoyClue: { ar: 'هلال يضيء في منتصف الليل', en: 'Crescent glowing at midnight' },
  },
  Winter: {
    mainClues: { ar: ['برد قارس وملابس ثقيلة', 'ثلوج وأمطار موسمية'], en: ['Freezing chill and heavy coats', 'Snowfall season'] },
    decoyClue: { ar: 'أوراق صفراء تتساقط قبل البرد', en: 'Golden leaves falling before snow' },
  },
  Airplane: {
    mainClues: { ar: ['تحلّق فوق السحاب بأجنحة', 'تقلع من مدرج المطار'], en: ['Flies above clouds with wings', 'Takes off from a runway'] },
    decoyClue: { ar: 'تسير على سكة حديدية طويلة', en: 'Rides smoothly along steel rails' },
  },
  Guitar: {
    mainClues: { ar: ['ستة أوتار وعنق خشبي طويل', 'شائعة في موسيقى الروك'], en: ['Six strings on a fretted neck', 'Popular in acoustic and rock bands'] },
    decoyClue: { ar: 'آلة شرقية بظهر محدب بدون دساتين', en: 'Traditional fretless pear-shaped lute' },
  },
  Desert: {
    mainClues: { ar: ['كثبان رملية ممتدة وجفاف', 'قوافل الجمال والواحات'], en: ['Endless sand dunes and dry heat', 'Caravans and remote oases'] },
    decoyClue: { ar: 'أمواج متكسرة ومظلات صيفية', en: 'Crashing ocean waves and seashells' },
  },
  Football: {
    mainClues: { ar: ['تُلعب بالقدمين داخل ملعب عشبي', 'ركلات ترجيح وحارس مرمى'], en: ['Played with feet on grass pitch', 'Penalty kicks and goalkeeper'] },
    decoyClue: { ar: 'تنطيط الكرة باليد نحو حلقة مرتفعة', en: 'Dribbling by hand toward a high hoop' },
  },
  Lion: {
    mainClues: { ar: ['يُعرف بملك الغابة وزئيره القوي', 'يعيش في مجموعات بالسافانا'], en: ['King of Beasts with big mane', 'Hunts in savanna prides'] },
    decoyClue: { ar: 'فراء مخطط بالأسود والبرتقالي', en: 'Distinctive orange-and-black striped coat' },
  },
  Gold: {
    mainClues: { ar: ['معدن أصفر نفيس لا يصدأ', 'يُستخدم في السبائك والمجوهرات'], en: ['Precious yellow metal that never rusts', 'Stored in bank bullion bars'] },
    decoyClue: { ar: 'معدن أبيض رمادي لامع أقل ثمناً', en: 'Cool grayish-white precious metal' },
  },
  Compass: {
    mainClues: { ar: ['إبرة مغناطيسية تشير للشمال', 'توضع في الجيب لتحديد الاتجاه'], en: ['Magnetic needle pointing North', 'Pocket tool for cardinal directions'] },
    decoyClue: { ar: 'ورقة مطوية تُظهر حدود المدن والطرق', en: 'Folded paper showing roads and cities' },
  },
  Pizza: {
    mainClues: { ar: ['عجينة دائرية بصلصة وجبن ذائب', 'تُقطّع إلى مثلثات ساخنة'], en: ['Baked crust with melted mozzarella', 'Sliced into triangular wedges'] },
    decoyClue: { ar: 'خيوط سباغيتي مسلوقة في قدر', en: 'Boiled noodles tossed in sauce' },
  },
  Chess: {
    mainClues: { ar: ['رقعة ٦٤ مربعاً وملك ووزير', 'تنتهي بكش ملك'], en: ['64-square board with king and queen', 'Ends with checkmate'] },
    decoyClue: { ar: 'أقراص متطابقة تقفز قطرياً فقط', en: 'Identical discs jumping diagonally' },
  },
  Rain: {
    mainClues: { ar: ['قطرات ماء تسقط من الغيوم', 'تترك بركاً وتحتاج مظلة'], en: ['Liquid droplets falling from clouds', 'Leaves puddles and needs an umbrella'] },
    decoyClue: { ar: 'بلورات بيضاء متجمدة تتراكم بصمت', en: 'Soft white crystals piling silently' },
  },
  Museum: {
    mainClues: { ar: ['يعرض تماثيل وآثاراً تاريخية', 'قاعات للوحات والقطع الأثرية'], en: ['Displays ancient artifacts and sculptures', 'Halls of curated paintings and relics'] },
    decoyClue: { ar: 'رفوف طويلة لاستعارة الكتب والمذاكرة', en: 'Quiet shelves for borrowing books' },
  },
};

function buildSoloLiarRound(pair: (typeof LIAR_WORD_PAIRS)[number]) {
  const preset = LIAR_CLUE_PRESETS[pair.main.en] ?? {
    mainClues: { ar: ['تلميح دقيق للكلمة', 'وصف مباشر لها'], en: ['Fits the main word cleanly', 'Clear genuine hint'] },
    decoyClue: { ar: 'وصف يناسب الكلمة البديلة', en: 'Matches the decoy instead' },
  };
  const liarIdx = Math.floor(Math.random() * 3);
  const arList: string[] = [];
  const enList: string[] = [];
  let mainPtr = 0;
  for (let i = 0; i < 3; i++) {
    if (i === liarIdx) {
      arList.push(preset.decoyClue.ar);
      enList.push(preset.decoyClue.en);
    } else {
      arList.push(preset.mainClues.ar[mainPtr]);
      enList.push(preset.mainClues.en[mainPtr]);
      mainPtr++;
    }
  }
  return { pair, clues: { ar: arList, en: enList }, liarIdx };
}

export const GameWhosLiar: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onRoomAction,
  onScoreProgress,
}) => {
  const gs = room?.gameState as {
    seed?: number;
    submissions?: Record<string, { playerName: string; value: string }>;
    votes?: Record<string, string>;
  } | undefined;
  const pairIdx = (gs?.seed ?? Math.floor(Math.random() * 50)) % LIAR_WORD_PAIRS.length;
  const pair = LIAR_WORD_PAIRS[pairIdx];
  const [clueInput, setClueInput] = useState('');

  const soloDeck = useMemo(() => [...LIAR_WORD_PAIRS].sort(() => Math.random() - 0.5).slice(0, 8), []);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [soloRound, setSoloRound] = useState(() => buildSoloLiarRound(soloDeck[0]));

  if (mode === 'online' && room) {
    const myWord = secrets.isImpostor ? pair.decoy[lang] : pair.main[lang];
    const subs = Object.values(gs?.submissions ?? {});
    const votes = gs?.votes ?? {};
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
          <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'كلمتك السرية (قد تكون الكلمة المضللة!)' : 'Your Secret Word'}
          </p>
          <p className="font-display text-2xl font-bold text-[#C84B31] mt-1">{myWord}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clueInput.trim()) return;
            soundEngine.playClick();
            onRoomAction?.({ action: 'party_submit', value: clueInput.trim() });
            setClueInput('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={clueInput}
            onChange={(e) => setClueInput(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب وصفاً مختصراً دون كشف الكلمة...' : 'Write a 1-phrase clue...'}
            className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="space-y-2">
          {subs.map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex justify-between text-xs">
              <strong className="text-[#1C1917] dark:text-[#F5F2EB]">{s.playerName}</strong>
              <span className="text-[#57534E] dark:text-[#B8AFA3]">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {room.players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onRoomAction?.({ action: 'party_vote', targetId: p.id })}
              className={`h-10 rounded-xl border text-xs font-semibold cursor-pointer ${
                votes[playerId] === p.id
                  ? 'bg-[#C84B31] text-white'
                  : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              {p.name} ({Object.values(votes).filter((v) => v === p.id).length})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onFinish({ outcome: 'win', score: 80, summaryText: `${pair.main[lang]} vs ${pair.decoy[lang]}` })}
          className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'كشف الكذاب' : 'Reveal Liar'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{roundIdx + 1}/{soloDeck.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>
      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{lang === 'ar' ? 'الكلمة الرئيسية:' : 'Main Word:'}</p>
        <p className="font-display text-2xl font-bold text-[#C84B31]">{soloRound.pair.main[lang]}</p>
      </div>
      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar' ? 'من صاحب التلميح المريب؟' : 'Which speaker holds the decoy word?'}
      </p>
      <div className="space-y-2.5 text-start">
        {soloRound.clues[lang].map((clue, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const win = idx === soloRound.liarIdx;
              const nextScore = win ? score + 22 : score;
              if (win) {
                soundEngine.playPoint();
                setScore(nextScore);
                onScoreProgress?.(nextScore);
              } else {
                soundEngine.playError();
              }
              if (roundIdx + 1 >= soloDeck.length) {
                onFinish({
                  outcome: nextScore >= 100 ? 'win' : 'draw',
                  score: nextScore,
                  summaryText: `${nextScore} pts`,
                });
              } else {
                const nextIdx = roundIdx + 1;
                setRoundIdx(nextIdx);
                setSoloRound(buildSoloLiarRound(soloDeck[nextIdx]));
              }
            }}
            className="w-full p-4 rounded-xl bg-white dark:bg-[#25211D] hover:border-[#C84B31] border border-[#E5DEC9] dark:border-[#342E28] flex items-center justify-between text-sm text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            <span className="font-bold">#{idx + 1}</span>
            <span>{clue}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 23. FORBIDDEN WORD (Taboo Card Challenge)
 * ============================================================================ */
export const GameForbiddenWord: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const deck = useMemo(() => [...TABOO_CARDS].sort(() => Math.random() - 0.5).slice(0, 10), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const card = deck[idx];
  const turnsLeft = deck.length - idx;

  const handleAction = (delta: number) => {
    const nextScore = Math.max(0, score + delta);
    if (delta > 0) soundEngine.playPoint();
    else soundEngine.playError();
    setScore(nextScore);
    onScoreProgress?.(nextScore);

    if (idx + 1 >= deck.length) {
      onFinish({
        outcome: nextScore >= 100 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `بطاقات متبقية: ${turnsLeft}/${deck.length}` : `Cards left: ${turnsLeft}/${deck.length}`}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border-2 border-[#E5DEC9] dark:border-[#342E28] space-y-4">
        <h2 className="font-display text-3xl font-extrabold text-[#C84B31]">{card.word[lang]}</h2>
        <div className="border-t border-[#E5DEC9] dark:border-[#342E28] pt-3 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'كلمات ممنوعة' : 'Forbidden Words'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {card.forbidden[lang].map((fw) => (
              <div
                key={fw}
                className="py-1.5 px-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold"
              >
                {fw}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleAction(-10)}
          className="h-11 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خالفت (-10)' : 'Foul (-10)'}
        </button>
        <button
          type="button"
          onClick={() => handleAction(0)}
          className="h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'تخطي' : 'Skip'}
        </button>
        <button
          type="button"
          onClick={() => handleAction(25)}
          className="h-11 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خُمّنت (+25)' : 'Guessed (+25)'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 24. WHO AM I? (Clue-by-Clue Character Guess)
 * ============================================================================ */
export const GameWhoAmI: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const deck = useMemo(() => [...WHO_AM_I_CARDS].sort(() => Math.random() - 0.5), []);
  const [idx, setIdx] = useState(0);
  const [cluesShown, setCluesShown] = useState(1);
  const [score, setScore] = useState(0);
  const card = deck[idx];

  const handleGuess = (optIdx: number) => {
    const correct = optIdx === card.answerIndex;
    const bonus = correct ? Math.max(20, 45 - cluesShown * 10) : 0;
    const nextScore = score + bonus;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= deck.length) {
      onFinish({
        outcome: nextScore >= 140 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
      setCluesShown(1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{deck.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2.5">
        {card.clues[lang].slice(0, cluesShown).map((cl, i) => (
          <p key={i} className="text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB]">
            • {cl}
          </p>
        ))}
        {cluesShown < card.clues[lang].length && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setCluesShown((c) => c + 1);
            }}
            className="text-xs font-semibold text-[#C84B31] cursor-pointer"
          >
            {lang === 'ar' ? '+ كشف تلميح إضافي' : '+ Reveal next clue'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {card.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleGuess(i)}
            className="h-12 px-4 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 25. TWO TRUTHS AND A LIE
 * ============================================================================ */
export const GameTwoTruthsLie: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const card = TWO_TRUTHS_SOLO_BANK[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === card.lieIndex;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    window.setTimeout(() => {
      if (idx + 1 >= TWO_TRUTHS_SOLO_BANK.length) {
        onFinish({
          outcome: nextScore >= 125 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((v) => v + 1);
        setPicked(null);
      }
    }, 1100);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{TWO_TRUTHS_SOLO_BANK.length}</span>
        <span>{lang === 'ar' ? 'اكتشف الجملة الكاذبة!' : 'Spot the single LIE!'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="space-y-2.5">
        {card.statements[lang].map((st, i) => {
          let cls = 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]';
          if (picked !== null) {
            if (i === card.lieIndex) cls = 'bg-[#2D6A4F] text-white border-[#2D6A4F]';
            else if (i === picked) cls = 'bg-red-600 text-white border-red-600';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`w-full p-4 rounded-2xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] text-center">{card.explanation[lang]}</p>
      )}
    </div>
  );
};

/* ============================================================================
 * 26. GUESS AUTHOR (Who Wrote It?)
 * ============================================================================ */
export const GameGuessAuthor: React.FC<GameProps> = ({
  lang,
  mode,
  room,
  onFinish,
  onRoomAction,
  onScoreProgress,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [soloIdx, setSoloIdx] = useState(0);
  const [soloScore, setSoloScore] = useState(0);

  const soloPrompts = useMemo(
    () => [
      {
        prompt: { ar: 'أغرب عذر للتأخر عن الاجتماع؟', en: 'Weirdest excuse for being late to a meetup?' },
        entries: [
          { author: { ar: 'سارة', en: 'Sara' }, text: { ar: 'علقت في مصعد يحمل كعكة زفاف', en: 'Got stuck in an elevator with a wedding cake' } },
          { author: { ar: 'كريم (مخترع الساعات)', en: 'Karim (Gadget Geek)' }, text: { ar: 'نسيت شحن حذائي الذكي وتوقف عداد خطواتي', en: 'Forgot to charge my smart shoes' } },
          { author: { ar: 'ندى', en: 'Nada' }, text: { ar: 'تتبعت قطاً يشبه قطي عشر دقائق', en: 'Followed a lookalike cat for ten minutes' } },
        ],
        targetIdx: 1,
      },
      {
        prompt: { ar: 'ما سر شربك للقهوة يومياً؟', en: 'Secret reason you drink coffee every morning?' },
        entries: [
          { author: { ar: 'عمر', en: 'Omar' }, text: { ar: 'لأتذكر أين وضعت مفاتيحي الليلة الماضية', en: 'To remember where I dropped my keys last night' } },
          { author: { ar: 'ليلى (أمينة مكتبة)', en: 'Layla (Librarian)' }, text: { ar: 'لأن الصمت في السادسة صباحاً يحتاج رفيقاً دافئاً', en: 'Because 6 AM silence deserves a warm reading companion' } },
          { author: { ar: 'باسل', en: 'Basel' }, text: { ar: 'لأسبق زملائي في سباق الجري', en: 'To outrun coworkers to the elevator' } },
        ],
        targetIdx: 1,
      },
      {
        prompt: { ar: 'أول قرار لو امتلكت جزيرة خاصة؟', en: 'First rule if you owned a private island?' },
        entries: [
          { author: { ar: 'زياد (مهووس ألعاب)', en: 'Ziyad (Gamer)' }, text: { ar: 'ممنوع الهواتف — طاولات شطرنج ومجلس لعب فقط', en: 'No phones — 24/7 parlor tables and chess only' } },
          { author: { ar: 'ريم', en: 'Reem' }, text: { ar: 'تخصيص حديقة للقطط فقط', en: 'Open a sanctuary strictly for kittens' } },
          { author: { ar: 'طارق', en: 'Tariq' }, text: { ar: 'بناء منارة مضيئة للأصدقاء', en: 'Build a tall lighthouse to guide friends in' } },
        ],
        targetIdx: 0,
      },
      {
        prompt: { ar: 'ما أغرب موهبة خفية لديك؟', en: 'Strangest hidden talent you secretly have?' },
        entries: [
          { author: { ar: 'أمل', en: 'Amal' }, text: { ar: 'أميّز نوع الشاي من رائحته في ٣ ثوانٍ', en: 'Identify tea leaves blindfolded in 3 seconds' } },
          { author: { ar: 'فهد (صاحب الطرائف)', en: 'Fahad (Prankster)' }, text: { ar: 'أقلّد صوت رسالة التنبيه ليفتح الجميع هواتفهم', en: 'Imitate notification chimes so everyone checks their phone' } },
          { author: { ar: 'نور', en: 'Noor' }, text: { ar: 'أرسم دوائر مثالية دون فرجار', en: 'Draw freehand perfect circles without a compass' } },
        ],
        targetIdx: 1,
      },
      {
        prompt: { ar: 'لو تكلم كتابك المفضل، ماذا سيقول لك؟', en: 'If your favorite book could talk, what would it say?' },
        entries: [
          { author: { ar: 'هند', en: 'Hind' }, text: { ar: 'كفى استخداماً لفواصل الكتب العشوائية!', en: 'Stop using random receipts as bookmarks!' } },
          { author: { ar: 'ماجد (عاشق سفر)', en: 'Majed (Traveler)' }, text: { ar: 'ضعني في حقيبة القطار هذه المرة أيضاً', en: 'Pack me inside the train bag again this Friday!' } },
          { author: { ar: 'سلمى', en: 'Salma' }, text: { ar: 'توقّف عن قراءة الفصل الأخير أولاً', en: 'Stop peeking at the final chapter first!' } },
        ],
        targetIdx: 1,
      },
      {
        prompt: { ar: 'أطرف موقف حدث معك في السوبرماركت؟', en: 'Funniest moment you had at a grocery store?' },
        entries: [
          { author: { ar: 'وليد (شارد الذهن)', en: 'Waleed (Daydreamer)' }, text: { ar: 'دفعت عربة شخص آخر لممرين قبل أن أنتبه', en: 'Pushed a stranger’s cart two aisles before noticing' } },
          { author: { ar: 'دانة', en: 'Dana' }, text: { ar: 'اشتريت ٦ أكياس ملح ظناً أنه سكر', en: 'Bought 6 bags of salt thinking it was sugar' } },
          { author: { ar: 'راشد', en: 'Rashid' }, text: { ar: 'نسيت قائمة المشتريات على الطاولة بالمنزل', en: 'Left the shopping list taped to my fridge' } },
        ],
        targetIdx: 0,
      },
      {
        prompt: { ar: 'ما هي القوة الخارقة التي تختارها ليوم واحد؟', en: 'What superpower would you pick for just one day?' },
        entries: [
          { author: { ar: 'جود', en: 'Joud' }, text: { ar: 'الانتقال اللحظي لتجنب زحام الصباح', en: 'Teleportation to skip morning traffic completely' } },
          { author: { ar: 'حسام', en: 'Hussam' }, text: { ar: 'التحدث مع الطيور ومعرفة أسرار السفر', en: 'Speaking with migrating birds for travel tips' } },
          { author: { ar: 'مريم (منظمة)', en: 'Mariam (Organizer)' }, text: { ar: 'إيقاف الزمن ساعتين لإنجاز كل المهام بهدوء', en: 'Pausing time two hours to organize every shelf calmly' } },
        ],
        targetIdx: 2,
      },
      {
        prompt: { ar: 'نصيحة ذهبية لا تنساها عند اللعب؟', en: 'Golden table rule you never break while playing?' },
        entries: [
          { author: { ar: 'أنس (لاعب استراتيجي)', en: 'Anas (Strategist)' }, text: { ar: 'راقب هدوء المنافسين قبل أن تتحرك خطوتك التالية', en: 'Read table silence carefully before committing your move' } },
          { author: { ar: 'تالا', en: 'Tala' }, text: { ar: 'لا تضحك عندما تمسك ببطاقة العميل السري', en: 'Never grin when drawing the spy card' } },
          { author: { ar: 'سيف', en: 'Saif' }, text: { ar: 'احتفظ بأفضل ورقة للجولة الأخيرة دائماً', en: 'Save your strongest card for the final round' } },
        ],
        targetIdx: 0,
      },
    ],
    []
  );

  if (mode === 'online' && room) {
    const subs = Object.values((room.gameState.submissions as Record<string, { playerName: string; value: string }>) ?? {});
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
          <p className="font-display font-bold text-base text-[#1C1917] dark:text-[#F5F2EB]">
            {lang === 'ar' ? 'اكتب إجابة سريعة وطريفة:' : 'Write a witty secret response:'}
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!answerText.trim()) return;
              soundEngine.playClick();
              onRoomAction?.({ action: 'party_submit', value: answerText.trim() });
              setSubmitted(true);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="flex-1 h-11 px-3 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
            />
            <button type="submit" className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer">
              {lang === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            {subs.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                “{s.value}”
              </div>
            ))}
            <button
              type="button"
              onClick={() => onFinish({ outcome: 'win', score: 85, summaryText: `${subs.length} responses` })}
              className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'ar' ? 'كشف المؤلفين وإنهاء الجولة' : 'Reveal Authors & Finish'}
            </button>
          </div>
        )}
      </div>
    );
  }

  const sp = soloPrompts[soloIdx];
  const targetEntry = sp.entries[sp.targetIdx];

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{soloIdx + 1}/{soloPrompts.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{soloScore} pts</span>
      </div>
      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p className="text-xs text-[#C84B31] font-semibold mb-1">{sp.prompt[lang]}</p>
        <p className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          “{targetEntry.text[lang]}”
        </p>
      </div>
      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar' ? 'خمّن من كتب هذه الإجابة:' : 'Guess who wrote this quote:'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {sp.entries.map((entry, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const win = idx === sp.targetIdx;
              const nextScore = win ? soloScore + 25 : soloScore;
              if (win) {
                soundEngine.playPoint();
                setSoloScore(nextScore);
                onScoreProgress?.(nextScore);
              } else {
                soundEngine.playError();
              }
              if (soloIdx + 1 >= soloPrompts.length) {
                onFinish({
                  outcome: nextScore >= 100 ? 'win' : 'draw',
                  score: nextScore,
                  summaryText: `${nextScore} pts`,
                });
              } else {
                setSoloIdx((v) => v + 1);
              }
            }}
            className="min-h-12 px-3 py-2 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            {entry.author[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 27. WEIRD TRANSLATOR (All 10 Idioms)
 * ============================================================================ */
export const GameWeirdTranslator: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const q = WEIRD_TRANSLATOR_BANK[idx];

  const handlePick = (optIdx: number) => {
    const correct = optIdx === q.answerIndex;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= WEIRD_TRANSLATOR_BANK.length) {
      onFinish({
        outcome: nextScore >= 125 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{WEIRD_TRANSLATOR_BANK.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
        <p className="font-display text-xl font-bold text-[#C84B31]">{q.weird[lang]}</p>
      </div>

      <div className="space-y-2.5">
        {q.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
            className="w-full p-3.5 rounded-xl bg-white dark:bg-[#25211D] hover:border-[#C84B31] border border-[#E5DEC9] dark:border-[#342E28] text-start text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 28. FINISH THE STORY
 * ============================================================================ */
const STORY_CHAPTERS = [
  { ar: 'الفصل ١: بداية الرحلة أو الاكتشاف', en: 'Chapter 1: Opening discovery' },
  { ar: 'الفصل ٢: أول عقبة غير متوقعة', en: 'Chapter 2: First unexpected obstacle' },
  { ar: 'الفصل ٣: ظهور شخصية أو تلميح مفاجئ', en: 'Chapter 3: Surprise character or clue' },
  { ar: 'الفصل ٤: ذروة الحدث والمواجهة', en: 'Chapter 4: Turning-point climax' },
  { ar: 'الفصل ٥: الخاتمة الذكية للقصة', en: 'Chapter 5: Clever finale' },
];

export const GameFinishStory: React.FC<GameProps> = ({
  lang,
  mode,
  playerName,
  room,
  onFinish,
  onRoomAction,
}) => {
  const starter =
    lang === 'ar'
      ? 'في منتصف الليل، اهتزت خريطة قديمة على الطاولة وظهر سهم متوهج يشير نحو...'
      : 'At midnight, an old parchment map vibrated on the parlor table and pointed toward...';
  const [localLines, setLocalLines] = useState<{ author: string; text: string }[]>([
    { author: lang === 'ar' ? 'الراوي' : 'Narrator', text: starter },
  ]);
  const [lineInput, setLineInput] = useState('');

  const onlineEntries =
    mode === 'online' && room
      ? ((room.gameState.storyEntries as { playerName: string; text: string }[]) ?? [])
      : null;

  const lines = onlineEntries
    ? [{ author: lang === 'ar' ? 'الراوي' : 'Narrator', text: starter }, ...onlineEntries.map((e) => ({ author: e.playerName, text: e.text }))]
    : localLines;

  const chapterCount = Math.min(5, Math.max(0, lines.length - 1));
  const nextChapter = STORY_CHAPTERS[Math.min(chapterCount, STORY_CHAPTERS.length - 1)];

  const addLine = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lineInput.trim();
    if (!clean) return;
    soundEngine.playPoint();
    setLineInput('');
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'party_story_append', text: clean });
    } else {
      setLocalLines((prev) => [...prev, { author: playerName, text: clean }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{nextChapter[lang]}</span>
        <span className="font-mono-tabular text-[#C84B31]">{chapterCount}/5</span>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2.5 max-h-64 overflow-y-auto">
        {lines.map((item, idx) => (
          <div key={idx} className="text-sm leading-relaxed">
            <span className="font-bold text-[#C84B31] me-2">{item.author}:</span>
            <span className="text-[#1C1917] dark:text-[#F5F2EB]">{item.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={addLine} className="flex gap-2">
        <input
          type="text"
          value={lineInput}
          onChange={(e) => setLineInput(e.target.value)}
          placeholder={lang === 'ar' ? 'أضف جملة جديدة لتكملة الفصل...' : 'Add the next chapter sentence...'}
          className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'أضف' : 'Append'}</span>
        </button>
      </form>

      <button
        type="button"
        disabled={lines.length < 2}
        onClick={() =>
          onFinish({
            outcome: 'win',
            score: Math.min(160, 40 + chapterCount * 24),
            summaryText: lang === 'ar' ? `قصة جماعية من ${lines.length} فقرات!` : `Co-authored a ${lines.length}-part story!`,
          })
        }
        className="w-full h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-sm font-semibold cursor-pointer"
      >
        {lang === 'ar' ? 'نشر القصة وإنهاء الجولة' : 'Publish Story & Finish'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 29. WOULD YOU RATHER?
 * ============================================================================ */
export const GameWouldYouRather: React.FC<GameProps> = ({
  lang,
  mode,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const q = WOULD_YOU_RATHER_BANK[idx];

  const choose = (side: 'a' | 'b') => {
    if (picked) return;
    setPicked(side);
    soundEngine.playPoint();
    if (mode === 'online' && room) {
      onRoomAction?.({ action: 'party_vote', targetId: side });
    }
    const nextScore = score + 25;
    setScore(nextScore);

    window.setTimeout(() => {
      if (idx + 1 >= WOULD_YOU_RATHER_BANK.length) {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 1150);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{WOULD_YOU_RATHER_BANK.length}</span>
        <span>{lang === 'ar' ? 'ماذا تفضل؟' : 'Would You Rather?'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['a', 'b'] as const).map((side) => {
          const pct = side === 'a' ? q.statsA : 100 - q.statsA;
          return (
            <button
              key={side}
              type="button"
              onClick={() => choose(side)}
              className={`p-6 rounded-2xl border-2 text-center space-y-2 tactile-btn cursor-pointer ${
                picked === side
                  ? 'bg-[#C84B31] text-white border-[#C84B31]'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <p className="font-display text-base font-bold">{q[side][lang]}</p>
              {picked && <p className="font-mono-tabular text-xl font-extrabold">{pct}%</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 30. SECRET VOTE
 * ============================================================================ */
export const GameSecretVote: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  playerName,
  room,
  onFinish,
  onRoomAction,
  onScoreProgress,
}) => {
  const TOTAL_BALLOTS = 6;
  const ballots = useMemo(
    () => [...SECRET_VOTE_PROMPTS].sort(() => Math.random() - 0.5).slice(0, TOTAL_BALLOTS),
    []
  );
  const [promptIdx, setPromptIdx] = useState(0);
  const [votedTarget, setVotedTarget] = useState<string | null>(null);
  const [tallyScore, setTallyScore] = useState(0);

  const candidates =
    mode === 'online' && room
      ? room.players.map((p) => ({ id: p.id, name: p.name }))
      : [
          { id: playerId, name: playerName },
          { id: 'c2', name: lang === 'ar' ? 'ليلى' : 'Layla' },
          { id: 'c3', name: lang === 'ar' ? 'عمر' : 'Omar' },
          { id: 'c4', name: lang === 'ar' ? 'سارة' : 'Sara' },
        ];

  const votes = (mode === 'online' && room ? (room.gameState.votes as Record<string, string>) : undefined) ?? {};
  const prompt = ballots[promptIdx % ballots.length];

  const castVote = (id: string) => {
    soundEngine.playPoint();
    setVotedTarget(id);
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'party_vote', targetId: id });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{promptIdx + 1}/{ballots.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{tallyScore} pts</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <Vote className="w-6 h-6 text-[#C84B31] mx-auto mb-2" />
        <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {prompt[lang]}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {candidates.map((c) => {
          const count = Object.values(votes).filter((v) => v === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => castVote(c.id)}
              className={`p-4 rounded-xl border-2 text-sm font-bold flex items-center justify-between cursor-pointer ${
                votedTarget === c.id
                  ? 'bg-[#C84B31] text-white border-[#C84B31]'
                  : 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <span>{c.name}</span>
              {mode === 'online' && <span className="font-mono-tabular">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        {promptIdx + 1 < ballots.length ? (
          <button
            type="button"
            disabled={!votedTarget}
            onClick={() => {
              const nextScore = tallyScore + 25;
              setTallyScore(nextScore);
              onScoreProgress?.(nextScore);
              setPromptIdx((i) => i + 1);
              setVotedTarget(null);
            }}
            className="flex-1 h-11 rounded-xl bg-[#C84B31] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
          >
            {lang === 'ar' ? 'تثبيت والانتقال للسؤال التالي' : 'Lock & Next Ballot'}
          </button>
        ) : (
          <button
            type="button"
            disabled={!votedTarget}
            onClick={() => {
              const finalScore = tallyScore + 25;
              onFinish({
                outcome: 'win',
                score: finalScore,
                summaryText: lang === 'ar' ? `اكتمل التصويت لـ ${ballots.length} أسئلة!` : `Completed ${ballots.length} secret ballots!`,
              });
            }}
            className="flex-1 h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
          >
            {lang === 'ar' ? 'اعتماد النتيجة النهائية' : 'Lock Final Results'}
          </button>
        )}
      </div>
    </div>
  );
};

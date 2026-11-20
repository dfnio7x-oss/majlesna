export interface PatternQuestion {
  sequence: (string | number)[];
  options: (string | number)[];
  answerIndex: number;
  rule: { ar: string; en: string };
}

export const PATTERN_BANK: PatternQuestion[] = [
  {
    sequence: [2, 6, 12, 20, 30, '?'],
    options: [40, 42, 44, 38],
    answerIndex: 1,
    rule: { ar: 'الزيادة تتصاعد بمقدار +4, +6, +8, +10, +12', en: 'Differences increase by +2 each step (+4, +6, +8, +10, +12)' },
  },
  {
    sequence: [3, 9, 27, 81, '?'],
    options: [162, 243, 210, 324],
    answerIndex: 1,
    rule: { ar: 'الضرب في ٣ في كل خطوة', en: 'Multiply by 3 each step' },
  },
  {
    sequence: [1, 1, 2, 3, 5, 8, '?'],
    options: [11, 12, 13, 15],
    answerIndex: 2,
    rule: { ar: 'متتالية فيبوناتشي: مجموع الرقمين السابقين', en: 'Fibonacci: sum of the two previous numbers' },
  },
  {
    sequence: [100, 91, 83, 76, 70, '?'],
    options: [65, 64, 66, 62],
    answerIndex: 0,
    rule: { ar: 'الطرح يتناقص بمقدار 9, 8, 7, 6, 5', en: 'Subtract 9, 8, 7, 6, then 5' },
  },
  {
    sequence: ['▲', '◆', '●', '▲', '◆', '?'],
    options: ['▲', '■', '●', '◆'],
    answerIndex: 2,
    rule: { ar: 'تكرار دوري للثلاثي: مثلث، معين، دائرة', en: 'Repeating 3-shape cycle' },
  },
  {
    sequence: [4, 7, 13, 25, 49, '?'],
    options: [97, 85, 98, 73],
    answerIndex: 0,
    rule: { ar: 'اضرب في ٢ واطرح ١', en: 'Double and subtract 1 each step' },
  },
];

export interface LogicGridScenario {
  title: { ar: string; en: string };
  people: { ar: string; en: string }[];
  items: { ar: string; en: string }[];
  clues: { ar: string[]; en: string[] };
  solution: number[]; // solution[personIdx] = itemIdx
}

export const LOGIC_GRID_SCENARIOS: LogicGridScenario[] = [
  {
    title: { ar: 'مفاتيح الألوان الثلاثة', en: 'The Three Colored Keys' },
    people: [
      { ar: 'ليلى', en: 'Layla' },
      { ar: 'عمر', en: 'Omar' },
      { ar: 'طارق', en: 'Tariq' },
    ],
    items: [
      { ar: 'المفتاح الذهبي', en: 'Golden Key' },
      { ar: 'المفتاح الفضي', en: 'Silver Key' },
      { ar: 'المفتاح النحاسي', en: 'Bronze Key' },
    ],
    clues: {
      ar: [
        'ليلى لا تحمل المفتاح الذهبي ولا النحاسي.',
        'طارق لا يملك المفتاح الذهبي.',
      ],
      en: [
        'Layla holds neither the Golden nor the Bronze key.',
        'Tariq does not hold the Golden key.',
      ],
    },
    solution: [1, 0, 2],
  },
  {
    title: { ar: 'سباق المراكز النهائية', en: 'Final Podium Finishes' },
    people: [
      { ar: 'سارة', en: 'Sara' },
      { ar: 'يوسف', en: 'Youssef' },
      { ar: 'ندى', en: 'Nada' },
    ],
    items: [
      { ar: 'المركز الأول', en: '1st Place' },
      { ar: 'المركز الثاني', en: '2nd Place' },
      { ar: 'المركز الثالث', en: '3rd Place' },
    ],
    clues: {
      ar: [
        'ندى سبقت سارة مباشرة في الترتيب.',
        'يوسف لم يحصل على المركز الثاني ولا الأول.',
      ],
      en: [
        'Nada finished immediately ahead of Sara.',
        'Youssef did not finish 1st or 2nd.',
      ],
    },
    solution: [1, 2, 0],
  },
  {
    title: { ar: 'هوايات المساء', en: 'Evening Pastimes' },
    people: [
      { ar: 'كريم', en: 'Karim' },
      { ar: 'ريم', en: 'Reem' },
      { ar: 'باسل', en: 'Basel' },
    ],
    items: [
      { ar: 'الشطرنج', en: 'Chess' },
      { ar: 'الرسم', en: 'Painting' },
      { ar: 'العود', en: 'Oud Music' },
    ],
    clues: {
      ar: [
        'باسل لا يعزف العود ولا يلعب الشطرنج.',
        'كريم يعشق الألعاب الذهنية الاستراتيجية.',
      ],
      en: [
        'Basel neither plays the Oud nor Chess.',
        'Karim loves strategic board games.',
      ],
    },
    solution: [0, 2, 1],
  },
];

export interface MiniCrosswordPuzzle {
  size: number;
  // '#' means black cell, uppercase letter means solution
  grid: string[][];
  clues: {
    across: { num: number; row: number; col: number; clue: { ar: string; en: string }; answer: string }[];
    down: { num: number; row: number; col: number; clue: { ar: string; en: string }; answer: string }[];
  };
}

export const CROSSWORD_PUZZLES: Record<'ar' | 'en', MiniCrosswordPuzzle[]> = {
  ar: [
    {
      size: 4,
      grid: [
        ['ق', 'م', 'ر', '#'],
        ['ل', '#', 'م', 'د'],
        ['م', 'د', 'ن', '#'],
        ['#', 'ر', 'ا', 'ي'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'جرم يضيء السماء ليلاً', en: 'Moon' }, answer: 'قمر' },
          { num: 3, row: 2, col: 0, clue: { ar: 'جمع مدينة', en: 'Cities' }, answer: 'مدن' },
          { num: 4, row: 3, col: 1, clue: { ar: 'وجهة نظر أو فكرة', en: 'Opinion' }, answer: 'راي' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'أداة للكتابة', en: 'Pen' }, answer: 'قلم' },
          { num: 2, row: 0, col: 2, clue: { ar: 'حبات صغيرة بالصحراء (بدايتها ر)', en: 'Sand prefix / RMNA' }, answer: 'رمنا' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ب', 'ح', 'ر', '#'],
        ['ي', '#', 'ع', 'ل'],
        ['ت', 'م', 'ر', '#'],
        ['#', 'ا', 'د', 'ب'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مسطح مائي واسع ومالح', en: 'Sea' }, answer: 'بحر' },
          { num: 3, row: 2, col: 0, clue: { ar: 'ثمرة النخيل الشهيرة', en: 'Dates' }, answer: 'تمر' },
          { num: 4, row: 3, col: 1, clue: { ar: 'فن الكتابة والشعر والنثر', en: 'Literature' }, answer: 'ادب' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مسكن أو منزل', en: 'House' }, answer: 'بيت' },
          { num: 2, row: 0, col: 2, clue: { ar: 'صوت السماء الممطرة (رعد...)', en: 'Thunder sequence' }, answer: 'رعرد' },
        ],
      },
    },
  ],
  en: [
    {
      size: 4,
      grid: [
        ['S', 'T', 'A', 'R'],
        ['U', '#', 'R', '#'],
        ['N', 'O', 'T', 'E'],
        ['#', 'W', 'S', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'نجم مضيء', en: 'Shining celestial body' }, answer: 'STAR' },
          { num: 3, row: 2, col: 0, clue: { ar: 'ملاحظة مكتوبة', en: 'Written reminder' }, answer: 'NOTE' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'الشمس', en: 'Daytime star' }, answer: 'SUN' },
          { num: 2, row: 0, col: 2, clue: { ar: 'الفنون', en: 'Creative craft (singular/plural)' }, answer: 'ARTS' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['G', 'A', 'M', 'E'],
        ['O', '#', 'A', '#'],
        ['L', 'I', 'P', 'S'],
        ['D', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'لعبة', en: 'Playful match' }, answer: 'GAME' },
          { num: 3, row: 2, col: 0, clue: { ar: 'شفاه', en: 'Edges of a cup or mouth' }, answer: 'LIPS' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'معدن نفيس', en: 'Precious yellow metal' }, answer: 'GOLD' },
          { num: 2, row: 0, col: 2, clue: { ar: 'خريطة', en: 'Atlas chart' }, answer: 'MAP' },
        ],
      },
    },
  ],
};

export interface WordSearchSpec {
  grid: string[][];
  words: string[];
}

export const WORD_SEARCH_BANK: Record<'ar' | 'en', WordSearchSpec> = {
  ar: {
    grid: [
      ['ق', 'ل', 'م', 'س', 'ف', 'ر'],
      ['م', 'ب', 'ح', 'ر', 'و', 'ق'],
      ['ر', 'ك', 'ت', 'ا', 'ب', 'م'],
      ['ش', 'م', 'س', 'ل', 'ي', 'ر'],
      ['ج', 'ب', 'ل', 'ن', 'ج', 'م'],
      ['و', 'ر', 'د', 'ة', 'ع', 'ل'],
    ],
    words: ['قلم', 'بحر', 'كتاب', 'شمس', 'جبل', 'نجم'],
  },
  en: {
    grid: [
      ['P', 'L', 'A', 'N', 'E', 'T'],
      ['U', 'G', 'A', 'M', 'E', 'S'],
      ['Z', 'O', 'C', 'E', 'A', 'N'],
      ['Z', 'L', 'S', 'T', 'A', 'R'],
      ['L', 'D', 'W', 'O', 'R', 'D'],
      ['E', 'F', 'I', 'R', 'E', 'S'],
    ],
    words: ['PLANET', 'GAMES', 'OCEAN', 'STAR', 'WORD', 'PUZZLE'],
  },
};

export const TYPING_SENTENCES: Record<'ar' | 'en', string[]> = {
  ar: [
    'مجلسنا يجمع الاصدقاء في تحديات ذكاء وسرعة ممتعة',
    'التعاون والتركيز يصنعان الفارق في كل جولة حاسمة',
    'السرعة دون دقة لا تكفي لحسم لقب البطولة الليلة',
    'احفظ النمط وحل الشفرة قبل ان ينفد مؤقت الجولة',
  ],
  en: [
    'Sharp focus and steady speed turn close matches into victories',
    'Friends gather in the parlor room to test wit and reflexes',
    'Every puzzle rewards calm deduction under a ticking clock',
    'Clear thinking always beats hurried guesswork at the table',
  ],
};

export const SPY_LOCATIONS: { ar: string; en: string }[] = [
  { ar: 'مطار دولي', en: 'International Airport' },
  { ar: 'سفينة سياحية', en: 'Cruise Ship' },
  { ar: 'متحف آثار', en: 'History Museum' },
  { ar: 'مقهى تراثي', en: 'Heritage Café' },
  { ar: 'محطة فضاء', en: 'Space Station' },
  { ar: 'غواصة أعماق', en: 'Deep-Sea Submarine' },
  { ar: 'مكتبة مركزية', en: 'Central Library' },
  { ar: 'ملعب كرة قدم', en: 'Football Stadium' },
];

export const LIAR_WORD_PAIRS: { main: { ar: string; en: string }; decoy: { ar: string; en: string } }[] = [
  { main: { ar: 'القهوة', en: 'Coffee' }, decoy: { ar: 'الشاي', en: 'Tea' } },
  { main: { ar: 'الشمس', en: 'Sun' }, decoy: { ar: 'القمر', en: 'Moon' } },
  { main: { ar: 'الشتاء', en: 'Winter' }, decoy: { ar: 'الخريف', en: 'Autumn' } },
  { main: { ar: 'الطائرة', en: 'Airplane' }, decoy: { ar: 'القطار', en: 'Train' } },
  { main: { ar: 'الجيتار', en: 'Guitar' }, decoy: { ar: 'العود', en: 'Oud' } },
];

export const TABOO_CARDS: {
  word: { ar: string; en: string };
  forbidden: { ar: string[]; en: string[] };
}[] = [
  {
    word: { ar: 'القمر', en: 'Moon' },
    forbidden: { ar: ['سماء', 'ليل', 'فضاء', 'شمس'], en: ['Night', 'Sky', 'Space', 'Sun'] },
  },
  {
    word: { ar: 'القهوة', en: 'Coffee' },
    forbidden: { ar: ['كوب', 'صباح', 'مقاهي', 'شرب'], en: ['Cup', 'Morning', 'Cafe', 'Drink'] },
  },
  {
    word: { ar: 'البوصلة', en: 'Compass' },
    forbidden: { ar: ['شمال', 'اتجاه', 'خريطة', 'إبرة'], en: ['North', 'Direction', 'Map', 'Needle'] },
  },
  {
    word: { ar: 'السينما', en: 'Cinema' },
    forbidden: { ar: ['فيلم', 'شاشة', 'فشار', 'تذكرة'], en: ['Movie', 'Screen', 'Popcorn', 'Ticket'] },
  },
  {
    word: { ar: 'الثلج', en: 'Snow' },
    forbidden: { ar: ['بارد', 'أبيض', 'شتاء', 'مطر'], en: ['Cold', 'White', 'Winter', 'Rain'] },
  },
  {
    word: { ar: 'الشطرنج', en: 'Chess' },
    forbidden: { ar: ['ملك', 'رقعة', 'أبيض', 'أسود'], en: ['King', 'Board', 'Checkmate', 'Pawn'] },
  },
];

export const WHO_AM_I_CARDS: {
  name: { ar: string; en: string };
  clues: { ar: string[]; en: string[] };
  options: { ar: string[]; en: string[] };
  answerIndex: number;
}[] = [
  {
    name: { ar: 'ألبرت أينشتاين', en: 'Albert Einstein' },
    clues: {
      ar: ['أنا عالم فيزياء شهير', 'وضعت نظرية النسبية', 'فزت بجائزة نوبل عام ١٩٢١'],
      en: ['I am a renowned physicist', 'I formulated relativity', 'I won the 1921 Nobel Prize'],
    },
    options: {
      ar: ['ألبرت أينشتاين', 'إسحاق نيوتن', 'نيكولا تسلا', 'جاليليو'],
      en: ['Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Galileo'],
    },
    answerIndex: 0,
  },
  {
    name: { ar: 'ابن بطوطة', en: 'Ibn Battuta' },
    clues: {
      ar: ['رحالة ومؤرخ شهير', 'ولدت في مدينة طنجة', 'قطعت أكثر من ١١٧ ألف كيلومتر'],
      en: ['I am a famous medieval explorer', 'Born in Tangier', 'Traveled over 117,000 km'],
    },
    options: {
      ar: ['ماركو بولو', 'ابن بطوطة', 'الإدريسي', 'ابن خلدون'],
      en: ['Marco Polo', 'Ibn Battuta', 'Al-Idrisi', 'Ibn Khaldun'],
    },
    answerIndex: 1,
  },
  {
    name: { ar: 'ماري كوري', en: 'Marie Curie' },
    clues: {
      ar: ['رائدة في الفيزياء والكيمياء', 'اكتشفت الراديوم والبولونيوم', 'فزت بجائزتي نوبل في مجالين مختلفين'],
      en: ['Pioneer in physics and chemistry', 'Discovered radium and polonium', 'Won two Nobel Prizes in different sciences'],
    },
    options: {
      ar: ['روزاليند فرانكلين', 'آدا لوفليس', 'ماري كوري', 'جريس هوبر'],
      en: ['Rosalind Franklin', 'Ada Lovelace', 'Marie Curie', 'Grace Hopper'],
    },
    answerIndex: 2,
  },
];

export const TWO_TRUTHS_SOLO_BANK: {
  statements: { ar: string[]; en: string[] };
  lieIndex: number;
  explanation: { ar: string; en: string };
}[] = [
  {
    statements: {
      ar: ['للأخطبوط ثلاثة قلوب تضخ الدم', 'العسل الطبيعي لا يفسد بمرور السنين', 'الزرافة تملك ٢٠ فقرة في رقبتها'],
      en: ['An octopus has three hearts', 'Natural honey never spoils easily', 'A giraffe has 20 neck vertebrae'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الزرافة تملك ٧ فقرات عنقية فقط مثل الإنسان ولكنها طويلة جداً!',
      en: 'Giraffes actually have only 7 neck vertebrae, just elongated!',
    },
  },
  {
    statements: {
      ar: ['كوكب الزهرة يدور بعكس اتجاه معظم الكواكب', 'برج إيفل يتمدد صيفاً بضعة سنتيمترات', 'الصوت ينتقل في الفراغ أسرع من الماء'],
      en: ['Venus rotates opposite most planets', 'The Eiffel Tower grows taller in summer heat', 'Sound travels faster in vacuum than in water'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الصوت موجة ميكانيكية لا ينتقل في الفراغ إطلاقاً!',
      en: 'Sound cannot travel in a vacuum at all!',
    },
  },
  {
    statements: {
      ar: ['الموز ينتمي علمياً لعائلة التوتيات', 'البطريق يطير مسافات قصيرة شتاءً', 'أسنان القرش تتجدد باستمرار'],
      en: ['Bananas are botanically classified as berries', 'Penguins fly short distances in winter', 'Shark teeth regenerate throughout life'],
    },
    lieIndex: 1,
    explanation: {
      ar: 'البطاريق طيور غير قادرة على الطيران بل بارعة في السباحة.',
      en: 'Penguins are completely flightless birds built for swimming.',
    },
  },
];

export const WEIRD_TRANSLATOR_BANK: {
  weird: { ar: string; en: string };
  options: { ar: string[]; en: string[] };
  answerIndex: number;
}[] = [
  {
    weird: {
      ar: '«سقوط قطط وكلاب من السقف السماوي»',
      en: '"Precipitation of felines and canines from overhead"',
    },
    options: {
      ar: ['تمطر بغزارة شديدة', 'الحديقة مزدحمة بالحيوانات', 'انكسرت نافذة المنزل', 'الجو صافٍ وهادئ'],
      en: ['It is raining heavily', 'The park is full of pets', 'A window cracked open', 'Clear evening breeze'],
    },
    answerIndex: 0,
  },
  {
    weird: {
      ar: '«لا تقم بعدّ الدواجن قبل خروجها من الكالسيوم البيضاوي»',
      en: '"Avoid tallying poultry prior to shell exit"',
    },
    options: {
      ar: ['لا تستعجل النتائج قبل أوانها', 'الطبخ يحتاج وقتاً أطول', 'تنظيف المزرعة صباحاً', 'البيض غالي الثمن'],
      en: ["Don't count your chickens before they hatch", 'Cook slowly at dawn', 'Clean the barn early', 'Fresh eggs taste great'],
    },
    answerIndex: 0,
  },
  {
    weird: {
      ar: '«طائر واحد في قبضة اليد يساوي طائرين فوق الغصن الخشبي»',
      en: '"A single avian specimen in palm outweighs dual arboreal flyers"',
    },
    options: {
      ar: ['السفر بالقطار أسرع', 'عصفور في اليد خير من عشرة على الشجرة', 'الأشجار تطول صيفاً', 'الهدوء يصنع المعجزات'],
      en: ['A bird in the hand is worth two in the bush', 'Trains run faster than bikes', 'Trees bloom in spring', 'Silence builds wisdom'],
    },
    answerIndex: 0,
  },
];

export const WOULD_YOU_RATHER_BANK: { a: { ar: string; en: string }; b: { ar: string; en: string }; statsA: number }[] = [
  {
    a: { ar: 'السفر عبر الزمن للماضي', en: 'Travel 200 years into the past' },
    b: { ar: 'الانتقال مباشرة للمستقبل', en: 'Jump 200 years into the future' },
    statsA: 42,
  },
  {
    a: { ar: 'القدرة على التحدث بكل لغات العالم', en: 'Speak every human language fluently' },
    b: { ar: 'التواصل وفهم لغة الحيوانات', en: 'Understand and talk with animals' },
    statsA: 64,
  },
  {
    a: { ar: 'العيش في كوخ مطل على الجبال الثلجية', en: 'Live in a snowy mountain cabin' },
    b: { ar: 'العيش في منزل خشبي على جزيرة دافئة', en: 'Live in an oceanfront island cottage' },
    statsA: 37,
  },
  {
    a: { ar: 'ذاكرة فائقة لا تنسى أي تفصيل', en: 'Photographic memory of everything' },
    b: { ar: 'القدرة على قراءة النوايا أثناء اللعب', en: 'Read table bluffs effortlessly' },
    statsA: 58,
  },
];

export const SECRET_VOTE_PROMPTS: { ar: string; en: string }[] = [
  { ar: 'من الأكثر هدوءاً تحت ضغط المؤقت؟', en: 'Who stays calmest under timer pressure?' },
  { ar: 'من يمتلك أفضل خدعة تمويه في المافيا؟', en: 'Who pulls off the cleanest bluff in Mafia?' },
  { ar: 'من أول من سيقود الفريق لو ضلّ الطريق؟', en: 'Who would lead the team if everyone got lost?' },
  { ar: 'من صاحب أسرع بديهة في الجولات السريعة؟', en: 'Who has the sharpest reflexes on game night?' },
];

export const SONG_CLUE_BANK: {
  description: { ar: string; en: string };
  hint: { ar: string; en: string };
  options: { ar: string[]; en: string[] };
  answerIndex: number;
}[] = [
  {
    description: {
      ar: 'أغنية كلاسيكية تحكي عن الطيران إلى سطح القمر واللعب بين النجوم بموسيقى الجاز الدافئة.',
      en: 'A timeless jazz standard inviting someone to soar past the stars to the moon.',
    },
    hint: { ar: 'بصوت فرانك سيناترا (١٩٦٤)', en: 'Frank Sinatra (1964)' },
    options: {
      ar: ['Fly Me to the Moon', 'Imagine', 'Yesterday', 'Bohemian Rhapsody'],
      en: ['Fly Me to the Moon', 'Imagine', 'Yesterday', 'Bohemian Rhapsody'],
    },
    answerIndex: 0,
  },
  {
    description: {
      ar: 'تحفة عربية خالدة تبدأ بمناجاة الحنين في الليل وتستحضر ذكريات الحب الخالد بصوت كوكب الشرق.',
      en: 'Legendary Arabic classical masterpiece longing for reunion under the night sky.',
    },
    hint: { ar: 'من روائع أم كلثوم ومحمد عبد الوهاب', en: 'Umm Kulthum & Mohammed Abdel Wahab' },
    options: {
      ar: ['ألف ليلة وليلة', 'إنت عمري', 'سهر الليالي', 'نسم علينا الهوى'],
      en: ['Alf Leila wa Leila', 'Enta Omri', 'Sahar El Layali', 'Nassayem'],
    },
    answerIndex: 1,
  },
  {
    description: {
      ar: 'نشيد صباحي عذب بصوت فيروز يتحدث عن نسيم الهواء القادم من الوادي مع إشراقة الفجر.',
      en: 'Iconic Levantine morning ballad greeting the cool mountain breeze.',
    },
    hint: { ar: 'أيقونة فيروز والرحابنة', en: 'Fairuz & Rahbani Brothers' },
    options: {
      ar: ['نسم علينا الهوى', 'حبيتك بالصيف', 'قدك المياس', 'الأطلال'],
      en: ['Nassam Alayna El Hawa', 'Habbaytak Bel Sayf', 'Qadduka Al Mayyas', 'Al Atlal'],
    },
    answerIndex: 0,
  },
  {
    description: {
      ar: 'أغنية روك ملحمية تفتتح بالبيانو وتندمج فيها الأوبرا والجيتار في رحلة درامية من ست دقائق.',
      en: 'Six-minute rock opera blending piano ballad, choral harmonies, and heavy guitar.',
    },
    hint: { ar: 'فرقة Queen (١٩٧٥)', en: 'Queen (1975)' },
    options: {
      ar: ['Hotel California', 'Bohemian Rhapsody', 'Stairway to Heaven', 'Billie Jean'],
      en: ['Hotel California', 'Bohemian Rhapsody', 'Stairway to Heaven', 'Billie Jean'],
    },
    answerIndex: 1,
  },
];

export const MOVIE_EMOJI_BANK: {
  emojis: string;
  hint: { ar: string; en: string };
  options: { ar: string[]; en: string[] };
  answerIndex: number;
}[] = [
  {
    emojis: '🦁👑🌅',
    hint: { ar: 'أفلام رسوم متحركة كلاسيكية في السافانا', en: 'Classic animated savanna royalty' },
    options: {
      ar: ['الأسد الملك (The Lion King)', 'كتاب الأدغال', 'مدغشقر', 'طرزان'],
      en: ['The Lion King', 'The Jungle Book', 'Madagascar', 'Tarzan'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🚢🧊💔',
    hint: { ar: 'دراما تاريخية فوق المحيط الأطلسي', en: 'Historic ocean liner tragedy' },
    options: {
      ar: ['قراصنة الكاريبي', 'تايتانيك (Titanic)', 'العثور على نيمو', 'حياة باي'],
      en: ['Pirates of the Caribbean', 'Titanic', 'Finding Nemo', 'Life of Pi'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🕷️🧑🏙️🕸️',
    hint: { ar: 'بطل خارق في شوارع نيويورك', en: 'Web-slinging New York hero' },
    options: {
      ar: ['باتمان', 'سوبرمان', 'سبايدرمان (Spider-Man)', 'آيرون مان'],
      en: ['Batman', 'Superman', 'Spider-Man', 'Iron Man'],
    },
    answerIndex: 2,
  },
  {
    emojis: '🎈🏠👴🧭',
    hint: { ar: 'منزل يطير بالبالونات إلى أمريكا الجنوبية', en: 'Floating house adventure' },
    options: {
      ar: ['فوق (Up)', 'قصة لعبة', 'البحث عن دوري', 'الداخل إلى الخارج'],
      en: ['Up', 'Toy Story', 'Finding Dory', 'Inside Out'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🚀🕳️⏳🌌',
    hint: { ar: 'رحلة فضائية عبر الثقب الدودي وتمدد الزمن', en: 'Sci-fi wormhole time dilation epic' },
    options: {
      ar: ['المريخي', 'بين النجوم (Interstellar)', 'الجاذبية', 'أبولو ١٣'],
      en: ['The Martian', 'Interstellar', 'Gravity', 'Apollo 13'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🐀👨‍🍳🍲🇫🇷',
    hint: { ar: 'طباخ صغير موهوب في مطعم بباريس', en: 'Tiny culinary genius in Paris' },
    options: {
      ar: ['راتاتوي (Ratatouille)', 'كوكو', 'شريك', 'الباندا كونغ فو'],
      en: ['Ratatouille', 'Coco', 'Shrek', 'Kung Fu Panda'],
    },
    answerIndex: 0,
  },
];

export const EMOJI_RIDDLE_BANK: {
  emojis: string;
  category: { ar: string; en: string };
  options: { ar: string[]; en: string[] };
  answerIndex: number;
}[] = [
  {
    emojis: '⌚⏱️💰',
    category: { ar: 'حكمة شائعة', en: 'Proverb' },
    options: {
      ar: ['الوقت من ذهب', 'المال يشتري كل شيء', 'الساعة المتأخرة', 'سباق مع الزمن'],
      en: ['Time is money', 'Money buys all', 'Late hour', 'Race the clock'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🍕🇮🇹🧀🍅',
    category: { ar: 'أكلة شهيرة', en: 'Cuisine' },
    options: {
      ar: ['باستا بيستو', 'بيتزا مارغريتا', 'لازانيا', 'ريزوتو'],
      en: ['Pasta Pesto', 'Pizza Margherita', 'Lasagna', 'Risotto'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🐪🏜️🔺☀️',
    category: { ar: 'معلم / بلد', en: 'Landmark' },
    options: {
      ar: ['البتراء', 'أهرامات الجيزة', 'برج خليفة', 'وادي رم'],
      en: ['Petra', 'Pyramids of Giza', 'Burj Khalifa', 'Wadi Rum'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🌧️🌈☀️',
    category: { ar: 'ظاهرة طبيعية', en: 'Nature' },
    options: {
      ar: ['عاصفة رملية', 'قوس قزح', 'كسوف الشمس', 'الشفق القطبي'],
      en: ['Sandstorm', 'Rainbow', 'Solar Eclipse', 'Aurora'],
    },
    answerIndex: 1,
  },
  {
    emojis: '📚💡🧠',
    category: { ar: 'مفهوم', en: 'Concept' },
    options: {
      ar: ['العلم نور', 'الرياضة حياة', 'النوم صحة', 'الصبر مفتاح'],
      en: ['Knowledge is light', 'Sport is life', 'Rest is wealth', 'Patience wins'],
    },
    answerIndex: 0,
  },
];

export const STORY_DICE = {
  heroes: {
    ar: ['رحالة فضائي', 'طاهٍ مغامر', 'محقق ذكي', 'عازف عود', 'مخترع شاب'],
    en: ['Space explorer', 'Daring chef', 'Sharp detective', 'Oud musician', 'Young inventor'],
  },
  settings: {
    ar: ['في سوق قديم', 'داخل قطار جبلي', 'على جزيرة عائمة', 'في مكتبة سرية', 'تحت المطر'],
    en: ['in an ancient market', 'aboard a mountain train', 'on a floating island', 'inside a hidden library', 'under heavy rain'],
  },
  twists: {
    ar: ['عثر على خريطة تتكلم', 'انقطعت الكهرباء فجأة', 'فتح باباً نحو القرن الماضي', 'نطق الببغاء بالسر', 'اختفى المفتاح الذهبي'],
    en: ['found a talking map', 'the lights flickered out', 'opened a door to the past', 'a parrot blurted the clue', 'the golden key vanished'],
  },
};

export const ACTING_PROMPTS: { ar: string; en: string }[] = [
  { ar: 'تسلق جبل في عاصفة ثلجية', en: 'Climbing a mountain in a blizzard' },
  { ar: 'محاولة إقناع قط بالنزول عن الطاولة', en: 'Convincing a stubborn cat off the table' },
  { ar: 'قيادة سيارة في زحام شديد', en: 'Driving through rush-hour traffic' },
  { ar: 'طهي وجبة فاخرة مع نسيان الملح', en: 'Cooking a gourmet dish and forgetting salt' },
  { ar: 'السباحة هرباً من سمكة قرش', en: 'Swimming away from a shark' },
  { ar: 'التقاط صورة سيلفي مع رياح قوية', en: 'Taking a selfie in strong wind' },
];

export const SOUND_PROMPTS: { ar: string; en: string; category: { ar: string; en: string } }[] = [
  { ar: 'هدير محرك سيارة سباق', en: 'Race car engine revving', category: { ar: 'مركبات', en: 'Vehicles' } },
  { ar: 'صوت زئير الأسد', en: 'Lion roaring loudly', category: { ar: 'حيوانات', en: 'Animals' } },
  { ar: 'صفير الرياح والمطر الغزير', en: 'Howling wind and heavy rain', category: { ar: 'طبيعة', en: 'Nature' } },
  { ar: 'صوت منبه ساعة قديمة', en: 'Classic mechanical alarm bell', category: { ar: 'أشياء', en: 'Objects' } },
  { ar: 'غردة عصفور عند الفجر', en: 'Dawn songbird chirping', category: { ar: 'حيوانات', en: 'Animals' } },
  { ar: 'فرقعة الفشار في المقلاة', en: 'Popcorn popping in a pan', category: { ar: 'مطبخ', en: 'Kitchen' } },
];

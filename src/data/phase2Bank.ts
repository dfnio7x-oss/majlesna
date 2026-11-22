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
  {
    sequence: [1, 4, 9, 16, 25, '?'],
    options: [30, 34, 36, 49],
    answerIndex: 2,
    rule: { ar: 'مربعات الأعداد الطبيعية (1², 2², 3², 4², 5², 6²)', en: 'Perfect squares: 1², 2², 3², 4², 5², 6²' },
  },
  {
    sequence: [2, 3, 5, 7, 11, 13, '?'],
    options: [15, 17, 19, 16],
    answerIndex: 1,
    rule: { ar: 'الأعداد الأولية المتتالية', en: 'Consecutive prime numbers' },
  },
  {
    sequence: [1, 8, 27, 64, '?'],
    options: [100, 125, 144, 96],
    answerIndex: 1,
    rule: { ar: 'مكعبات الأعداد (1³, 2³, 3³, 4³, 5³)', en: 'Perfect cubes: 1³, 2³, 3³, 4³, 5³' },
  },
  {
    sequence: [64, 32, 16, 8, '?'],
    options: [2, 4, 6, 3],
    answerIndex: 1,
    rule: { ar: 'القسمة على ٢ في كل خطوة', en: 'Divide by 2 each step' },
  },
  {
    sequence: ['■', '■■', '■■■', '■■■■', '?'],
    options: ['■■■■', '■■■■■', '▲▲▲▲▲', '■■■'],
    answerIndex: 1,
    rule: { ar: 'زيادة مربع واحد في كل خطوة', en: 'Add one square each step' },
  },
  {
    sequence: [5, 10, 8, 16, 14, 28, '?'],
    options: [26, 56, 30, 24],
    answerIndex: 0,
    rule: { ar: 'تناوب: ضرب في ٢ ثم طرح ٢', en: 'Alternating rule: ×2 then −2' },
  },
  {
    sequence: [10, 14, 22, 34, 50, '?'],
    options: [68, 70, 66, 74],
    answerIndex: 1,
    rule: { ar: 'الفروق تزيد بمقدار +4 في كل خطوة (+4, +8, +12, +16, +20)', en: 'Differences grow by +4 (+4, +8, +12, +16, +20)' },
  },
  {
    sequence: [128, 120, 111, 101, 90, '?'],
    options: [78, 80, 79, 77],
    answerIndex: 0,
    rule: { ar: 'طرح متزايد: -8, -9, -10, -11, -12', en: 'Subtract 8, 9, 10, 11, then 12' },
  },
  {
    sequence: [2, 5, 11, 23, 47, '?'],
    options: [94, 95, 91, 99],
    answerIndex: 1,
    rule: { ar: 'اضرب في ٢ وأضف ١', en: 'Multiply by 2 and add 1' },
  },
  {
    sequence: ['★', '☆', '★★', '☆☆', '★★★', '?'],
    options: ['★', '★★★', '☆☆☆', '★★★★'],
    answerIndex: 2,
    rule: { ar: 'نجمة ممتلئة ثم مفرغة يتضاعف عددها مع كل زوج', en: 'Filled then hollow star count increases by 1 per pair' },
  },
  {
    sequence: [1, 2, 6, 24, 120, '?'],
    options: [600, 720, 480, 840],
    answerIndex: 1,
    rule: { ar: 'المضروب الرياضي: ×2, ×3, ×4, ×5, ×6', en: 'Factorials: ×2, ×3, ×4, ×5, ×6' },
  },
  {
    sequence: [80, 79, 75, 66, 50, '?'],
    options: [25, 34, 29, 41],
    answerIndex: 0,
    rule: { ar: 'طرح مربعات الأعداد: -1², -2², -3², -4², -5²', en: 'Subtract squares: −1, −4, −9, −16, −25' },
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
  {
    title: { ar: 'مشروبات المجلس', en: 'Parlor Drinks' },
    people: [
      { ar: 'فهد', en: 'Fahad' },
      { ar: 'نور', en: 'Noor' },
      { ar: 'زايد', en: 'Zaid' },
    ],
    items: [
      { ar: 'القهوة العربية', en: 'Arabic Coffee' },
      { ar: 'الشاي بالنعناع', en: 'Mint Tea' },
      { ar: 'عصير الليمون', en: 'Lemonade' },
    ],
    clues: {
      ar: [
        'نور تفضّل المشروبات الباردة دائماً.',
        'زايد لا يشرب القهوة العربية ولا الليمون.',
      ],
      en: [
        'Noor always orders a cold drink.',
        'Zaid drinks neither Arabic Coffee nor Lemonade.',
      ],
    },
    solution: [0, 2, 1],
  },
  {
    title: { ar: 'طوابق البرج السكني', en: 'Tower Floors' },
    people: [
      { ar: 'هند', en: 'Hind' },
      { ar: 'ماجد', en: 'Majed' },
      { ar: 'دانة', en: 'Dana' },
    ],
    items: [
      { ar: 'الطابق الثاني', en: '2nd Floor' },
      { ar: 'الطابق الخامس', en: '5th Floor' },
      { ar: 'الطابق الثامن', en: '8th Floor' },
    ],
    clues: {
      ar: [
        'شقة ماجد أعلى من شقة هند وأقل من شقة دانة.',
        'دانة تسكن في أعلى طابق بين الثلاثة.',
      ],
      en: [
        'Majed lives higher than Hind but lower than Dana.',
        'Dana lives on the highest floor of the three.',
      ],
    },
    solution: [0, 1, 2],
  },
  {
    title: { ar: 'توزيع اللغات', en: 'Language Booths' },
    people: [
      { ar: 'رامي', en: 'Rami' },
      { ar: 'مها', en: 'Maha' },
      { ar: 'أنس', en: 'Anas' },
    ],
    items: [
      { ar: 'اليابانية', en: 'Japanese' },
      { ar: 'الإسبانية', en: 'Spanish' },
      { ar: 'الفرنسية', en: 'French' },
    ],
    clues: {
      ar: [
        'مها تتحدث لغة من شرق آسيا.',
        'أنس لا يدرس الفرنسية ولا اليابانية.',
      ],
      en: [
        'Maha speaks an East Asian language.',
        'Anas studies neither French nor Japanese.',
      ],
    },
    solution: [2, 0, 1],
  },
  {
    title: { ar: 'محطات السفر', en: 'Travel Destinations' },
    people: [
      { ar: 'سلمى', en: 'Salma' },
      { ar: 'وليد', en: 'Waleed' },
      { ar: 'راشد', en: 'Rashid' },
    ],
    items: [
      { ar: 'طوكيو', en: 'Tokyo' },
      { ar: 'القاهرة', en: 'Cairo' },
      { ar: 'لندن', en: 'London' },
    ],
    clues: {
      ar: [
        'وليد سافر إلى قارة أفريقيا.',
        'سلمى زارت عاصمة جزر المملكة المتحدة.',
      ],
      en: [
        'Waleed traveled to Africa.',
        'Salma visited the capital of the United Kingdom.',
      ],
    },
    solution: [2, 1, 0],
  },
  {
    title: { ar: 'آلات الموسيقى', en: 'Chamber Instruments' },
    people: [
      { ar: 'تالا', en: 'Tala' },
      { ar: 'حسام', en: 'Hussam' },
      { ar: 'جود', en: 'Joud' },
    ],
    items: [
      { ar: 'الكمان', en: 'Violin' },
      { ar: 'البيانو', en: 'Piano' },
      { ar: 'الناي', en: 'Flute' },
    ],
    clues: {
      ar: [
        'جود لا تعزف آلة وترية ولا مفاتيح.',
        'حسام يفضّل الكمان المحمول باليد.',
      ],
      en: [
        'Joud plays neither strings nor keys.',
        'Hussam prefers the handheld string instrument.',
      ],
    },
    solution: [1, 0, 2],
  },
  {
    title: { ar: 'أقسام المكتبة', en: 'Library Wings' },
    people: [
      { ar: 'خالد', en: 'Khalid' },
      { ar: 'أمل', en: 'Amal' },
      { ar: 'سيف', en: 'Saif' },
    ],
    items: [
      { ar: 'التاريخ', en: 'History' },
      { ar: 'الفلك', en: 'Astronomy' },
      { ar: 'الشعر', en: 'Poetry' },
    ],
    clues: {
      ar: [
        'خالد يبحث عن خرائط النجوم والكواكب.',
        'سيف لا يقرأ الشعر ولا الفلك.',
      ],
      en: [
        'Khalid is researching star maps and planets.',
        'Saif is reading neither Poetry nor Astronomy.',
      ],
    },
    solution: [1, 2, 0],
  },
  {
    title: { ar: 'ميداليات البطولة', en: 'Tournament Medals' },
    people: [
      { ar: 'زياد', en: 'Ziyad' },
      { ar: 'مريم', en: 'Mariam' },
      { ar: 'بدر', en: 'Badr' },
    ],
    items: [
      { ar: 'الذهبية', en: 'Gold' },
      { ar: 'الفضية', en: 'Silver' },
      { ar: 'البرونزية', en: 'Bronze' },
    ],
    clues: {
      ar: [
        'بدر تفوق على زياد ولكنه لم يفز بالذهبية.',
        'مريم تصدرت الترتيب العام.',
      ],
      en: [
        'Badr placed ahead of Ziyad, yet missed Gold.',
        'Mariam topped the overall standings.',
      ],
    },
    solution: [2, 0, 1],
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
        ['ل', '#', 'م', '#'],
        ['م', 'د', 'ا', 'ر'],
        ['#', '#', 'ل', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'جرم يضيء السماء ليلاً', en: 'Moon' }, answer: 'قمر' },
          { num: 3, row: 2, col: 0, clue: { ar: 'مسار يدور فيه الكوكب', en: 'Orbit' }, answer: 'مدار' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'أداة للكتابة', en: 'Pen' }, answer: 'قلم' },
          { num: 2, row: 0, col: 2, clue: { ar: 'حبات صغيرة تغطي الصحراء', en: 'Sands' }, answer: 'رمال' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ع', 'م', 'ل', '#'],
        ['س', 'ر', 'ب', '#'],
        ['ل', 'ح', 'ن', '#'],
        ['#', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مهنة أو جهد يومي', en: 'Work' }, answer: 'عمل' },
          { num: 4, row: 1, col: 0, clue: { ar: 'مجموعة طيور تطير معاً', en: 'Flock' }, answer: 'سرب' },
          { num: 5, row: 2, col: 0, clue: { ar: 'نغمة موسيقية', en: 'Melody' }, answer: 'لحن' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'غذاء حلو يصنعه النحل', en: 'Honey' }, answer: 'عسل' },
          { num: 2, row: 0, col: 1, clue: { ar: 'بهجة وسرور', en: 'Joy' }, answer: 'مرح' },
          { num: 3, row: 0, col: 2, clue: { ar: 'مشروب أبيض مغذٍّ', en: 'Milk' }, answer: 'لبن' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ب', 'ح', 'ر', '#'],
        ['ي', '#', 'م', '#'],
        ['ت', 'ج', 'ل', 'س'],
        ['#', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مسطح مائي واسع ومالح', en: 'Sea' }, answer: 'بحر' },
          { num: 3, row: 2, col: 0, clue: { ar: 'تستريح على الكرسي', en: 'You sit' }, answer: 'تجلس' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مسكن أو منزل', en: 'Home' }, answer: 'بيت' },
          { num: 2, row: 0, col: 2, clue: { ar: 'ذرات الصحراء الناعمة', en: 'Sand' }, answer: 'رمل' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ن', 'و', 'ر', '#'],
        ['ج', '#', 'س', '#'],
        ['م', 'د', 'م', 'ع'],
        ['#', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'ضوء ساطع', en: 'Light' }, answer: 'نور' },
          { num: 3, row: 2, col: 0, clue: { ar: 'مجرى الدمع في العين', en: 'Tear duct' }, answer: 'مدمع' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'جرم سماوي متلألئ', en: 'Star' }, answer: 'نجم' },
          { num: 2, row: 0, col: 2, clue: { ar: 'تخطيط باليد والقلم', en: 'Drawing' }, answer: 'رسم' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ف', 'ج', 'ر', '#'],
        ['ه', '#', 'ي', '#'],
        ['د', 'ا', 'م', 'ت'],
        ['#', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'أول ضوء الصباح', en: 'Dawn' }, answer: 'فجر' },
          { num: 3, row: 2, col: 0, clue: { ar: 'استمرت وبقيت', en: 'Lasted' }, answer: 'دامت' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'حيوان مفترس سريع', en: 'Cheetah' }, answer: 'فهد' },
          { num: 2, row: 0, col: 2, clue: { ar: 'غزال أبيض الصحراء', en: 'White gazelle' }, answer: 'ريم' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['ش', 'م', 'س', '#'],
        ['ج', '#', 'م', '#'],
        ['ر', 'ك', 'ك', '#'],
        ['#', '#', '#', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'نجم مجموعتنا نهاراً', en: 'Sun' }, answer: 'شمس' },
          { num: 3, row: 2, col: 0, clue: { ar: 'ضعيف وهزيل', en: 'Weak/thin' }, answer: 'ركك' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'نباتات ذات جذوع وأغصان', en: 'Trees' }, answer: 'شجر' },
          { num: 2, row: 0, col: 2, clue: { ar: 'مخلوق يعيش في الماء', en: 'Fish' }, answer: 'سمك' },
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
        ['#', '#', 'S', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'نجم مضيء', en: 'Shining celestial body' }, answer: 'STAR' },
          { num: 3, row: 2, col: 0, clue: { ar: 'ملاحظة مكتوبة', en: 'Written reminder' }, answer: 'NOTE' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'الشمس', en: 'Daytime star' }, answer: 'SUN' },
          { num: 2, row: 0, col: 2, clue: { ar: 'الفنون', en: 'Creative fields' }, answer: 'ARTS' },
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
    {
      size: 4,
      grid: [
        ['C', 'A', 'R', 'D'],
        ['O', '#', 'O', '#'],
        ['D', 'E', 'S', 'K'],
        ['E', '#', 'E', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'بطاقة لعب', en: 'Playing square or greeting item' }, answer: 'CARD' },
          { num: 3, row: 2, col: 0, clue: { ar: 'مكتب دراسة', en: 'Study table' }, answer: 'DESK' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'شفرة سرية', en: 'Secret cipher' }, answer: 'CODE' },
          { num: 2, row: 0, col: 2, clue: { ar: 'زهرة الورد', en: 'Fragrant red flower' }, answer: 'ROSE' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['B', 'E', 'A', 'M'],
        ['I', '#', 'R', '#'],
        ['K', 'I', 'T', 'E'],
        ['E', '#', 'S', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'شعاع ضوء', en: 'Ray of light' }, answer: 'BEAM' },
          { num: 3, row: 2, col: 0, clue: { ar: 'طائرة ورقية', en: 'Paper diamond flown in wind' }, answer: 'KITE' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'دراجة هوائية', en: 'Two-wheeled pedal ride' }, answer: 'BIKE' },
          { num: 2, row: 0, col: 2, clue: { ar: 'مجالات إبداعية وفنية', en: 'Creative fields and crafts' }, answer: 'ARTS' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['W', 'I', 'N', 'D'],
        ['A', '#', 'E', '#'],
        ['V', 'A', 'S', 'T'],
        ['E', '#', 'T', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'رياح عابرة', en: 'Moving breeze' }, answer: 'WIND' },
          { num: 3, row: 2, col: 0, clue: { ar: 'شاسع وواسع', en: 'Immense and wide' }, answer: 'VAST' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'موجة بحر', en: 'Ocean crest' }, answer: 'WAVE' },
          { num: 2, row: 0, col: 2, clue: { ar: 'عش طائر', en: 'Bird home' }, answer: 'NEST' },
        ],
      },
    },
    {
      size: 4,
      grid: [
        ['L', 'A', 'M', 'P'],
        ['I', '#', 'I', '#'],
        ['O', 'A', 'S', 'T'],
        ['N', '#', 'T', '#'],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: { ar: 'مصباح طاولة', en: 'Desk light' }, answer: 'LAMP' },
          { num: 3, row: 2, col: 0, clue: { ar: 'فرن تجفيف', en: 'Kiln for hops' }, answer: 'OAST' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: { ar: 'ملك الغابة', en: 'Savanna king' }, answer: 'LION' },
          { num: 2, row: 0, col: 2, clue: { ar: 'ضباب خفيف', en: 'Morning fog spray' }, answer: 'MIST' },
        ],
      },
    },
  ],
};

export interface WordSearchSpec {
  grid: string[][];
  words: string[];
}

export const WORD_SEARCH_BOARDS: Record<'ar' | 'en', WordSearchSpec[]> = {
  ar: [
    {
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
    {
      grid: [
        ['و', 'ط', 'ن', 'ك', 'و', 'ب'],
        ['س', 'ح', 'ا', 'ب', 'ع', 'د'],
        ['ص', 'ب', 'ر', 'ز', 'ه', 'ر'],
        ['ع', 'ل', 'م', 'ر', 'م', 'ل'],
        ['ق', 'ص', 'ر', 'م', 'ط', 'ر'],
        ['ف', 'ج', 'ر', 'ب', 'ي', 'ت'],
      ],
      words: ['وطن', 'سحاب', 'زهر', 'علم', 'قصر', 'مطر'],
    },
    {
      grid: [
        ['ذ', 'ه', 'ب', 'ن', 'ه', 'ر'],
        ['غ', 'ز', 'ا', 'ل', 'ع', 'ل'],
        ['ت', 'م', 'ر', 'ل', 'ي', 'ل'],
        ['ح', 'ل', 'م', 'ص', 'و', 'ت'],
        ['س', 'ف', 'ن', 'ن', 'خ', 'ل'],
        ['و', 'ر', 'ق', 'خ', 'ي', 'ل'],
      ],
      words: ['ذهب', 'غزال', 'تمر', 'ليل', 'حلم', 'خيل'],
    },
    {
      grid: [
        ['ب', 'ر', 'ق', 'خ', 'ب', 'ز'],
        ['ص', 'ق', 'ر', 'ع', 'س', 'ل'],
        ['د', 'ر', 'ب', 'ط', 'ي', 'ر'],
        ['ث', 'ل', 'ج', 'ك', 'ن', 'ز'],
        ['ش', 'ج', 'ر', 'ن', 'ب', 'ع'],
        ['س', 'م', 'ك', 'ح', 'ب', 'ر'],
      ],
      words: ['برق', 'صقر', 'عسل', 'كنز', 'شجر', 'سمك'],
    },
    {
      grid: [
        ['م', 'ل', 'ك', 'ت', 'ا', 'ج'],
        ['ف', 'ه', 'د', 'و', 'ر', 'د'],
        ['ب', 'ح', 'ي', 'ر', 'ة', 'ل'],
        ['ض', 'و', 'ء', 'ش', 'ع', 'ر'],
        ['ع', 'ق', 'ل', 'ط', 'ر', 'ب'],
        ['ق', 'ل', 'ع', 'ة', 'س', 'ف'],
      ],
      words: ['تاج', 'فهد', 'بحيرة', 'شعر', 'طرب', 'قلعة'],
    },
    {
      grid: [
        ['م', 'س', 'ج', 'د', 'ن', 'ر'],
        ['ح', 'د', 'ي', 'ق', 'ة', 'م'],
        ['س', 'ا', 'ح', 'ل', 'ع', 'ق'],
        ['غ', 'ر', 'و', 'ب', 'ن', 'ج'],
        ['ش', 'ر', 'و', 'ق', 'ز', 'م'],
        ['ك', 'و', 'ك', 'ب', 'ص', 'د'],
      ],
      words: ['مسجد', 'حديقة', 'ساحل', 'غروب', 'شروق', 'كوكب'],
    },
  ],
  en: [
    {
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
    {
      grid: [
        ['C', 'A', 'S', 'T', 'L', 'E'],
        ['B', 'R', 'I', 'D', 'G', 'E'],
        ['F', 'O', 'R', 'E', 'S', 'T'],
        ['R', 'I', 'V', 'E', 'R', 'S'],
        ['C', 'L', 'O', 'U', 'D', 'S'],
        ['S', 'H', 'I', 'E', 'L', 'D'],
      ],
      words: ['CASTLE', 'BRIDGE', 'FOREST', 'RIVER', 'CLOUD', 'SHIELD'],
    },
    {
      grid: [
        ['R', 'O', 'C', 'K', 'E', 'T'],
        ['C', 'O', 'M', 'E', 'T', 'S'],
        ['G', 'A', 'L', 'A', 'X', 'Y'],
        ['O', 'R', 'B', 'I', 'T', 'S'],
        ['M', 'E', 'T', 'E', 'O', 'R'],
        ['L', 'U', 'N', 'A', 'R', 'S'],
      ],
      words: ['ROCKET', 'COMET', 'GALAXY', 'ORBIT', 'METEOR', 'LUNAR'],
    },
    {
      grid: [
        ['C', 'O', 'F', 'F', 'E', 'E'],
        ['H', 'O', 'N', 'E', 'Y', 'S'],
        ['B', 'R', 'E', 'A', 'D', 'S'],
        ['S', 'P', 'I', 'C', 'E', 'S'],
        ['O', 'L', 'I', 'V', 'E', 'S'],
        ['A', 'P', 'P', 'L', 'E', 'S'],
      ],
      words: ['COFFEE', 'HONEY', 'BREAD', 'SPICE', 'OLIVE', 'APPLE'],
    },
    {
      grid: [
        ['S', 'I', 'L', 'V', 'E', 'R'],
        ['D', 'R', 'A', 'G', 'O', 'N'],
        ['K', 'N', 'I', 'G', 'H', 'T'],
        ['Q', 'U', 'E', 'S', 'T', 'S'],
        ['C', 'R', 'O', 'W', 'N', 'S'],
        ['B', 'A', 'N', 'N', 'E', 'R'],
      ],
      words: ['SILVER', 'DRAGON', 'KNIGHT', 'QUEST', 'CROWN', 'BANNER'],
    },
    {
      grid: [
        ['M', 'U', 'S', 'E', 'U', 'M'],
        ['P', 'O', 'R', 'T', 'A', 'L'],
        ['C', 'I', 'P', 'H', 'E', 'R'],
        ['B', 'E', 'A', 'C', 'O', 'N'],
        ['S', 'U', 'M', 'M', 'I', 'T'],
        ['A', 'T', 'L', 'A', 'S', 'X'],
      ],
      words: ['MUSEUM', 'PORTAL', 'CIPHER', 'BEACON', 'SUMMIT', 'ATLAS'],
    },
  ],
};

export const WORD_SEARCH_BANK: Record<'ar' | 'en', WordSearchSpec> = {
  ar: WORD_SEARCH_BOARDS.ar[0],
  en: WORD_SEARCH_BOARDS.en[0],
};

export const TYPING_SENTENCES: Record<'ar' | 'en', string[]> = {
  ar: [
    'مجلسنا يجمع الاصدقاء في تحديات ذكاء وسرعة ممتعة',
    'التعاون والتركيز يصنعان الفارق في كل جولة حاسمة',
    'السرعة دون دقة لا تكفي لحسم لقب البطولة الليلة',
    'احفظ النمط وحل الشفرة قبل ان ينفد مؤقت الجولة',
    'الهدوء تحت الضغط يكشف اللاعب الأذكى على الطاولة',
    'كل خطوة مدروسة تقربك من صدارة الترتيب العام',
    'تحدي الأصدقاء في غرف اللعب يضاعف الحماس والمتعة',
    'قوة الذاكرة وسرعة البديهة تصنعان بطل مجلسنا',
    'لا تتردد عند الإجابة فالثواني القليلة تصنع الفوز',
    'فك الألغاز والرموز يحتاج نظرة ثاقبة وصبراً جميلاً',
  ],
  en: [
    'Sharp focus and steady speed turn close matches into victories',
    'Friends gather in the parlor room to test wit and reflexes',
    'Every puzzle rewards calm deduction under a ticking clock',
    'Clear thinking always beats hurried guesswork at the table',
    'Consistent accuracy builds unstoppable momentum across rounds',
    'Spot subtle visual patterns before the countdown reaches zero',
    'Great teamwork turns difficult board challenges into clean wins',
    'Quick fingers paired with calm nerves unlock top scores',
    'Crack the cipher step by step using every logical clue',
    'Champions stay composed when the final timer accelerates',
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
  { ar: 'فندق جبلي', en: 'Alpine Ski Lodge' },
  { ar: 'مرصد فلكي', en: 'Astronomical Observatory' },
  { ar: 'سوق شعبي قديم', en: 'Historic Souq Bazaar' },
  { ar: 'استوديو سينما', en: 'Film Studio Set' },
  { ar: 'محطة قطار سريعة', en: 'High-Speed Train Station' },
  { ar: 'حديقة حيوان', en: 'Wildlife Sanctuary' },
  { ar: 'معرض سيارات', en: 'Classic Auto Show' },
  { ar: 'مختبر كيمياء', en: 'Research Laboratory' },
  { ar: 'ميناء صيد', en: 'Coastal Harbor' },
  { ar: 'مسرح أوبرا', en: 'Grand Opera House' },
];

export const LIAR_WORD_PAIRS: { main: { ar: string; en: string }; decoy: { ar: string; en: string } }[] = [
  { main: { ar: 'القهوة', en: 'Coffee' }, decoy: { ar: 'الشاي', en: 'Tea' } },
  { main: { ar: 'الشمس', en: 'Sun' }, decoy: { ar: 'القمر', en: 'Moon' } },
  { main: { ar: 'الشتاء', en: 'Winter' }, decoy: { ar: 'الخريف', en: 'Autumn' } },
  { main: { ar: 'الطائرة', en: 'Airplane' }, decoy: { ar: 'القطار', en: 'Train' } },
  { main: { ar: 'الجيتار', en: 'Guitar' }, decoy: { ar: 'العود', en: 'Oud' } },
  { main: { ar: 'الصحراء', en: 'Desert' }, decoy: { ar: 'الشاطئ', en: 'Beach' } },
  { main: { ar: 'كرة القدم', en: 'Football' }, decoy: { ar: 'كرة السلة', en: 'Basketball' } },
  { main: { ar: 'الأسد', en: 'Lion' }, decoy: { ar: 'النمر', en: 'Tiger' } },
  { main: { ar: 'الذهب', en: 'Gold' }, decoy: { ar: 'الفضة', en: 'Silver' } },
  { main: { ar: 'البوصلة', en: 'Compass' }, decoy: { ar: 'الخريطة', en: 'Map' } },
  { main: { ar: 'البيتزا', en: 'Pizza' }, decoy: { ar: 'الباستا', en: 'Pasta' } },
  { main: { ar: 'الشطرنج', en: 'Chess' }, decoy: { ar: 'الداما', en: 'Checkers' } },
  { main: { ar: 'المطر', en: 'Rain' }, decoy: { ar: 'الثلج', en: 'Snow' } },
  { main: { ar: 'المتحف', en: 'Museum' }, decoy: { ar: 'المكتبة', en: 'Library' } },
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
  {
    word: { ar: 'الصحراء', en: 'Desert' },
    forbidden: { ar: ['رمل', 'جمل', 'حر', 'ماء'], en: ['Sand', 'Camel', 'Hot', 'Dry'] },
  },
  {
    word: { ar: 'الطائرة', en: 'Airplane' },
    forbidden: { ar: ['سفر', 'مطار', 'أجنحة', 'سماء'], en: ['Fly', 'Airport', 'Wings', 'Sky'] },
  },
  {
    word: { ar: 'المكتبة', en: 'Library' },
    forbidden: { ar: ['كتب', 'قراءة', 'هدوء', 'رفوف'], en: ['Books', 'Read', 'Quiet', 'Shelves'] },
  },
  {
    word: { ar: 'المصباح', en: 'Lantern' },
    forbidden: { ar: ['ضوء', 'ظلام', 'كهرباء', 'غرفة'], en: ['Light', 'Dark', 'Bulb', 'Glow'] },
  },
  {
    word: { ar: 'الكاميرا', en: 'Camera' },
    forbidden: { ar: ['صورة', 'عدسة', 'فيديو', 'تصوير'], en: ['Photo', 'Lens', 'Flash', 'Picture'] },
  },
  {
    word: { ar: 'القطار', en: 'Train' },
    forbidden: { ar: ['سكة', 'محطة', 'سفر', 'عربة'], en: ['Track', 'Station', 'Rail', 'Ticket'] },
  },
  {
    word: { ar: 'النخلة', en: 'Palm Tree' },
    forbidden: { ar: ['تمر', 'شجرة', 'واحة', 'طويل'], en: ['Dates', 'Tree', 'Oasis', 'Tall'] },
  },
  {
    word: { ar: 'الغواصة', en: 'Submarine' },
    forbidden: { ar: ['بحر', 'تحت', 'ماء', 'سفينة'], en: ['Ocean', 'Deep', 'Underwater', 'Ship'] },
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
      ar: ['روزاليند فرانكلين', 'آدا لوفلايس', 'ماري كوري', 'جريس هوبر'],
      en: ['Rosalind Franklin', 'Ada Lovelace', 'Marie Curie', 'Grace Hopper'],
    },
    answerIndex: 2,
  },
  {
    name: { ar: 'الخوارزمي', en: 'Al-Khwarizmi' },
    clues: {
      ar: ['عملت في بيت الحكمة ببغداد', 'أسست علم الجبر في كتاب شهير', 'اشتق من اسمي مصطلح الخوارزميات'],
      en: ['Worked at Baghdad’s House of Wisdom', 'Authored the foundational book on Algebra', 'The word algorithm comes from my name'],
    },
    options: {
      ar: ['الخوارزمي', 'ابن سينا', 'الفارابي', 'الرازي'],
      en: ['Al-Khwarizmi', 'Ibn Sina', 'Al-Farabi', 'Al-Razi'],
    },
    answerIndex: 0,
  },
  {
    name: { ar: 'آدا لوفلايس', en: 'Ada Lovelace' },
    clues: {
      ar: ['عالمة رياضيات إنجليزية', 'تعاونت مع تشارلز بابيج', 'كتبت أول خوارزمية حاسوبية في التاريخ'],
      en: ['19th-century mathematician', 'Worked with Charles Babbage', 'Wrote the first computer algorithm'],
    },
    options: {
      ar: ['ماري كوري', 'آدا لوفلايس', 'غريس هوبر', 'هيدي لامار'],
      en: ['Marie Curie', 'Ada Lovelace', 'Grace Hopper', 'Hedy Lamarr'],
    },
    answerIndex: 1,
  },
  {
    name: { ar: 'أحمد زويل', en: 'Ahmed Zewail' },
    clues: {
      ar: ['عالم كيمياء عربي', 'درست التفاعلات بالليزر فائق السرعة', 'فزت بنوبل عام ١٩٩٩ عن كيمياء الفيمتو'],
      en: ['Arab Nobel laureate chemist', 'Used ultrafast lasers to film molecules', 'Pioneered femtochemistry in 1999'],
    },
    options: {
      ar: ['مجدي يعقوب', 'فاروق الباز', 'أحمد زويل', 'مصطفى مشرفة'],
      en: ['Magdi Yacoub', 'Farouk El-Baz', 'Ahmed Zewail', 'Mosharafa'],
    },
    answerIndex: 2,
  },
  {
    name: { ar: 'نيكولا تسلا', en: 'Nikola Tesla' },
    clues: {
      ar: ['مهندس كهربائي عبقري', 'قدت ثورة التيار الكهربائي المتردد', 'تحمل وحدة المجال المغناطيسي اسمي'],
      en: ['Visionary electrical engineer', 'Pioneered Alternating Current power', 'A magnetic flux unit bears my name'],
    },
    options: {
      ar: ['توماس إديسون', 'نيكولا تسلا', 'مايكل فاراداي', 'ألكسندر بيل'],
      en: ['Thomas Edison', 'Nikola Tesla', 'Michael Faraday', 'Alexander Bell'],
    },
    answerIndex: 1,
  },
  {
    name: { ar: 'ابن خلدون', en: 'Ibn Khaldun' },
    clues: {
      ar: ['ولدت في تونس عام ١٣٣٢م', 'وضعت أسس علم الاجتماع والتاريخ', 'أشهـر مؤلفاتي كتاب "المقدمة"'],
      en: ['Born in Tunis in 1332', 'Pioneered sociology and historiography', 'Famous for writing the Muqaddimah'],
    },
    options: {
      ar: ['ابن خلدون', 'ابن بطوطة', 'المسعودي', 'الطبري'],
      en: ['Ibn Khaldun', 'Ibn Battuta', 'Al-Masudi', 'Al-Tabari'],
    },
    answerIndex: 0,
  },
  {
    name: { ar: 'الحسن بن الهيثم', en: 'Ibn al-Haytham' },
    clues: {
      ar: ['عالم بصريات من البصرة', 'طبقت التجربة والقياس الدقيق', 'كتبت كتاب "المناظر" وشرحت القمرة المظلمة'],
      en: ['Optics pioneer born in Basra', 'Championed controlled scientific experiments', 'Authored the Book of Optics'],
    },
    options: {
      ar: ['جابر بن حيان', 'البيروني', 'عمر الخيام', 'الحسن بن الهيثم'],
      en: ['Jabir ibn Hayyan', 'Al-Biruni', 'Omar Khayyam', 'Ibn al-Haytham'],
    },
    answerIndex: 3,
  },
  {
    name: { ar: 'عباس بن فرناس', en: 'Abbas ibn Firnas' },
    clues: {
      ar: ['مخترع أندلسي من قرطبة', 'صنعت قبة فلكية وساعات مائية', 'جرّبت التحليق بأجنحة الريش'],
      en: ['9th-century Andalusian inventor', 'Built an intricate planetarium', 'Tested early human gliding flight'],
    },
    options: {
      ar: ['عباس بن فرناس', 'الجزري', 'الإدريسي', 'ابن رشد'],
      en: ['Abbas ibn Firnas', 'Al-Jazari', 'Al-Idrisi', 'Ibn Rushd'],
    },
    answerIndex: 0,
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
  {
    statements: {
      ar: ['سور الصين العظيم لا يُرى من القمر بالعين المجردة', 'التفاح يطفو على الماء لأن ربع حجمه هواء', 'الحرباء تغير لونها فقط للاختفاء من الأعداء'],
      en: ['The Great Wall is invisible to the naked eye from the Moon', 'Apples float because 25% of their volume is air', 'Chameleons change color solely for camouflage'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الحرباء تغير لونها أساساً لتنظيم الحرارة والتواصل المزاجي.',
      en: 'Chameleons shift colors primarily for temperature control and signaling mood.',
    },
  },
  {
    statements: {
      ar: ['نجم الشمس يمثل أكثر من ٩٩٪ من كتلة نظامنا الشمسي', 'القمر يبتعد عن الأرض بضعة سنتيمترات كل عام', 'عطارد هو أكثر كوكب حرارة في المجموعة الشمسية'],
      en: ['The Sun holds over 99% of our solar system’s mass', 'The Moon drifts a few centimeters farther each year', 'Mercury is the hottest planet in our solar system'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الزهرة هو الكوكب الأكثر حرارة بسبب غلافه الجوي الكثيف المحتبس للحرارة.',
      en: 'Venus is hotter than Mercury due to its dense greenhouse atmosphere.',
    },
  },
  {
    statements: {
      ar: ['بصمات الكوالا مطابقة تقريباً لبصمات البشر', 'جسم الإنسان يحتوي على حديد يكفي لصنع مسمار صغير', 'الخفاش طائر ثديي يبيض في الكهوف'],
      en: ['Koala fingerprints closely resemble human fingerprints', 'Human blood contains enough iron for a small nail', 'Bats lay small white eggs inside caves'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الخفاش هو الثديي الوحيد القادر على الطيران الفعلي ويلد صغاره ولا يبيض.',
      en: 'Bats are placental mammals that give live birth, never eggs.',
    },
  },
  {
    statements: {
      ar: ['المحيط الهادئ أوسع من مساحة اليابسة الكلية على الأرض', 'النمل ينام ١٠ ساعات متواصلة كل ليلة', 'الضوء يستغرق نحو ٨ دقائق ليصل من الشمس إلينا'],
      en: ['The Pacific Ocean covers more area than all land combined', 'Ants sleep 10 uninterrupted hours every night', 'Sunlight takes about 8 minutes to reach Earth'],
    },
    lieIndex: 1,
    explanation: {
      ar: 'النمل يأخذ غفوات دقيقة متقطعة لثوانٍ ولا ينام لساعات متواصلة.',
      en: 'Ants take hundreds of tiny power-naps lasting around a minute each.',
    },
  },
  {
    statements: {
      ar: ['التماسيح لا تستطيع إخراج ألسنتها خارج أفواهها', 'قلب الحوت الأزرق بحجم سيارة صغيرة تقريباً', 'الزجاج الطبيعي أشد صلابة من الألماس النقي'],
      en: ['Crocodiles cannot stick their tongues out', 'A blue whale heart is roughly the size of a small car', 'Natural glass is harder than pure diamond'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'الألماس درجته ١٠ وهو أصلب معدن طبيعي، بينما الزجاج قرابة ٥.٥.',
      en: 'Diamond scores 10 on Mohs scale while glass is around 5.5.',
    },
  },
  {
    statements: {
      ar: ['البطيخ يحتوي على أكثر من ٩٠٪ ماء', 'النسر يرى فريسته من مسافة تزيد على كيلومتر', 'السلاحف تتنفس عبر قوقعتها الصلبة'],
      en: ['Watermelon is over 90% water', 'Eagles can spot prey from over a kilometer away', 'Turtles breathe air directly through their shell'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'السلاحف تتنفس بالرئتين كبقية الزواحف وليست القوقعة للتهوية.',
      en: 'Turtles breathe using lungs—their protective shell is bone.',
    },
  },
  {
    statements: {
      ar: ['يوجد في المريخ أعلى بركان معروف في النظام الشمسي', 'كوكب المشتري يضم أكبر قمر وهو غانيميد', 'السنة على بلوتو أقصر من سنة الأرض'],
      en: ['Mars hosts the tallest volcano in our solar system', 'Jupiter has the largest moon, Ganymede', 'A year on Pluto is shorter than an Earth year'],
    },
    lieIndex: 2,
    explanation: {
      ar: 'السنة على بلوتو تستغرق قرابة ٢٤٨ سنة أرضية!',
      en: 'One orbit around the Sun takes Pluto roughly 248 Earth years!',
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
    answerIndex: 1,
  },
  {
    weird: {
      ar: '«كسر عنصر التجميد المائي لكسب ودّ الحاضرين»',
      en: '"Shattering frozen water to initiate cordial dialogue"',
    },
    options: {
      ar: ['كسر الجليد وبداية التعارف', 'تبريد العصير صيفاً', 'تنظيف المطبخ سريعاً', 'السباحة في الشتاء'],
      en: ['Breaking the ice in conversation', 'Serving cold drinks', 'Sweeping the kitchen', 'Winter swimming'],
    },
    answerIndex: 0,
  },
  {
    weird: {
      ar: '«سخونة الفلفل الحارّ الصادر من بطاطس شاسعة»',
      en: '"Handling a thermally elevated tuber between palms"',
    },
    options: {
      ar: ['إعداد وجبة غداء سريعة', 'بطاطا ساخنة: موضوع حساس يصعب حمله', 'حفر المزرعة شتاءً', 'مشاركة الحلوى'],
      en: ['Hot potato: a sensitive issue nobody wants', 'Baking lunch quickly', 'Digging a farm plot', 'Sharing warm dessert'],
    },
    answerIndex: 1,
  },
  {
    weird: {
      ar: '«إراقة سائل الثدييات الأبيض من الإناء وبكاء الحزن»',
      en: '"Lamenting over accidentally displaced dairy liquid"',
    },
    options: {
      ar: ['شراء فطور صباحي', 'البكاء على اللبن المسكوب', 'غسيل الصحون ليلاً', 'فتح نافذة المطبخ'],
      en: ['Crying over spilled milk', 'Buying morning groceries', 'Washing dishes late', 'Opening kitchen blinds'],
    },
    answerIndex: 0,
  },
  {
    weird: {
      ar: '«النقر على رأس الأداة الحديدية بالمطرقة الخشبية تماماً»',
      en: '"Striking the metallic fastener precisely atop its flat crown"',
    },
    options: {
      ar: ['ترميم باب خشبي قديم', 'أصاب كبد الحقيقة بالضبط', 'جمع أدوات النجارة', 'رسم لوحة هندسية'],
      en: ['Hit the nail right on the head', 'Repaired an old shelf', 'Sorted workshop tools', 'Drew a straight frame'],
    },
    answerIndex: 1,
  },
  {
    weird: {
      ar: '«الأفعال الصوتية ترتفع أعلى من أمواج الحنجرة اللغوية»',
      en: '"Physical deeds produce greater acoustic decibels than vocalized syllables"',
    },
    options: {
      ar: ['الأفعال أبلغ من الأقوال', 'تخفيض صوت التلفاز', 'الغناء في المسرح', 'قراءة كتاب بصمت'],
      en: ['Actions speak louder than words', 'Lower the television audio', 'Singing in an opera', 'Reading quietly'],
    },
    answerIndex: 0,
  },
  {
    weird: {
      ar: '«ضرب طائرين باستخدام حجر واحد من الصخر البركاني»',
      en: '"Neutralizing dual feathered creatures with a solitary pebble"',
    },
    options: {
      ar: ['رمي الحصى في النهر', 'إصابة عصفورين بحجر واحد', 'صعود جبل مرتفع', 'مراقبة أسراب الطيور'],
      en: ['Killing two birds with one stone', 'Skipping pebbles across water', 'Hiking a steep slope', 'Watching passing flocks'],
    },
    answerIndex: 1,
  },
  {
    weird: {
      ar: '«تواجدك في قمة السحابة التاسعة فوق الأفق»',
      en: '"Suspended in euphoria atop the ninth atmospheric cumulus"',
    },
    options: {
      ar: ['السفر بطائرة سريعة', 'في قمة السعادة والبهجة', 'هطول أمطار موسمية', 'النظر من ناطحة سحاب'],
      en: ['On cloud nine — extremely happy', 'Boarding an express jet', 'Heavy seasonal showers', 'Viewing from a tower'],
    },
    answerIndex: 1,
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
  {
    a: { ar: 'استكشاف أعماق المحيطات المجهولة', en: 'Explore uncharted ocean trenches' },
    b: { ar: 'رحلة علمية إلى سطح القمر', en: 'Join a lunar research mission' },
    statsA: 39,
  },
  {
    a: { ar: 'عدم الحاجة للنوم أبداً مع طاقة كاملة', en: 'Never need sleep with full energy' },
    b: { ar: 'تعلّم أي مهارة جديدة خلال ساعة واحدة', en: 'Master any new skill in one hour' },
    statsA: 46,
  },
  {
    a: { ar: 'الفوز بكل جولة حظ تلقائياً', en: 'Win every game of pure luck' },
    b: { ar: 'الفوز بكل لغز ذكاء في نصف الوقت', en: 'Solve every logic puzzle in half time' },
    statsA: 34,
  },
  {
    a: { ar: 'تناول طبقك المفضل مجاناً للأبد', en: 'Eat your favorite dish free forever' },
    b: { ar: 'السفر مجاناً بالقطارات حول العالم', en: 'Travel free by rail around the world' },
    statsA: 29,
  },
  {
    a: { ar: 'الانتقال اللحظي لأي مدينة تود زيارتها', en: 'Teleport instantly anywhere on Earth' },
    b: { ar: 'الطيران بسرعة مريحة فوق السحاب', en: 'Fly peacefully above the clouds' },
    statsA: 67,
  },
  {
    a: { ar: 'مكتبة لا نهائية تحتوي كل كتاب في التاريخ', en: 'Own an infinite library of every book' },
    b: { ar: 'موهبة عزف كل الآلات الموسيقية بإتقان', en: 'Play every musical instrument by ear' },
    statsA: 53,
  },
  {
    a: { ar: 'تمديد كل يوم ساعتين إضافيتين', en: 'Add 2 extra hours to every day' },
    b: { ar: 'إزالة الازدحام والانتظار من حياتك للأبد', en: 'Never wait in traffic or lines again' },
    statsA: 55,
  },
  {
    a: { ar: 'قضاء العطلة في قرية أندلسية تاريخية', en: 'Spend vacation in a historic coastal village' },
    b: { ar: 'التخييم الفاخر تحت شفق القطب الشمالي', en: 'Luxury camp beneath the Northern Lights' },
    statsA: 44,
  },
];

export const SECRET_VOTE_PROMPTS: { ar: string; en: string }[] = [
  { ar: 'من الأكثر هدوءاً تحت ضغط المؤقت؟', en: 'Who stays calmest under timer pressure?' },
  { ar: 'من يمتلك أفضل خدعة تمويه في المافيا؟', en: 'Who pulls off the cleanest bluff in Mafia?' },
  { ar: 'من أول من سيقود الفريق لو ضلّ الطريق؟', en: 'Who would lead the team if everyone got lost?' },
  { ar: 'من صاحب أسرع بديهة في الجولات السريعة؟', en: 'Who has the sharpest reflexes on game night?' },
  { ar: 'من الأرجح أن يحفظ كلمات السر عن ظهر قلب؟', en: 'Who remembers every clue down to the smallest detail?' },
  { ar: 'من الأكثر إبداعاً في جولات الرسم والتخمين؟', en: 'Who shines brightest in Draw & Guess?' },
  { ar: 'من يملك دائماً خطة بديلة عندما تتعقد اللعبة؟', en: 'Who always has a backup strategy ready?' },
  { ar: 'من أكثر من يضفي أجواء مرحة على القروب؟', en: 'Who brings the best energy to the group chat?' },
  { ar: 'من سيحل لغز السودوكو قبل أن يشرب كوب الشاي؟', en: 'Who finishes Sudoku before the tea cools down?' },
  { ar: 'من الأكثر قدرة على إضحاك الجميع في التحديات؟', en: 'Who keeps everyone laughing through tough rounds?' },
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
  {
    description: {
      ar: 'سيمفونية كلاسيكية تبدأ بأربع نغمات حاسمة (تا-تا-تا-تاااا) وتُعد الأشهر في تاريخ الموسيقى الأوروبية.',
      en: 'Famous classical symphony opening with the iconic four-note fate motif.',
    },
    hint: { ar: 'السيمفونية الخامسة لبيتهوفن', en: 'Ludwig van Beethoven' },
    options: {
      ar: ['الفصول الأربعة', 'السيمفونية الخامسة لبيتهوفن', 'بحيرة البجع', 'سوناتا ضوء القمر'],
      en: ['Four Seasons', 'Beethoven Symphony No. 5', 'Swan Lake', 'Moonlight Sonata'],
    },
    answerIndex: 1,
  },
  {
    description: {
      ar: 'أغنية بوب مبهجة بصوت فيروز عن سهرة مفعمة بالموسيقى تستمر حتى طلوع الفجر.',
      en: 'Joyful Fairuz classic celebrating an unforgettable evening of music until dawn.',
    },
    hint: { ar: 'من كلمات وألحان الأخوين رحباني', en: 'By the Rahbani Brothers' },
    options: {
      ar: ['سهر الليالي', 'بكتب اسمك يا حبيبي', 'أنا لحبيبي', 'زهرة المدائن'],
      en: ['Sahar El Layali', 'Baktoub Ismak', 'Ana La Habibi', 'Zahrat Al Madaen'],
    },
    answerIndex: 0,
  },
  {
    description: {
      ar: 'مقطوعة بيانو هادئة وحالمة لجون لينون تدعو إلى عالم يسوده السلام والأخوة.',
      en: 'Peaceful piano ballad by John Lennon envisioning a united world.',
    },
    hint: { ar: 'صدرت عام ١٩٧١', en: 'Released in 1971' },
    options: {
      ar: ['Hey Jude', 'Imagine', 'Let It Be', 'Yesterday'],
      en: ['Hey Jude', 'Imagine', 'Let It Be', 'Yesterday'],
    },
    answerIndex: 1,
  },
  {
    description: {
      ar: 'موشح أندلسي عربي قديم يدور حول نسيم الزهور في المساء ولحظة الغروب.',
      en: 'Classical Andalusian muwashshah describing fragrant garden breezes at dusk.',
    },
    hint: { ar: 'موشح: لَمّا بدا يتثنى / جادك الغيث', en: 'Traditional Arabic Muwashshah' },
    options: {
      ar: ['لما بدا يتثنى', 'طال انتظارنا', 'موطني', 'الربيع'],
      en: ['Lamma Bada Yatathanna', 'Tal Intizaruna', 'Mawtini', 'Al Rabee'],
    },
    answerIndex: 0,
  },
  {
    description: {
      ar: 'معزوفة سينث-بوب إيقاعية من عام ٢٠١٩ تتحدث عن الأضواء المبهرة للمدينة ليلاً.',
      en: '80s-inspired synth-pop global hit racing through neon city streets at night.',
    },
    hint: { ar: 'للفنان The Weeknd', en: 'By The Weeknd (2019)' },
    options: {
      ar: ['Blinding Lights', 'Shape of You', 'Levitating', 'Starboy'],
      en: ['Blinding Lights', 'Shape of You', 'Levitating', 'Starboy'],
    },
    answerIndex: 0,
  },
  {
    description: {
      ar: 'أغنية أمل عربية شهيرة لعبد الحليم حافظ تحتفي بالنجاح وإشراقة صباح الحياة.',
      en: 'Iconic Abdel Halim Hafez celebration of success, youth, and hope.',
    },
    hint: { ar: 'تبدأ بعبارة: وحياة قلبي وأفراحه', en: 'Opens with "Wa Hayat Albi w Afraho"' },
    options: {
      ar: ['وحياة قلبي وأفراحه', 'قارئة الفنجان', 'أهواك', 'زي الهوى'],
      en: ['Wa Hayat Albi w Afraho', 'Qareat Al Fingan', 'Ahwak', 'Zay El Hawa'],
    },
    answerIndex: 0,
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
  {
    emojis: '🏴‍☠️🧭💎🌊',
    hint: { ar: 'مغامرة قراصنة والبحث عن سفينة اللؤلؤة السوداء', en: 'Swashbuckling sea captain quest' },
    options: {
      ar: ['قراصنة الكاريبي', 'جزيرة الكنز', 'موانا', 'بحار السندباد'],
      en: ['Pirates of the Caribbean', 'Treasure Island', 'Moana', 'Sinbad'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🤡🐠🔍🌊',
    hint: { ar: 'أب يبحث عن ابنه الصغير عبر المحيط', en: 'Ocean journey to rescue a missing son' },
    options: {
      ar: ['البحث عن نيمو (Finding Nemo)', 'حكاية سمكة', 'أكوامان', 'لوكا'],
      en: ['Finding Nemo', 'Shark Tale', 'Aquaman', 'Luca'],
    },
    answerIndex: 0,
  },
  {
    emojis: '❄️👸⛄🏰',
    hint: { ar: 'أختان في مملكة شتوية سحرية', en: 'Two sisters in an icy enchanted kingdom' },
    options: {
      ar: ['ملكة الثلج (Frozen)', 'تانجلد', 'موانا', 'سندريلا'],
      en: ['Frozen', 'Tangled', 'Moana', 'Cinderella'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🤠🚀🧸👦',
    hint: { ar: 'ألعاب غرفة الأطفال تنبض بالحياة', en: 'Childhood toys come to life' },
    options: {
      ar: ['قصة لعبة (Toy Story)', 'شركة المرعبين', 'سيارات', 'وول-إي'],
      en: ['Toy Story', 'Monsters Inc.', 'Cars', 'WALL-E'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🐼🥋🥟⛰️',
    hint: { ar: 'دب محب للطعام يصبح محارب التنين', en: 'Noodle-loving bear becomes a martial arts hero' },
    options: {
      ar: ['كونغ فو باندا (Kung Fu Panda)', 'مولان', 'شريك', 'مدغشقر'],
      en: ['Kung Fu Panda', 'Mulan', 'Shrek', 'Madagascar'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🦖🌴🚁🚙',
    hint: { ar: 'متنزه على جزيرة تعيش فيه الديناصورات مجدداً', en: 'Prehistoric theme park gone wild' },
    options: {
      ar: ['الحديقة الجوراسية (Jurassic Park)', 'كينغ كونغ', 'أفاتار', 'غودزيلا'],
      en: ['Jurassic Park', 'King Kong', 'Avatar', 'Godzilla'],
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
  {
    emojis: '☕🌴🇸🇦🏜️',
    category: { ar: 'ضيافة وتراث', en: 'Heritage' },
    options: {
      ar: ['القهوة السعودية والتمر', 'الشاي المغربي', 'الكنافة النابلسية', 'الكشري'],
      en: ['Saudi Coffee & Dates', 'Moroccan Tea', 'Kunafa', 'Koshari'],
    },
    answerIndex: 0,
  },
  {
    emojis: '⚽🥅🏆🎉',
    category: { ar: 'رياضة', en: 'Sport' },
    options: {
      ar: ['كرة السلة', 'بطولة كأس العالم لكرة القدم', 'التنس', 'سباق الفورمولا'],
      en: ['Basketball', 'FIFA World Cup', 'Tennis', 'Formula 1'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🎨🖌️🖼️🏛️',
    category: { ar: 'ثقافة وفنون', en: 'Culture' },
    options: {
      ar: ['المسرح الموسيقي', 'معرض الفنون والمتحف', 'الألعاب الأولمبية', 'معرض الكتاب'],
      en: ['Opera Concert', 'Art Gallery & Museum', 'Olympics', 'Book Fair'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🧭🗺️⛰️🎒',
    category: { ar: 'مغامرة', en: 'Adventure' },
    options: {
      ar: ['رحلة استكشاف وتسلق جبال', 'سباق سيارات', 'رحلة بحرية', 'مباراة شطرنج'],
      en: ['Mountain Hiking Expedition', 'Car Rally', 'Cruise Voyage', 'Chess Match'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🍯🐝🌼🌻',
    category: { ar: 'طبيعة', en: 'Nature' },
    options: {
      ar: ['العسل الطبيعي', 'عصير البرتقال', 'زيت الزيتون', 'المربى'],
      en: ['Natural Blossom Honey', 'Orange Juice', 'Olive Oil', 'Fruit Jam'],
    },
    answerIndex: 0,
  },
  {
    emojis: '🔭🌙✨🌌',
    category: { ar: 'علوم', en: 'Science' },
    options: {
      ar: ['علم البحار', 'علم الفلك ورصد النجوم', 'الكيمياء', 'الزراعة'],
      en: ['Marine Biology', 'Astronomy & Stargazing', 'Chemistry', 'Botany'],
    },
    answerIndex: 1,
  },
  {
    emojis: '🧩🔑🔐🏆',
    category: { ar: 'ألعاب', en: 'Games' },
    options: {
      ar: ['غرفة الهروب والألغاز', 'سباق الدراجات', 'كرة الطائرة', 'القفز المظلي'],
      en: ['Escape Room Challenge', 'Cycling Race', 'Volleyball', 'Skydiving'],
    },
    answerIndex: 0,
  },
];

export const STORY_DICE = {
  heroes: {
    ar: [
      'رحالة فضائي',
      'طاهٍ مغامر',
      'محقق ذكي',
      'عازف عود',
      'مخترع شاب',
      'صياد لؤلؤ',
      'رسام جداريات',
      'أمينة مكتبة',
      'ربان سفينة',
      'خبيرة شفرات',
    ],
    en: [
      'Space explorer',
      'Daring chef',
      'Sharp detective',
      'Oud musician',
      'Young inventor',
      'Pearl diver',
      'Mural artist',
      'Archivist',
      'Airship captain',
      'Cryptographer',
    ],
  },
  settings: {
    ar: [
      'في سوق قديم',
      'داخل قطار جبلي',
      'على جزيرة عائمة',
      'في مكتبة سرية',
      'تحت المطر',
      'في مرصد ليلي',
      'أمام قلعة منسية',
      'في محطة قمرية',
      'وسط واحة خضراء',
      'على جسر ضبابي',
    ],
    en: [
      'in an ancient market',
      'aboard a mountain train',
      'on a floating island',
      'inside a hidden library',
      'under heavy rain',
      'inside a quiet observatory',
      'before a forgotten citadel',
      'at a lunar outpost',
      'amidst a glowing oasis',
      'upon a foggy stone bridge',
    ],
  },
  twists: {
    ar: [
      'عثر على خريطة تتكلم',
      'انقطعت الكهرباء فجأة',
      'فتح باباً نحو القرن الماضي',
      'نطق الببغاء بالسر',
      'اختفى المفتاح الذهبي',
      'توقفت كل الساعات عند منتصف الليل',
      'وصلت رسالة من المستقبل',
      'انكشف ممر سري خلف اللوحة',
      'تحوّل الظل إلى دليل مضيء',
      'عادت السفينة دون طاقمها',
    ],
    en: [
      'found a talking map',
      'the lights flickered out',
      'opened a door to the past',
      'a parrot blurted the clue',
      'the golden key vanished',
      'every clock stopped at midnight',
      'a message arrived from tomorrow',
      'discovered a tunnel behind the mural',
      'shadows pointed toward a hidden vault',
      'an empty ship sailed into harbor',
    ],
  },
};

export const ACTING_PROMPTS: { ar: string; en: string }[] = [
  { ar: 'تسلق جبل في عاصفة ثلجية', en: 'Climbing a mountain in a blizzard' },
  { ar: 'محاولة إقناع قط بالنزول عن الطاولة', en: 'Convincing a stubborn cat off the table' },
  { ar: 'قيادة سيارة في زحام شديد', en: 'Driving through rush-hour traffic' },
  { ar: 'طهي وجبة فاخرة مع نسيان الملح', en: 'Cooking a gourmet dish and forgetting salt' },
  { ar: 'السباحة هرباً من سمكة قرش', en: 'Swimming away from a shark' },
  { ar: 'التقاط صورة سيلفي مع رياح قوية', en: 'Taking a selfie in strong wind' },
  { ar: 'المشي على القمر بانعدام الجاذبية', en: 'Moonwalking in zero gravity' },
  { ar: 'صائد سمك يجذب سمكة عملاقة بالسنارة', en: 'Reeling in a giant fish' },
  { ar: 'عازف بيانو في حفل متوتر', en: 'Concert pianist playing a dramatic finale' },
  { ar: 'شخص يحاول التقاط ذبابة مزعجة بصمت', en: 'Quietly chasing a buzzing fly' },
  { ar: 'محقق يبحث بعدسة مكبرة عن آثار', en: 'Detective examining footprints with a magnifier' },
  { ar: 'قائد أوركسترا يحرك العصا بحماس', en: 'Conducting a massive symphony orchestra' },
  { ar: 'فتح هدية مفاجئة ومذهلة', en: 'Unwrapping an unbelievable surprise gift' },
  { ar: 'المشي على حبل مشدود بين بنايتين', en: 'Tightrope walking high above the city' },
  { ar: 'تجربة قهوة ساخنة جداً دون حرق اللسان', en: 'Sipping piping hot coffee cautiously' },
  { ar: 'مذيع أخبار يستكمل البث أثناء انطفاء الأضواء', en: 'News anchor staying calm during a power cut' },
];

export const SOUND_PROMPTS: { ar: string; en: string; category: { ar: string; en: string } }[] = [
  { ar: 'هدير محرك سيارة سباق', en: 'Race car engine revving', category: { ar: 'مركبات', en: 'Vehicles' } },
  { ar: 'صوت زئير الأسد', en: 'Lion roaring loudly', category: { ar: 'حيوانات', en: 'Animals' } },
  { ar: 'صفير الرياح والمطر الغزير', en: 'Howling wind and heavy rain', category: { ar: 'طبيعة', en: 'Nature' } },
  { ar: 'صوت منبه ساعة قديمة', en: 'Classic mechanical alarm bell', category: { ar: 'أشياء', en: 'Objects' } },
  { ar: 'غردة عصفور عند الفجر', en: 'Dawn songbird chirping', category: { ar: 'حيوانات', en: 'Animals' } },
  { ar: 'فرقعة الفشار في المقلاة', en: 'Popcorn popping in a pan', category: { ar: 'مطبخ', en: 'Kitchen' } },
  { ar: 'صفارة قطار بخاري مسرع', en: 'Steam locomotive whistle blowing', category: { ar: 'مركبات', en: 'Vehicles' } },
  { ar: 'تصفيق جمهور غفير في مسرح', en: 'Thunderous theater applause', category: { ar: 'ناس', en: 'Crowds' } },
  { ar: 'طقطقة حطب مشتعل في المدفأة', en: 'Campfire logs crackling warmly', category: { ar: 'طبيعة', en: 'Nature' } },
  { ar: 'مواء قطة تبحث عن الطعام', en: 'Hungry cat meowing at the door', category: { ar: 'حيوانات', en: 'Animals' } },
  { ar: 'صوت صب القهوة الساخنة في الفنجان', en: 'Pouring hot coffee into a cup', category: { ar: 'مطبخ', en: 'Kitchen' } },
  { ar: 'قرع طبول حماسية متسارعة', en: 'Building war-drum roll', category: { ar: 'موسيقى', en: 'Music' } },
  { ar: 'رعد قوي يتبعه تساقط مطر', en: 'Rolling thunderclap followed by rain', category: { ar: 'طبيعة', en: 'Nature' } },
  { ar: 'نقر سريع على لوحة المفاتيح', en: 'Fast mechanical keyboard typing', category: { ar: 'أشياء', en: 'Objects' } },
  { ar: 'ضحكة متواصلة لشخصية كرتونية', en: 'Cartoon character chuckling', category: { ar: 'ناس', en: 'People' } },
  { ar: 'ديك يصيح عند شروق الشمس', en: 'Rooster crowing at sunrise', category: { ar: 'حيوانات', en: 'Animals' } },
];

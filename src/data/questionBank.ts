import type { LocalizedText } from '../types/game';

export interface QuizQuestion {
  id: string;
  category: 'science' | 'history' | 'geography' | 'culture' | 'tech' | 'sports';
  difficulty: 1 | 2 | 3;
  question: LocalizedText;
  options: { ar: string[]; en: string[] };
  correctIndex: number;
  hint: LocalizedText;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'science',
    difficulty: 1,
    question: { ar: 'ما هو الكوكب الأقرب إلى الشمس؟', en: 'Which planet is closest to the Sun?' },
    options: { ar: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'], en: ['Venus', 'Mercury', 'Mars', 'Earth'] },
    correctIndex: 1,
    hint: { ar: 'أصغر كوكب في المجموعة الشمسية', en: 'Smallest planet in the solar system' },
  },
  {
    id: 'q2',
    category: 'geography',
    difficulty: 1,
    question: { ar: 'ما هي أكبر قارة في العالم من حيث المساحة؟', en: 'Which is the largest continent by area?' },
    options: { ar: ['أفريقيا', 'أوروبا', 'آسيا', 'أمريكا الشمالية'], en: ['Africa', 'Europe', 'Asia', 'North America'] },
    correctIndex: 2,
    hint: { ar: 'تضم الصين والهند ومعظم العالم العربي الشرقي', en: 'Home to China, India, and Arabia' },
  },
  {
    id: 'q3',
    category: 'history',
    difficulty: 1,
    question: { ar: 'من هو العالم المسلم الذي أسس علم الجبر؟', en: 'Which scholar pioneered the field of Algebra?' },
    options: { ar: ['ابن سينا', 'الخوارزمي', 'ابن الهيثم', 'البيروني'], en: ['Ibn Sina', 'Al-Khwarizmi', 'Ibn al-Haytham', 'Al-Biruni'] },
    correctIndex: 1,
    hint: { ar: 'اشتق اسم الخوارزميات من اسمه', en: 'The word algorithm is derived from his name' },
  },
  {
    id: 'q4',
    category: 'science',
    difficulty: 1,
    question: { ar: 'ما الرمز الكيميائي للذهب؟', en: 'What is the chemical symbol for Gold?' },
    options: { ar: ['Ag', 'Au', 'Fe', 'Gd'], en: ['Ag', 'Au', 'Fe', 'Gd'] },
    correctIndex: 1,
    hint: { ar: 'مشتق من الكلمة اللاتينية Aurum', en: 'Derived from the Latin word Aurum' },
  },
  {
    id: 'q5',
    category: 'culture',
    difficulty: 1,
    question: { ar: 'كم عدد ألوان قوس قزح الأساسية؟', en: 'How many main colors are in a rainbow?' },
    options: { ar: ['٥ ألوان', '٦ ألوان', '٧ ألوان', '٨ ألوان'], en: ['5 colors', '6 colors', '7 colors', '8 colors'] },
    correctIndex: 2,
    hint: { ar: 'تبدأ بالأحمر وتنتهي بالبنفسجي', en: 'Starts with Red and ends with Violet' },
  },
  {
    id: 'q6',
    category: 'tech',
    difficulty: 1,
    question: { ar: 'كم بت (Bit) يوجد في البايت الواحد؟', en: 'How many bits are in one byte?' },
    options: { ar: ['٤', '٨', '١٦', '٣٢'], en: ['4', '8', '16', '32'] },
    correctIndex: 1,
    hint: { ar: 'قوة العدد ٢ الثالثة', en: '2 to the power of 3' },
  },
  {
    id: 'q7',
    category: 'geography',
    difficulty: 2,
    question: { ar: 'ما هي العاصمة الأعلى ارتفاعاً عن سطح البحر في العالم (العاصمة الإدارية)؟', en: 'Which city is the highest administrative capital in the world?' },
    options: { ar: ['كيتو', 'لاباز', 'بوغوتا', 'كاتماندو'], en: ['Quito', 'La Paz', 'Bogota', 'Kathmandu'] },
    correctIndex: 1,
    hint: { ar: 'تقع في بوليفيا بأمريكا الجنوبية', en: 'Located in Bolivia, South America' },
  },
  {
    id: 'q8',
    category: 'science',
    difficulty: 2,
    question: { ar: 'ما هو أسرع حيوان بحري في السباحة؟', en: 'What is the fastest swimming marine animal?' },
    options: { ar: ['القرش الأبيض', 'سمكة الشراع', 'الدلفين', 'التونة'], en: ['Great White Shark', 'Sailfish', 'Dolphin', 'Tuna'] },
    correctIndex: 1,
    hint: { ar: 'تتميز بزعنفة ظهرية تشبه الشراع', en: 'Named after its large dorsal fin' },
  },
  {
    id: 'q9',
    category: 'history',
    difficulty: 2,
    question: { ar: 'في أي مدينة أُسست أقدم جامعة مستمرة في العالم (القرويين)؟', en: 'In which city was the University of al-Qarawiyyin founded?' },
    options: { ar: ['القاهرة', 'فاس', 'قرطبة', 'دمشق'], en: ['Cairo', 'Fez', 'Cordoba', 'Damascus'] },
    correctIndex: 1,
    hint: { ar: 'مدينة مغربية عريقة', en: 'Historic imperial city in Morocco' },
  },
  {
    id: 'q10',
    category: 'sports',
    difficulty: 1,
    question: { ar: 'كم عدد لاعبي فريق كرة القدم الأساسيين داخل الملعب؟', en: 'How many players per team are on the pitch in standard football?' },
    options: { ar: ['٩', '١٠', '١١', '١٢'], en: ['9', '10', '11', '12'] },
    correctIndex: 2,
    hint: { ar: '١٠ لاعبين وحارس مرمى', en: '10 outfield players plus 1 goalkeeper' },
  },
  {
    id: 'q11',
    category: 'tech',
    difficulty: 2,
    question: { ar: 'ما البروتوكول المسؤول عن نقل صفحات الويب المشفرة؟', en: 'Which protocol is responsible for encrypted web traffic?' },
    options: { ar: ['FTP', 'HTTPS', 'SMTP', 'SSH'], en: ['FTP', 'HTTPS', 'SMTP', 'SSH'] },
    correctIndex: 1,
    hint: { ar: 'النسخة الآمنة من HTTP', en: 'Secure extension of HTTP' },
  },
  {
    id: 'q12',
    category: 'culture',
    difficulty: 2,
    question: { ar: 'من هو الشاعر العربي الملقب بأمير الشعراء؟', en: 'Which Arab poet is known as the Prince of Poets?' },
    options: { ar: ['المتنبي', 'أحمد شوقي', 'نزار قباني', 'محمود درويش'], en: ['Al-Mutanabbi', 'Ahmed Shawqi', 'Nizar Qabbani', 'Mahmoud Darwish'] },
    correctIndex: 1,
    hint: { ar: 'شاعر مصري رائد في العصر الحديث', en: 'Pioneering Egyptian poet of the modern era' },
  },
  {
    id: 'q13',
    category: 'science',
    difficulty: 2,
    question: { ar: 'ما الغاز الأكثر وفرة في الغلاف الجوي للأرض؟', en: 'Which gas makes up most of Earth’s atmosphere?' },
    options: { ar: ['الأكسجين', 'النيتروجين', 'ثاني أكسيد الكربون', 'الأرغون'], en: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'] },
    correctIndex: 1,
    hint: { ar: 'يشكل حوالي ٧٨٪ من الهواء', en: 'Makes up roughly 78% of the air' },
  },
  {
    id: 'q14',
    category: 'geography',
    difficulty: 2,
    question: { ar: 'أي مضيق يفصل بين قارتي آسيا وأمريكا الشمالية؟', en: 'Which strait separates Asia from North America?' },
    options: { ar: ['مضيق جبل طارق', 'مضيق بيرنغ', 'مضيق هرمز', 'مضيق ملقا'], en: ['Strait of Gibraltar', 'Bering Strait', 'Strait of Hormuz', 'Strait of Malacca'] },
    correctIndex: 1,
    hint: { ar: 'يقع بين روسيا وألاسكا', en: 'Located between Russia and Alaska' },
  },
  {
    id: 'q15',
    category: 'history',
    difficulty: 3,
    question: { ar: 'من هو صاحب كتاب "المناظر" الذي أسس علم البصريات الحديث؟', en: 'Who authored the Book of Optics (Kitab al-Manazir)?' },
    options: { ar: ['جابر بن حيان', 'الحسن بن الهيثم', 'الفارابي', 'الإدريسي'], en: ['Jabir ibn Hayyan', 'Ibn al-Haytham', 'Al-Farabi', 'Al-Idrisi'] },
    correctIndex: 1,
    hint: { ar: 'وُلد في البصرة وعاش في القاهرة', en: 'Born in Basra, known in Europe as Alhazen' },
  },
  {
    id: 'q16',
    category: 'science',
    difficulty: 3,
    question: { ar: 'ما هو أصلب معدن طبيعي على مقياس موس؟', en: 'What is the hardest natural mineral on the Mohs scale?' },
    options: { ar: ['الكوارتز', 'الياقوت', 'الألماس', 'التوباز'], en: ['Quartz', 'Corundum', 'Diamond', 'Topaz'] },
    correctIndex: 2,
    hint: { ar: 'درجته ١٠ على المقياس ويتكون من الكربون', en: 'Rated 10 on Mohs and made of pure carbon' },
  },
  {
    id: 'q17',
    category: 'tech',
    difficulty: 3,
    question: { ar: 'في أي عام أُطلق أول هاتف آيفون؟', en: 'In which year was the first iPhone released?' },
    options: { ar: ['٢٠٠٥', '٢٠٠٧', '٢٠٠٩', '٢٠١٠'], en: ['2005', '2007', '2009', '2010'] },
    correctIndex: 1,
    hint: { ar: 'قبل عام ٢٠٠٨ بعام واحد', en: 'One year before 2008' },
  },
  {
    id: 'q18',
    category: 'geography',
    difficulty: 3,
    question: { ar: 'كم عدد الدول العربية في قارة أفريقيا؟', en: 'How many Arab League countries are located in Africa?' },
    options: { ar: ['٨ دول', '٩ دول', '١٠ دول', '١٢ دولة'], en: ['8', '9', '10', '12'] },
    correctIndex: 2,
    hint: { ar: 'من مصر وتونس إلى موريتانيا وجزر القمر', en: 'Including Egypt, Morocco, Sudan, Somalia, and Comoros' },
  },
  {
    id: 'q19',
    category: 'sports',
    difficulty: 2,
    question: { ar: 'كم مرة فازت البرازيل بكأس العالم لكرة القدم؟', en: 'How many times has Brazil won the FIFA World Cup?' },
    options: { ar: ['٤ مرات', '٥ مرات', '٦ مرات', '٣ مرات'], en: ['4 times', '5 times', '6 times', '3 times'] },
    correctIndex: 1,
    hint: { ar: 'أكثر منتخب تتويجاً في التاريخ', en: 'The all-time record holder' },
  },
  {
    id: 'q20',
    category: 'culture',
    difficulty: 3,
    question: { ar: 'ما هي الآلة الموسيقية الوترية العربية ذات الرقبة القصيرة والظهر المحدب؟', en: 'Which pear-shaped Arabic string instrument is the ancestor of the lute?' },
    options: { ar: ['القانون', 'العود', 'الناي', 'الربابة'], en: ['Qanun', 'Oud', 'Ney', 'Rebab'] },
    correctIndex: 1,
    hint: { ar: 'اسمه يعني الخشب باللغة العربية', en: 'Its name means wood in Arabic' },
  },
];

export interface TrueFalseItem {
  id: string;
  statement: LocalizedText;
  isTrue: boolean;
  explanation: LocalizedText;
}

export const TRUE_FALSE_BANK: TrueFalseItem[] = [
  {
    id: 'tf1',
    statement: { ar: 'الأخطبوط يمتلك ثلاثة قلوب.', en: 'An octopus has three hearts.' },
    isTrue: true,
    explanation: { ar: 'قلبان يضخان الدم للخياشيم وقلب ثالث يضخه لبقية الجسم.', en: 'Two pump blood to the gills and one pumps it to the body.' },
  },
  {
    id: 'tf2',
    statement: { ar: 'سور الصين العظيم هو الهيكل الوحيد الذي يُرى بوضوح بالعين المجردة من القمر.', en: 'The Great Wall of China is clearly visible to the naked eye from the Moon.' },
    isTrue: false,
    explanation: { ar: 'هذه خرافة شائعة؛ السور ضيق جداً ولا يُرى من القمر بالعين المجردة.', en: 'A popular myth—the wall is far too narrow to see from lunar orbit without optics.' },
  },
  {
    id: 'tf3',
    statement: { ar: 'العسل الطبيعي لا يفسد تقريباً إذا حُفظ مغلقاً بإحكام.', en: 'Natural honey virtually never spoils when sealed properly.' },
    isTrue: true,
    explanation: { ar: 'بسبب انخفاض الرطوبة وارتفاع الحموضة، وُجد عسل صالح للأكل في مقابر فرعونية.', en: 'Low moisture and high acidity prevent bacterial growth for millennia.' },
  },
  {
    id: 'tf4',
    statement: { ar: 'اليوم على كوكب الزهرة أقصر من سنته.', en: 'A day on Venus is shorter than a year on Venus.' },
    isTrue: false,
    explanation: { ar: 'الزهرة يدور حول نفسه ببطء شديد، فيومه أطول من دورته حول الشمس!', en: 'Venus rotates so slowly that one Venusian day is longer than its year.' },
  },
  {
    id: 'tf5',
    statement: { ar: 'الموز يُصنف نباتياً ضمن التوتيات (Berries).', en: 'Botanically speaking, bananas are classified as berries.' },
    isTrue: true,
    explanation: { ar: 'بينما الفراولة ليست توتاً نباتياً، فإن الموز ينطبق عليه التعريف النباتي للتوت.', en: 'Bananas develop from a single flower with one ovary, meeting the botanical definition.' },
  },
  {
    id: 'tf6',
    statement: { ar: 'البرق لا يضرب المكان نفسه مرتين أبداً.', en: 'Lightning never strikes the same place twice.' },
    isTrue: false,
    explanation: { ar: 'المباني الشاهقة مثل برج خليفة وإمباير ستيت تتعرض لعشرات الصواعق سنوياً.', en: 'Tall towers are struck dozens of times every single year.' },
  },
  {
    id: 'tf7',
    statement: { ar: 'بصمات الكوالا تشبه بصمات الإنسان لدرجة قد تخدع الفحص العادي.', en: 'Koala fingerprints are remarkably similar to human fingerprints.' },
    isTrue: true,
    explanation: { ar: 'تمتلك حيوانات الكوالا خطوطاً جلدية دقيقة جداً تشبه بصمات البشر.', en: 'Even under magnification, koala ridge patterns closely mirror human prints.' },
  },
  {
    id: 'tf8',
    statement: { ar: 'الماء الساخن يتجمد أحياناً أسرع من الماء البارد في ظروف معينة.', en: 'Hot water can sometimes freeze faster than cold water under specific conditions.' },
    isTrue: true,
    explanation: { ar: 'تُعرف هذه الظاهرة الفيزيائية بتأثير مبيمبا (Mpemba Effect).', en: 'Known as the Mpemba effect, observed in specific cooling setups.' },
  },
  {
    id: 'tf9',
    statement: { ar: 'السمكة الذهبية تمتلك ذاكرة مدتها ٣ ثوانٍ فقط.', en: 'Goldfish only have a 3-second memory.' },
    isTrue: false,
    explanation: { ar: 'أثبتت الدراسات أن الأسماك الذهبية تتذكر الأنماط والأوقات لأشهر طويلة.', en: 'Studies show goldfish retain memories and trained routines for months.' },
  },
  {
    id: 'tf10',
    statement: { ar: 'الضوء يستغرق نحو ٨ دقائق ليصل من الشمس إلى الأرض.', en: 'Sunlight takes roughly 8 minutes to travel from the Sun to Earth.' },
    isTrue: true,
    explanation: { ar: 'نحو ٨ دقائق و ٢٠ ثانية لقطع مسافة ١٥٠ مليون كيلومتر.', en: 'About 8 minutes and 20 seconds across 150 million kilometers.' },
  },
  {
    id: 'tf11',
    statement: { ar: 'البطاريق تعيش في القطب الشمالي أيضاً.', en: 'Wild penguins naturally live at the North Pole.' },
    isTrue: false,
    explanation: { ar: 'جميع البطاريق البرية تعيش في نصف الكرة الجنوبي.', en: 'Wild penguins live exclusively in the Southern Hemisphere.' },
  },
  {
    id: 'tf12',
    statement: { ar: 'الشطرنج الحديث نشأ وتطور عبر بلاد فارس والعالم العربي قبل انتقاله لأوروبا.', en: 'Modern chess evolved through Persia and the Arab world before reaching Europe.' },
    isTrue: true,
    explanation: { ar: 'كلمة "كش ملك" أصلها الفارسي العربي "شاه مات".', en: 'Even "Checkmate" comes from the Persian/Arabic phrase "Shah Mat".' },
  },
];

export interface CharacterPuzzle {
  id: string;
  answer: LocalizedText;
  options: { ar: string[]; en: string[] };
  clues: { ar: string[]; en: string[] };
}

export const CHARACTER_PUZZLES: CharacterPuzzle[] = [
  {
    id: 'ch1',
    answer: { ar: 'ابن سينا', en: 'Ibn Sina (Avicenna)' },
    options: {
      ar: ['ابن سينا', 'الرازي', 'ابن رشد', 'الفارابي'],
      en: ['Ibn Sina (Avicenna)', 'Al-Razi', 'Ibn Rushd', 'Al-Farabi'],
    },
    clues: {
      ar: [
        'عالم وطبيب وفيلسوف عاش في العصر الذهبي الإسلامي.',
        'وُلد قرب بخارى في القرن العاشر الميلادي.',
        'لُقّب بالشيخ الرئيس.',
        'درّست جامعات أوروبا كتابه الطبي لعدة قرون.',
        'أشهر مؤلفاته كتاب "القانون في الطب".',
      ],
      en: [
        'A polymath physician and philosopher from the Islamic Golden Age.',
        'Born near Bukhara in the 10th century.',
        'Known in the Arab world as Al-Shaykh al-Ra’is.',
        'His medical encyclopedia was taught in European universities for centuries.',
        'Author of "The Canon of Medicine".',
      ],
    },
  },
  {
    id: 'ch2',
    answer: { ar: 'ماري كوري', en: 'Marie Curie' },
    options: {
      ar: ['روزاليند فرانكلين', 'ماري كوري', 'آدا لوفلايس', 'غريس هوبر'],
      en: ['Rosalind Franklin', 'Marie Curie', 'Ada Lovelace', 'Grace Hopper'],
    },
    clues: {
      ar: [
        'عالمة فيزياء وكيمياء رائدة في أوائل القرن العشرين.',
        'وُلدت في بولندا وأكملت أبحاثها في باريس.',
        'اكتشفت عنصري البولونيوم والراديوم.',
        'أول امرأة تفوز بجائزة نوبل.',
        'الشخص الوحيد الذي فاز بنوبل في علمين مختلفين: الفيزياء والكيمياء.',
      ],
      en: [
        'Pioneering physicist and chemist of the early 20th century.',
        'Born in Poland and conducted her breakthrough research in Paris.',
        'Discovered the elements polonium and radium.',
        'First woman to ever win a Nobel Prize.',
        'Only person to win Nobel Prizes in both Physics and Chemistry.',
      ],
    },
  },
  {
    id: 'ch3',
    answer: { ar: 'ابن بطوطة', en: 'Ibn Battuta' },
    options: {
      ar: ['ماركو بولو', 'ابن بطوطة', 'الإدريسي', 'ماجلان'],
      en: ['Marco Polo', 'Ibn Battuta', 'Al-Idrisi', 'Magellan'],
    },
    clues: {
      ar: [
        'رحالة ومؤرخ شهير من القرن الرابع عشر.',
        'انطلق في رحلته من مدينة طنجة المغربية.',
        'استغرقت أسفاره قرابة ٣٠ عاماً.',
        'قطع أكثر من ١١٧ ألف كيلومتر عبر أفريقيا وآسيا وأوروبا.',
        'أُمليت رحلاته في كتاب "تحفة النظار في غرائب الأمصار".',
      ],
      en: [
        'Famous 14th-century explorer and scholar.',
        'Set out on his travels from Tangier, Morocco.',
        'His journeys spanned nearly 30 years.',
        'Traveled over 117,000 km across Africa, Asia, and Europe.',
        'Recorded his travels in the "Rihla".',
      ],
    },
  },
  {
    id: 'ch4',
    answer: { ar: 'ألبرت أينشتاين', en: 'Albert Einstein' },
    options: {
      ar: ['إسحاق نيوتن', 'نيكولا تسلا', 'ألبرت أينشتاين', 'ماكس بلانك'],
      en: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Max Planck'],
    },
    clues: {
      ar: [
        'فيزيائي نظري غيّر فهمنا للزمان والمكان.',
        'عمل في بداية حياته في مكتب براءات الاختراع السويسري.',
        'حصل على نوبل لتفسيره التأثير الكهروضوئي.',
        'صاحب المعادلة الشهيرة E = mc².',
        'مؤسس النظرية النسبية.',
      ],
      en: [
        'Theoretical physicist who reshaped our view of space and time.',
        'Worked early on as a patent clerk in Switzerland.',
        'Won the Nobel Prize for explaining the photoelectric effect.',
        'Formulated the iconic equation E = mc².',
        'Creator of the Theory of Relativity.',
      ],
    },
  },
  {
    id: 'ch5',
    answer: { ar: 'أحمد زويل', en: 'Ahmed Zewail' },
    options: {
      ar: ['مجدي يعقوب', 'أحمد زويل', 'فاروق الباز', 'مصطفى مشرفة'],
      en: ['Magdi Yacoub', 'Ahmed Zewail', 'Farouk El-Baz', 'Ali Moustafa Mosharafa'],
    },
    clues: {
      ar: [
        'عالم عربي بارز في مجال الكيمياء والفيزياء.',
        'تخرج في جامعة الإسكندرية وأكمل أبحاثه في كالتك.',
        'ابتكر طريقة لمراقبة التفاعلات الكيميائية بالغة السرعة.',
        'مرتبط اسمه بوحدة زمنية قدرها ١٠⁻¹⁵ ثانية.',
        'فاز بجائزة نوبل في الكيمياء عام ١٩٩٩ لريادته في كيمياء الفيمتو.',
      ],
      en: [
        'Renowned Arab chemist and physicist.',
        'Graduated from Alexandria University before joining Caltech.',
        'Used ultra-fast lasers to film chemical reactions in real time.',
        'Known for studying phenomena at 10⁻¹⁵ of a second.',
        'Won the 1999 Nobel Prize in Chemistry for Femtochemistry.',
      ],
    },
  },
  {
    id: 'ch6',
    answer: { ar: 'آدا لوفلايس', en: 'Ada Lovelace' },
    options: {
      ar: ['آدا لوفلايس', 'ماري شيلي', 'هيدي لامار', 'كاثرين جونسون'],
      en: ['Ada Lovelace', 'Mary Shelley', 'Hedy Lamarr', 'Katherine Johnson'],
    },
    clues: {
      ar: [
        'عالمة رياضيات إنجليزية من القرن التاسع عشر.',
        'تعاونت مع تشارلز بابيج على المحرك التحليلي.',
        'أدركت أن الآلات قادرة على معالجة الرموز والموسيقى وليس الأرقام فقط.',
        'كتبت أول خوارزمية مخصصة للتنفيذ على آلة حاسبة.',
        'تُعد أول مبرمجة حاسوب في التاريخ.',
      ],
      en: [
        '19th-century English mathematician.',
        'Collaborated with Charles Babbage on the Analytical Engine.',
        'Saw that machines could process symbols and music beyond pure math.',
        'Wrote the first algorithm intended for a computing machine.',
        'Recognized as the world’s first computer programmer.',
      ],
    },
  },
];

export const FIVE_LETTER_WORDS = {
  ar: [
    'شطرنج',
    'تحديات',
    'صحراء',
    'مصباح',
    'قرطاج',
    'ياقوت',
    'سفينة',
    'ميدان',
    'فنجان',
    'نجوم',
    'قلمون',
    'عصفور',
    'مكتبة',
    'منارة',
    'بساطة',
  ].filter((w) => Array.from(w).length === 5),
  en: [
    'BOARD',
    'CHESS',
    'QUEST',
    'SPARK',
    'BRAVE',
    'CROWN',
    'STONE',
    'LIGHT',
    'CLOCK',
    'PIANO',
    'GLOBE',
    'FLAME',
    'PRISM',
    'CRAFT',
    'GUILD',
  ],
};

export const SCRAMBLE_WORDS = {
  ar: [
    { word: 'طاولة', hint: 'قطعة أثاث أو لعبة نرد شهيرة' },
    { word: 'مغامرة', hint: 'تجربة مثيرة غير مألوفة' },
    { word: 'أصدقاء', hint: 'رفاق اللعب والتحديات' },
    { word: 'ذكريات', hint: 'لحظات جميلة محفوظة في البال' },
    { word: 'استراحة', hint: 'فترة هدوء بين الجولات' },
    { word: 'انتصار', hint: 'تحقيق المركز الأول' },
    { word: 'خوارزمية', hint: 'خطوات متسلسلة لحل مسألة' },
    { word: 'بوصلة', hint: 'أداة تحديد الاتجاهات' },
  ],
  en: [
    { word: 'PUZZLE', hint: 'A game designed to test ingenuity' },
    { word: 'VICTORY', hint: 'Winning the match' },
    { word: 'LANTERN', hint: 'A portable warm light source' },
    { word: 'JOURNAL', hint: 'A daily log of notes and history' },
    { word: 'COMPASS', hint: 'Navigates north, south, east, west' },
    { word: 'FRIENDS', hint: 'Best people to share a game room with' },
    { word: 'MYSTERY', hint: 'Something secret waiting to be solved' },
    { word: 'PARLOR', hint: 'A cozy room for tabletop games' },
  ],
};

export interface RiddleItem {
  id: string;
  question: LocalizedText;
  options: { ar: string[]; en: string[] };
  correctIndex: number;
  hint: LocalizedText;
}

export const RIDDLES_BANK: RiddleItem[] = [
  {
    id: 'r1',
    question: {
      ar: 'له أوراق لكنه ليس شجرة، وله جلد لكنه ليس حيواناً، ويتكلم بلا لسان. ما هو؟',
      en: 'It has leaves yet is not a tree, a spine yet no bones, and tells stories without speaking. What is it?',
    },
    options: { ar: ['الدفتر القديم', 'الكتاب', 'الصحيفة', 'الرسالة'], en: ['A Tree', 'A Book', 'A Radio', 'A Mirror'] },
    correctIndex: 1,
    hint: { ar: 'تجد فيه المعرفة والقصص على الرفوف', en: 'Found on library shelves' },
  },
  {
    id: 'r2',
    question: {
      ar: 'كلما أخذت منه كَبُر واتسع، وكلما أضفت إليه صغر. ما هو؟',
      en: 'The more you take away from it, the larger it becomes. What is it?',
    },
    options: { ar: ['السحاب', 'الحفرة', 'الظل', 'البحر'], en: ['A Cloud', 'A Hole', 'A Shadow', 'A Bank'] },
    correctIndex: 1,
    hint: { ar: 'تظهر في الأرض عند الحفر', en: 'Created when digging in the ground' },
  },
  {
    id: 'r3',
    question: {
      ar: 'ما الرقم التالي في المتتالية المنطقية: 2، 6، 12، 20، 30، ...؟',
      en: 'What comes next in the logical sequence: 2, 6, 12, 20, 30, ...?',
    },
    options: { ar: ['38', '40', '42', '44'], en: ['38', '40', '42', '44'] },
    correctIndex: 2,
    hint: { ar: 'الفرق بين الأرقام يزيد بمقدار ٢ في كل مرة (+4، +6، +8، +10...)', en: 'The gap grows by +2 each step (+4, +6, +8, +10...)' },
  },
  {
    id: 'r4',
    question: {
      ar: 'يمشي بلا أرجل، ويبكي بلا عيون، وإذا مرّ على الغصون حرّكها. ما هو؟',
      en: 'It runs without legs, whispers without a mouth, and moves treetops as it passes. What is it?',
    },
    options: { ar: ['النهر', 'الريح', 'المطر', 'الضوء'], en: ['River', 'The Wind', 'Rain', 'Light'] },
    correctIndex: 1,
    hint: { ar: 'هواء متحرك لا يُرى بالعين', en: 'Invisible moving air' },
  },
  {
    id: 'r5',
    question: {
      ar: 'ما الشيء الذي تملكه وحدك، ولكن يستخدمه الآخرون أكثر منك؟',
      en: 'What belongs solely to you, yet others use it far more than you do?',
    },
    options: { ar: ['وقتك', 'اسمك', 'منزلك', 'هاتفك'], en: ['Your Time', 'Your Name', 'Your Keys', 'Your Voice'] },
    correctIndex: 1,
    hint: { ar: 'يناديك به الناس كل يوم', en: 'People call you by it every day' },
  },
  {
    id: 'r6',
    question: {
      ar: 'إذا كان هناك ٣ تفاحات وأخذت منها تفاحتين، فكم تفاحة لديك الآن؟',
      en: 'There are 3 apples on a table and you take away 2. How many apples do YOU have?',
    },
    options: { ar: ['١ تفاحة', '٢ تفاحتان', '٣ تفاحات', 'صفر'], en: ['1 apple', '2 apples', '3 apples', '0 apples'] },
    correctIndex: 1,
    hint: { ar: 'اقرأ السؤال بدقة: كم تفاحة أخذتَ أنت؟', en: 'Read carefully: how many did you take?' },
  },
  {
    id: 'r7',
    question: {
      ar: 'مدينة بلا سكان، وشوارع بلا سيارات، وأنهار بلا ماء. ما هي؟',
      en: 'It has cities with no houses, mountains with no trees, and water with no fish. What is it?',
    },
    options: { ar: ['الحلم', 'الخريطة', 'اللوحة', 'السراب'], en: ['A Dream', 'A Map', 'A Painting', 'A Mirage'] },
    correctIndex: 1,
    hint: { ar: 'تستخدمها لمعرفة المواقع والدول', en: 'Used by travelers to locate places' },
  },
];

export const DRAW_PROMPTS = {
  ar: [
    'شمس', 'منزل', 'سيارة', 'قطة', 'شجرة', 'ساعة', 'مفتاح', 'سفينة',
    'جبل', 'مظلة', 'كتاب', 'هاتف', 'طائرة', 'سمكة', 'نظارة', 'فنجان',
    'تاج', 'صاروخ', 'دراجة', 'شمعة', 'قمر', 'كرة قدم', 'جسر', 'آيس كريم',
  ],
  en: [
    'Sun', 'House', 'Car', 'Cat', 'Tree', 'Clock', 'Key', 'Boat',
    'Mountain', 'Umbrella', 'Book', 'Phone', 'Airplane', 'Fish', 'Glasses', 'Coffee Cup',
    'Crown', 'Rocket', 'Bicycle', 'Candle', 'Crescent Moon', 'Soccer Ball', 'Bridge', 'Ice Cream',
  ],
};

export const LETTER_CHALLENGE_POOL = {
  ar: ['أ', 'ب', 'ت', 'ج', 'ح', 'د', 'ر', 'س', 'ش', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و'],
  en: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W'],
};

export const MILLIONAIRE_TIERS = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000,
];

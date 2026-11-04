import type { AdventureWorld, Checkpoint } from '#/modules/games/adventure/types'
import { KILL_Y, site, type Site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { PUZZLES } from '#/modules/games/adventure/worlds/forgotten-island/puzzles'

const checkpoint = (id: Site, yaw: number, dx = 0, dz = 0): Checkpoint => ({ id, position: site(id, dx, dz, 1.2), yaw })

/** Everything about the island except its 3D scene, so rules and content are testable without WebGL. */
const ISLAND_DATA: Omit<AdventureWorld, 'Scene'> = {
  id: 'island',
  title: 'جزیرهٔ فراموش‌شده',
  description: 'جزیره‌ای متروک را بگرد، سه یادگار گم‌شده را پیدا کن و فانوس را دوباره روشن کن',
  items: {
    'sun-disc': {
      id: 'sun-disc',
      kind: 'artifact',
      name: 'گردهٔ خورشید',
      description: 'قرصی از سنگ زرد که هنوز گرمای آفتاب را در خود دارد. از زیارتگاه ساحلی.',
      icon: '🌞',
    },
    'tide-shell': {
      id: 'tide-shell',
      kind: 'artifact',
      name: 'صدف جزر و مد',
      description: 'صدفی سرد و براق که اگر کنار گوش بگیری، صدای دریا را تکرار می‌کند. از ویرانه‌های غرقاب.',
      icon: '🐚',
    },
    'wind-feather': {
      id: 'wind-feather',
      kind: 'artifact',
      name: 'پر باد',
      description: 'پری بلند و سفید که بی‌وزش باد هم تکان می‌خورد. از معبد صخره.',
      icon: '🪶',
    },
    'journal-1': {
      id: 'journal-1',
      kind: 'journal',
      name: 'برگ اول دفترچه',
      description: 'کنار اجاق خاموش اردوگاه.',
      icon: '📜',
      text: 'ما نگهبانان فانوس بودیم. نسل به نسل، شعلهٔ بالای کوه را روشن نگه داشتیم تا هیچ کشتی‌ای در مه گم نشود. حالا اردوگاه خالی است، قایق‌ها شکسته‌اند و فانوس خاموش. اگر این را می‌خوانی، شاید هنوز دیر نشده باشد.',
    },
    'journal-2': {
      id: 'journal-2',
      kind: 'journal',
      name: 'برگ دوم دفترچه',
      description: 'لای ریشه‌های درختی در جنگل.',
      icon: '📜',
      text: 'شعله با سه یادگار زنده بود: خورشید، دریا و باد. شب توفان، نگهبان پیر آن‌ها را برداشت و هر کدام را جایی پنهان کرد که فقط صبور‌ها پیدا کنند. گفت محراب معبد میانی باید دوباره هر سه را در آغوش بگیرد.',
    },
    'journal-3': {
      id: 'journal-3',
      kind: 'journal',
      name: 'برگ سوم دفترچه',
      description: 'روی دیوار ویرانه‌های غرقاب.',
      icon: '📜',
      text: 'آب حیاط را دریچه‌ها نگه می‌دارند. پدرم ترتیبش را این‌طور یادم داد: «اول موج، بعد خورشید، سپس ستاره، و آخر از همه ماه.» اگر اشتباه کنی، دریچه‌ها خودشان بسته می‌شوند. از اول شروع کن.',
    },
    'journal-4': {
      id: 'journal-4',
      kind: 'journal',
      name: 'برگ چهارم دفترچه',
      description: 'در غاری پشت آبشار.',
      icon: '📜',
      text: 'بچه‌ها پشت آبشار پنهان می‌شدند و فکر می‌کردند کسی نمی‌داند. من هم وقتی کوچک بودم همین‌جا می‌نشستم و به صدای آب گوش می‌دادم. آن روزها جزیره پر از صدای خنده بود.',
    },
    'journal-5': {
      id: 'journal-5',
      kind: 'journal',
      name: 'برگ پنجم دفترچه',
      description: 'در سرداب زیر اردوگاه.',
      icon: '📜',
      text: 'آخرین قایق امشب می‌رود. پیرمرد نمی‌آید؛ می‌گوید کسی باید بماند تا راز یادگارها فراموش نشود. نقشه‌ها را این‌جا زیر خاک گذاشتم. اگر روزی برگشتیم، از همین سرداب شروع می‌کنیم.',
    },
    'journal-6': {
      id: 'journal-6',
      kind: 'journal',
      name: 'برگ ششم دفترچه',
      description: 'در گذرگاه پنهان صخره.',
      icon: '📜',
      text: 'نگهبانان راهی میان‌بر از صخره تا معبد ساخته بودند، پشت بوته‌ها. هنوز سنگ‌هایش گرم است، انگار کسی تازه از آن گذشته. شاید پیرمرد هنوز این‌جاست. شاید هم فقط باد است.',
    },
  },
  puzzles: PUZZLES,
  checkpoints: {
    start: checkpoint('start', 0),
    shrine: checkpoint('shrine', -0.6, 6, 8),
    ruins: checkpoint('ruins', 1.2, -14, 6),
    cliff: checkpoint('cliff', -1.4, 8, 10),
    temple: checkpoint('temple', 0, 0, 12),
    summit: checkpoint('summit', 0, 0, 4),
  },
  secrets: {
    'waterfall-passage': { id: 'waterfall-passage', kind: 'passage' },
    'cliff-shortcut': { id: 'cliff-shortcut', kind: 'passage' },
    'buried-cellar': { id: 'buried-cellar', kind: 'discovery' },
  },
  objective: { requires: ['altar'], trigger: 'reach' },
  killY: KILL_Y,
  hints: {
    start:
      'سه یادگار در سه گوشهٔ جزیره پنهان‌اند. مسیرها را دنبال کن: غرب به زیارتگاه ساحلی، شرق به ویرانه‌ها، شمال‌غرب به صخره.',
    shrine: 'نقش‌برجستهٔ کنار زیارتگاه سه نشانه دارد. هر ستون را آن‌قدر بچرخان تا نشانهٔ رو به تو با نقش هماهنگ شود.',
    forest:
      'ویرانه‌ها در شرق جنگل‌اند. دیوارهای ویرانه را خوب نگاه کن؛ نگهبانان یادداشت‌هایشان را همه‌جا جا می‌گذاشتند.',
    ruins: 'ترتیب باز کردن دریچه‌ها در برگ سوم دفترچه آمده. نشانهٔ روی هر دریچه را با متن مقایسه کن.',
    cliff: 'نشانه‌های دیوار به ترتیب روشن می‌شوند. زنگ‌های سنگی را به همان ترتیب بنواز؛ هر زنگ نشانهٔ خودش را دارد.',
    temple: 'محراب سه جای خالی دارد. هر یادگاری که داری را آن‌جا بگذار.',
    summit: 'فانوس بالای کوه منتظر است. به آن نزدیک شو.',
  },
}

export { ISLAND_DATA }

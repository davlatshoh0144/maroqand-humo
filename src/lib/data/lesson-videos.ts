import type { Course, Lesson } from '@/lib/types';

type LessonVideo = {
  youtubeId: string;
  title: string;
  source: string;
};

export const verifiedLessonVideos = {
  dispatchFoundations: {
    youtubeId: 'bsiPiE-zT5c',
    title: 'Full Truck Dispatching Course (100% Free) | Part 1',
    source: 'Gill22',
  },
  dispatchBasics: {
    youtubeId: '4Lj_vsqRQ5g',
    title: 'How To Start Truck Dispatching | The Basics',
    source: 'Gill22',
  },
  dispatchSoftware: {
    youtubeId: 'GwYBqUQ6Xa0',
    title: 'Can This Free Software Make Dispatching Easy?',
    source: 'Dispatch Trucks',
  },
  dispatch101: {
    youtubeId: 'Fz-IHB5xtM4',
    title: 'Truck Dispatching Basics: Dispatching 101',
    source: 'Trucking Made Successful',
  },
  brokerNegotiation: {
    youtubeId: '9KGJDpQf7X0',
    title: 'Freight Broker vs Truck Dispatcher: How To Always Negotiate Good Loads',
    source: 'Trucking42 School',
  },
  liveBrokerCalls: {
    youtubeId: 'uZrgLFoiJkA',
    title: 'Freight Dispatching: LIVE BROKER CALL EXAMPLE',
    source: 'Covenant Dispatch LLC',
  },
  negotiationPsychology: {
    youtubeId: 'r2ocP6Q_Es0',
    title: 'The Psychology of Negotiation: Dispatchers vs. Brokers',
    source: 'Dispatch Training Center Official Trucking Channel',
  },
  loadBoardFullCourse: {
    youtubeId: 'AUC18KcZtJ8',
    title: 'The Ultimate Guide To Truck Dispatching In 2025 (Full Course)',
    source: 'Gill22',
  },
  bookingLoads: {
    youtubeId: 'O5Uc6Xg1ID4',
    title: 'How To Book Loads For Beginners In 2026 [Full Guide]',
    source: 'Gill22',
  },
  beginnerDispatchCourse: {
    youtubeId: 'jS8FtABlpF4',
    title: 'How To Start Truck Dispatching As A Beginner In 2026 (5 hours)',
    source: 'Gill22',
  },
  hosRules: {
    youtubeId: 'wRPfwgN2T2Y',
    title: 'Basics of dispatching: HOS (hours of service) regulations',
    source: 'Dispatch Training Center Official Trucking Channel',
  },
  fmcsaGuidelines: {
    youtubeId: '8OFA0RVSsxQ',
    title: 'Independent freight dispatching company under the new FMCSA guidelines',
    source: 'Brandon Manney The Mentor',
  },
  complianceBasics: {
    youtubeId: '0cQOpg_Ez-U',
    title: 'Learn Compliance the RIGHT Way',
    source: 'Dispatch Training Center Official Trucking Channel',
  },
  dqFiles: {
    youtubeId: 'PGYCQYbS2Io',
    title: 'DQ files and hiring process in the trucking industry',
    source: 'Dispatch Training Center Official Trucking Channel',
  },
  freightDocuments: {
    youtubeId: '5mhXYycdZU4',
    title: 'Bill of Lading in Trucking (BOL)',
    source: 'Truck Dispatcher Training',
  },
  rateConfirmation: {
    youtubeId: 'WWu3qvm2FzA',
    title: 'What is a Rate Confirmation? Overview & Examples',
    source: 'Truck Dispatcher Training',
  },
  truckingTerms: {
    youtubeId: '-PBv0DD_z1I',
    title: 'Freight Dispatcher Terms You MUST to Know',
    source: 'Truck Dispatcher Training',
  },
  costPerMile: {
    youtubeId: 'E8cXq0K9LmE',
    title: 'Breaking Even or Losses: Cost of Running a Truck Per Mile',
    source: 'ET Transport',
  },
  truckingCashFlow: {
    youtubeId: 'Jx3NvmVDpjg',
    title: 'How To GROW Your Trucking Business CASH FLOW',
    source: 'Trucking From Scratch',
  },
  truckEquipment: {
    youtubeId: 'J8KsSLTYw0c',
    title: 'Buying Truck, tools and equipments',
    source: 'Logrock',
  },
  truckWeightRatings: {
    youtubeId: 'ndxAbNjlKrI',
    title: 'Vehicle Weight Ratings | DOT Compliance when Hauling Equipment',
    source: 'Heavy Metal Learning',
  },
  fleetManagement: {
    youtubeId: 'V_KX5AtVndM',
    title: 'Truck Dispatcher: How to Manage Truck Drivers in your Fleet?',
    source: 'EZLOGZ',
  },
  ownerOperatorDispatch: {
    youtubeId: 'vTjcLD9Ce0Q',
    title: 'Dispatching Yourself as an Owner Operator vs. Having a Dispatcher',
    source: 'Never Stop Trucking',
  },
  companyDriverVsOwnerOperator: {
    youtubeId: '2XLX89sD7U0',
    title: 'The 5 BIGGEST DIFFERENCES Between Company Drivers & Owner Operators',
    source: 'Trucking From Scratch',
  },
  amazonRelay: {
    youtubeId: '5gPX-b8JiBw',
    title: 'Amazon Relay Explained: Features, Benefits, and How It Works for Truckers',
    source: 'Never Stop Trucking',
  },
  postalFreight: {
    youtubeId: 'Qbj1ynN93J8',
    title: 'Freight vs. Postal: How to Successfully Manage Both',
    source: 'Truck N Hustle',
  },
} as const satisfies Record<string, LessonVideo>;

type LessonVideoKey = keyof typeof verifiedLessonVideos;

const defaultVideoByCourseTitle: Record<string, LessonVideoKey> = {
  'Dispatch Fundamentals': 'dispatchFoundations',
  'Broker Communication': 'brokerNegotiation',
  'Load Board Training': 'loadBoardFullCourse',
  'HOS / ELD Basics': 'hosRules',
  'DOT / FMCSA Compliance': 'complianceBasics',
  'Documents & Rate Confirmations': 'freightDocuments',
  'Accounting for Dispatchers': 'costPerMile',
  'Truck Operations': 'truckEquipment',
  'Safety & Fleet Management': 'fleetManagement',
  'Dispatcher Career Preparation': 'ownerOperatorDispatch',
  'Amazon-Style Freight Training': 'amazonRelay',
  'USPS / Postal Freight Training': 'postalFreight',
};

const lessonVideoRules: Array<{ pattern: RegExp; video: LessonVideoKey }> = [
  { pattern: /software|tools|workstation|tms|portal/i, video: 'dispatchSoftware' },
  { pattern: /terminology|terms|glossary|abbreviation/i, video: 'truckingTerms' },
  { pattern: /first load|book|booking|load lifecycle|pickup|delivery/i, video: 'bookingLoads' },
  { pattern: /broker|negotiat|rate|communication|email|relationship|service failure|difficult/i, video: 'brokerNegotiation' },
  { pattern: /live call|phone|call/i, video: 'liveBrokerCalls' },
  { pattern: /psychology|pressure|anchor|silence/i, video: 'negotiationPsychology' },
  { pattern: /load board|search|market|scam|post/i, video: 'loadBoardFullCourse' },
  { pattern: /hos|hours of service|eld|driver log|schedule/i, video: 'hosRules' },
  { pattern: /fmcsa|authority|registration|regulatory|dot/i, video: 'fmcsaGuidelines' },
  { pattern: /csa|audit|drug|alcohol|compliance/i, video: 'complianceBasics' },
  { pattern: /qualification|dq file|hiring/i, video: 'dqFiles' },
  { pattern: /rate confirmation|rate con/i, video: 'rateConfirmation' },
  { pattern: /bill of lading|bol|proof of delivery|pod|document|paperwork/i, video: 'freightDocuments' },
  { pattern: /accessorial|invoice|receivable|collection|cash flow/i, video: 'truckingCashFlow' },
  { pattern: /cost per mile|profit|fuel|accounting|financial/i, video: 'costPerMile' },
  { pattern: /weight|bridge law|loading|unloading/i, video: 'truckWeightRatings' },
  { pattern: /truck|equipment|reefer|flatbed|temperature|route|multi-stop/i, video: 'truckEquipment' },
  { pattern: /fleet|maintenance|accident|insurance|safety culture|preventive/i, video: 'fleetManagement' },
  { pattern: /career|resume|interview|freelance|network|owner-operator|company driver/i, video: 'ownerOperatorDispatch' },
  { pattern: /amazon|relay|appointment|trailer|check-in|detention/i, video: 'amazonRelay' },
  { pattern: /usps|postal|drop-and-hook|seal|on-time|time-sensitive/i, video: 'postalFreight' },
];

const youtubeIdPattern = /^[\w-]{11}$/;

export function buildYouTubeWatchUrl(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function extractYouTubeId(value: string) {
  const input = value.trim();
  if (youtubeIdPattern.test(input)) return input;

  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && youtubeIdPattern.test(id) ? id : null;
    }
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
      const watchId = url.searchParams.get('v');
      if (watchId && youtubeIdPattern.test(watchId)) return watchId;
      const embedMatch = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
      return embedMatch?.[1] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeEmbedUrl(value: string) {
  const id = extractYouTubeId(value);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function buildYouTubeThumbnailUrl(value: string, quality: 'mqdefault' | 'hqdefault' = 'hqdefault') {
  const id = extractYouTubeId(value);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : '';
}

export function getLessonVideoUrl(
  course: Pick<Course, 'title' | 'category'>,
  lesson: Pick<Lesson, 'title' | 'description' | 'videoUrl'>
) {
  if (lesson.videoUrl?.trim()) return lesson.videoUrl.trim();

  const searchableText = `${course.title} ${course.category} ${lesson.title} ${lesson.description}`;
  const matchedRule = lessonVideoRules.find((rule) => rule.pattern.test(searchableText));
  const videoKey = matchedRule?.video ?? defaultVideoByCourseTitle[course.title] ?? 'dispatchBasics';
  return buildYouTubeWatchUrl(verifiedLessonVideos[videoKey].youtubeId);
}

export function applyLessonVideoFallbacks(courses: Course[]): Course[] {
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      videoUrl: getLessonVideoUrl(course, lesson),
    })),
  }));
}

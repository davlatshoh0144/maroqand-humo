import { Instructor } from '@/lib/types';

export const instructors: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'Alisher Karimov',
    avatar: '/instructor-2.png',
    experience: '10+ years',
    specialization: 'Freight Dispatch & Operations',
    coursesTaught: 3,
    bio: 'Alisher teaches dispatch workflow, load planning, broker communication, and day-to-day operations habits for new learners. His lessons focus on practical scenarios, clear documentation, and the decision-making process behind safe dispatch work.',
  },
  {
    id: 'instructor-2',
    name: 'Nodira Azimova',
    avatar: '/instructor-3.png',
    experience: '8 years',
    specialization: 'Broker Relations & Business Communication',
    coursesTaught: 2,
    bio: 'Nodira focuses on broker-carrier communication, professional email writing, negotiation practice, and relationship-building workflows. Her courses help learners write clearly, ask better questions, and handle common communication scenarios.',
  },
  {
    id: 'instructor-3',
    name: 'Timur Rakhimov',
    avatar: '/instructor-2.png',
    experience: '12 years',
    specialization: 'DOT Compliance & Fleet Safety',
    coursesTaught: 3,
    bio: 'Timur teaches compliance-aware dispatch habits, HOS concepts, documentation routines, and fleet safety basics. His training emphasizes careful verification and explains that course material is educational, not legal advice or official certification.',
  },
  {
    id: 'instructor-4',
    name: 'Dilshod Usmonov',
    avatar: '/instructor-3.png',
    experience: '7 years',
    specialization: 'Transportation Accounting & Career Development',
    coursesTaught: 2,
    bio: 'Dilshod teaches transportation finance basics, cost-per-mile thinking, invoicing concepts, and career-readiness preparation. His courses help learners understand how dispatch decisions connect to business operations.',
  },
];

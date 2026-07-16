const MOVEMENT_PATTERNS = {
  squat: {
    label: 'Squat Pattern',
    examples: ['Barbell Squat', 'Leg Press', 'Goblet Squat'],
  },
  hinge: {
    label: 'Hinge Pattern',
    examples: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Back Extension'],
  },
  'horizontal-press': {
    label: 'Horizontal Press',
    examples: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Machine Chest Press'],
  },
  'horizontal-pull': {
    label: 'Horizontal Pull',
    examples: ['Barbell Row', 'Cable Row', 'Chest-Supported Row'],
  },
  'horizontal-pull-upper-back': {
    label: 'Horizontal Pull (Upper Back Focus)',
    examples: ['Chest-Supported Row', 'Face Pull', 'Rear Delt Row'],
  },
  'vertical-press': {
    label: 'Vertical Press',
    examples: ['Overhead Press', 'Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  },
  'vertical-push': {
    label: 'Vertical Push',
    examples: ['Overhead Press', 'Landmine Press', 'Military Press'],
  },
  'vertical-pull': {
    label: 'Vertical Pull',
    examples: ['Pull-Up', 'Lat Pulldown', 'Assisted Pull-Up'],
  },
  'hip-extension': {
    label: 'Hip Extension',
    examples: ['Hip Thrust', 'Glute Bridge', 'Romanian Deadlift (RDL)'],
  },
  'unilateral-squat': {
    label: 'Unilateral Squat Pattern',
    examples: ['Bulgarian Split Squat', 'Walking Lunge', 'Step-Up'],
  },
  'leg-extension': {
    label: 'Leg Extension',
    examples: ['Machine Leg Extension', 'Banded Leg Extension'],
  },
  'leg-curl': {
    label: 'Leg Curl',
    examples: ['Lying Leg Curl', 'Seated Leg Curl', 'Nordic Curl'],
  },
  'tricep-extension': {
    label: 'Tricep Extension',
    examples: ['Cable Tricep Pushdown', 'Overhead Tricep Extension', 'Skull Crusher'],
  },
  'bicep-curl': {
    label: 'Bicep Curl',
    examples: ['Dumbbell Curl', 'Barbell Curl', 'Cable Curl'],
  },
  abduction: {
    label: 'Abduction',
    examples: ['Cable Hip Abduction', 'Machine Hip Abduction', 'Banded Lateral Walk'],
  },
  adduction: {
    label: 'Adduction',
    examples: ['Cable Hip Adduction', 'Machine Hip Adduction', 'Copenhagen Plank'],
  },
};

const PROGRAM_COLLECTIONS = [
  {
    id: 'full-body-2x',
    title: '2x/Week Full Body Program',
    summary: 'Repeat 2–3 times per week, alternating Workout A and Workout B.',
    href: 'program-2x-full-body.html',
    status: 'available',
    frequency: '2x/week',
    sessions: 2,
    split: 'Full Body',
  },
  {
    id: 'upper-lower-4x',
    title: '4x/Week Upper/Lower Program',
    summary: 'Upper A, Upper B, Lower A, and Lower B - four sessions per week.',
    href: 'program-4x-upper-lower.html',
    status: 'available',
    frequency: '4x/week',
    sessions: 4,
    split: 'Upper / Lower',
  },
];

const PROGRAMS_BY_COLLECTION = {
  'full-body-2x': [
    {
      id: 'workout-a',
      title: 'Workout A',
      guidance:
        '6–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'squat' },
        { patternId: 'horizontal-press' },
        { patternId: 'hip-extension' },
        { patternId: 'horizontal-pull' },
        {
          choice: ['leg-extension', 'leg-curl', 'bicep-curl', 'tricep-extension'],
          choiceLabel: 'Choice of Accessories',
        },
      ],
    },
    {
      id: 'workout-b',
      title: 'Workout B',
      guidance:
        '6–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'hinge' },
        { patternId: 'vertical-pull' },
        { patternId: 'unilateral-squat' },
        { patternId: 'vertical-push' },
        {
          choice: ['leg-extension', 'leg-curl', 'bicep-curl', 'tricep-extension'],
          choiceLabel: 'Choice of Accessories',
        },
      ],
    },
  ],
  'upper-lower-4x': [
    {
      id: 'upper-a',
      title: 'Upper A',
      guidance:
        '8–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'horizontal-press' },
        { patternId: 'horizontal-pull-upper-back' },
        { patternId: 'vertical-press' },
        { patternId: 'vertical-pull' },
      ],
      accessories: ['Rear delt fly', 'Chest fly', 'Bicep Curl'],
    },
    {
      id: 'upper-b',
      title: 'Upper B',
      guidance:
        '8–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'vertical-press' },
        { patternId: 'vertical-pull' },
        { patternId: 'horizontal-press' },
        { patternId: 'horizontal-pull' },
      ],
      accessories: ['Lateral Raise', 'Tricep Extension'],
    },
    {
      id: 'lower-a',
      title: 'Lower A',
      guidance:
        '8–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'squat' },
        { patternId: 'hip-extension' },
        { patternId: 'unilateral-squat' },
        { patternId: 'leg-extension' },
        { patternId: 'leg-curl' },
      ],
    },
    {
      id: 'lower-b',
      title: 'Lower B',
      guidance:
        '8–12 reps · 2–3 sets · 1+ min rest · Train within 3 reps of failure on every set.',
      slots: [
        { patternId: 'hinge' },
        { patternId: 'squat' },
        { patternId: 'hip-extension' },
        { patternId: 'abduction' },
        { patternId: 'adduction' },
      ],
    },
  ],
};

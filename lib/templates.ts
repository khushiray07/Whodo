import type { PlanTemplate } from '../types/database';

export type TemplateConfig = {
  key: PlanTemplate;
  label: string;
  icon: string;
  description: string;
  seedTasks: string[];
};

export const templates: TemplateConfig[] = [
  {
    key: 'birthday',
    label: 'Birthday Party',
    icon: 'cake',
    description: 'Cake, decor & surprises',
    seedTasks: [
      'Order the cake',
      'Get balloons & decorations',
      'Book the venue',
      'Create the playlist',
      'Arrange surprise entry',
    ],
  },
  {
    key: 'trip',
    label: 'Trip',
    icon: 'flight_takeoff',
    description: 'Travel, stay & itinerary',
    seedTasks: [
      'Book tickets',
      'Book accommodation',
      'Plan itinerary',
      'Rent transport',
      'Pack essentials checklist',
    ],
  },
  {
    key: 'chores',
    label: 'Flatmate Chores',
    icon: 'cleaning_services',
    description: 'Split bills & cleaning',
    seedTasks: [
      'Kitchen cleaning',
      'Bathroom cleaning',
      'Take out trash',
      'Buy groceries',
      'Pay electricity bill',
    ],
  },
  {
    key: 'hackathon',
    label: 'Hackathon Team',
    icon: 'code',
    description: 'Dev tasks & deadlines',
    seedTasks: [
      'Set up project repo',
      'Design UI mockups',
      'Build backend API',
      'Write frontend',
      'Prepare demo slides',
    ],
  },
  {
    key: 'dinner',
    label: 'Dinner Party',
    icon: 'restaurant',
    description: 'Menu & guestlist',
    seedTasks: [
      'Decide menu',
      'Buy ingredients',
      'Cook main course',
      'Arrange drinks',
      'Set the table',
    ],
  },
  {
    key: 'custom',
    label: 'Custom Plan',
    icon: 'add',
    description: 'Start from scratch',
    seedTasks: [],
  },
];

export function getTemplate(key: PlanTemplate): TemplateConfig {
  return templates.find((t) => t.key === key) ?? templates[templates.length - 1];
}

import { Clock, Hash, KeyRound, Palette, Text } from 'lucide-react';

export const tools = [
  {
    title: 'Tools',
    items: [
      {
        Icon: Hash,
        title: 'UUID Tool',
        url: '/uuid',
      },
      {
        Icon: Text,
        title: 'Lorem Ipsum',
        url: '/lipsum',
      },
      {
        Icon: Clock,
        title: 'Timezone Converter',
        url: '/timezones',
      },
      {
        Icon: Palette,
        title: 'Color Space Converter',
        url: '/colors',
      },
      {
        Icon: KeyRound,
        title: 'JWT Decoder',
        url: '/jwt-decode',
      },
    ],
  },
];

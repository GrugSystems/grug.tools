import { Link } from 'react-router';
import { Card } from '~/components/ui/card';
import { tools } from '~/lib/tools';
import type { Route } from './+types/home';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Simple Developer Tools | Grug Tools' },
    {
      name: 'description',
      content: 'Simple and Consistent Tools for Developers',
    },
  ];
}

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools
        .flatMap((g) => g.items)
        .map((tool) => (
          <Link key={tool.url} to={tool.url}>
            <Card className="flex flex-col items-center">
              <tool.Icon className="text-gray-500" />
              <h2 className="text-xl">{tool.title}</h2>
            </Card>
          </Link>
        ))}
    </div>
  );
}

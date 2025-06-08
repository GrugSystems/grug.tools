import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/uuid', 'routes/uuid.tsx'),
  route('/lipsum', 'routes/lipsum.tsx'),
  route('/timezones', 'routes/timezones.tsx'),
  route('/colors', 'routes/colors.tsx'),
  route('/jwt-decode', 'routes/jwt-decode.tsx'),
  route('/converter', 'routes/converter.tsx'),
] satisfies RouteConfig;

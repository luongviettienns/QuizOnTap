export type AppRoute = 
  | '/'
  | '/insights'
  | '/releases';

export interface RouteItem {
  id: string;
  path: AppRoute;
  label: string;
  iconName: string;
}

export const MAIN_NAV_ITEMS: RouteItem[] = [
  { id: 'study', path: '/', label: 'Ôn tập', iconName: 'BookOpen' },
  { id: 'insights', path: '/insights', label: 'Thống kê', iconName: 'BarChart2' },
  { id: 'releases', path: '/releases', label: 'Phiên bản', iconName: 'Sparkles' },
];

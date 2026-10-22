export type AppRoute = 
  | '/'
  | '/library'
  | '/import'
  | '/review'
  | '/insights'
  | '/settings';

export interface RouteItem {
  id: string;
  path: AppRoute;
  label: string;
  iconName: string;
}

export const MAIN_NAV_ITEMS: RouteItem[] = [
  { id: 'dashboard', path: '/', label: 'Tổng quan', iconName: 'LayoutDashboard' },
  { id: 'library', path: '/library', label: 'Thư viện', iconName: 'BookOpen' },
  { id: 'import', path: '/import', label: 'Nhập đề', iconName: 'FileUp' },
  { id: 'review', path: '/review', label: 'Ôn câu sai', iconName: 'RotateCcw' },
  { id: 'insights', path: '/insights', label: 'Thống kê', iconName: 'BarChart2' },
];

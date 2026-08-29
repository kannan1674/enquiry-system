import { ScreenLoader } from '@/components/common/screen-loader';

export function DashboardLoader({
  message = 'Fetching insights...',
}: {
  message?: string;
  className?: string;
}) {
  return <ScreenLoader message={message} />;
}

import { PageHeader } from '../components/layout/PageHeader';

interface Props {
  title: string;
  subtitle?: string;
}

export function Placeholder({ title, subtitle }: Props) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-12 text-center">
        <p className="text-sm text-[#9A9994]">This page is coming in a future release.</p>
      </div>
    </div>
  );
}

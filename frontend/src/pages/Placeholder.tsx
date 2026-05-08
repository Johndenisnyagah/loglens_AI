import { PageHeader } from '../components/layout/PageHeader';

interface Props { title: string; subtitle?: string; }

export function Placeholder({ title, subtitle }: Props) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="bg-[#F7F6F4] border border-[#EDECE8] rounded-2xl p-12 text-center">
        <p className="text-sm text-[#9CA3AF]">This page is coming in a future release.</p>
      </div>
    </div>
  );
}

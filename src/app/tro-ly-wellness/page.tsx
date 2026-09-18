import type { Metadata } from 'next';
import { WellnessAssistant } from '@/components/WellnessAssistant';

export const metadata: Metadata = {
  title: 'Trợ lý Wellness - Y học phương Đông & Thiền',
  description: 'Trợ lý Wellness AI giúp bạn khám phá y học phương Đông, thiền định, và những cách chăm sóc sức khỏe toàn diện.',
};

export default function WellnessAssistantPage() {
  return <WellnessAssistant />;
}

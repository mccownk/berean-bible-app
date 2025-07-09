
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  return <OnboardingContent />;
}

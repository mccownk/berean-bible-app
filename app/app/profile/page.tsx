
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProfileContent } from '@/components/profile/profile-content';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      timezone: true,
      preferredReadingTime: true,
      preferredTimeOfDay: true,
      preferredStartTime: true,
      notificationsEnabled: true,
      theme: true,
      fontSize: true,
      preferredTranslation: true
    }
  });

  if (!user) {
    redirect('/');
  }

  const profileData = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      preferences: {
        timezone: user.timezone,
        preferredReadingTime: user.preferredReadingTime,
        preferredTimeOfDay: user.preferredTimeOfDay,
        preferredStartTime: user.preferredStartTime,
        notificationsEnabled: user.notificationsEnabled,
        theme: user.theme,
        fontSize: user.fontSize,
        preferredTranslation: user.preferredTranslation
      }
    }
  };

  return <ProfileContent data={profileData} />;
}


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
      notificationsEnabled: true,
      theme: true,
      fontSize: true
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
        notificationsEnabled: user.notificationsEnabled,
        theme: user.theme,
        fontSize: user.fontSize
      }
    }
  };

  return <ProfileContent data={profileData} />;
}

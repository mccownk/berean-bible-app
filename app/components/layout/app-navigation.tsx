
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppNavigationProps {
  className?: string;
}

export function AppNavigation({ className }: AppNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: 'Today', href: '/dashboard', icon: BookOpen },
    { name: 'Plan', href: '/plan', icon: Calendar },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: Settings },
  ];

  return (
    <nav className={cn('bg-background border-t', className)}>
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                'flex flex-col items-center justify-center space-y-1 h-full rounded-none',
                isActive && 'bg-primary/10 text-primary'
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

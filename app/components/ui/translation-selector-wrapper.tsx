
'use client';

import { useState, useEffect } from 'react';
import { TranslationSelector } from './translation-selector';
import { Skeleton } from './skeleton';
import { Alert, AlertDescription } from './alert';
import { AlertCircle } from 'lucide-react';
import { BibleTranslation, TranslationGroup } from '@/lib/translation-discovery';

interface TranslationSelectorWrapperProps {
  selectedTranslation: string;
  onTranslationChange: (translationId: string) => void;
  compact?: boolean;
  showDescription?: boolean;
  className?: string;
  userId?: string; // For fetching user preferences
}

export function TranslationSelectorWrapper({
  selectedTranslation,
  onTranslationChange,
  compact = false,
  showDescription = true,
  className,
  userId
}: TranslationSelectorWrapperProps) {
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [translationGroups, setTranslationGroups] = useState<TranslationGroup[]>([]);
  const [recentTranslations, setRecentTranslations] = useState<string[]>([]);
  const [favoriteTranslations, setFavoriteTranslations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all available translations
        const [translationsResponse, groupsResponse] = await Promise.all([
          fetch('/api/bible/translations'),
          fetch('/api/bible/translation-groups')
        ]);

        if (!translationsResponse.ok || !groupsResponse.ok) {
          throw new Error('Failed to fetch translations');
        }

        const translationsData = await translationsResponse.json();
        const groupsData = await groupsResponse.json();

        setTranslations(translationsData.translations || []);
        setTranslationGroups(groupsData.groups || []);

        // Fetch user preferences if userId is provided
        if (userId) {
          try {
            const userResponse = await fetch(`/api/user/translation-preferences?userId=${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setRecentTranslations(userData.translationHistory || []);
              setFavoriteTranslations(userData.favoriteTranslations || []);
            }
          } catch (userError) {
            console.warn('Failed to fetch user translation preferences:', userError);
            // Continue without user preferences
          }
        }

      } catch (err) {
        console.error('Error fetching translations:', err);
        setError('Failed to load translations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [userId]);

  const handleTranslationChange = async (translationId: string) => {
    onTranslationChange(translationId);

    // Update user's translation history if userId is provided
    if (userId) {
      try {
        await fetch('/api/user/update-translation-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            translationId,
          }),
        });

        // Update local recent translations state
        setRecentTranslations(prev => {
          const newHistory = [translationId, ...prev.filter(id => id !== translationId)];
          return newHistory.slice(0, 5); // Keep only the 5 most recent
        });
      } catch (err) {
        console.warn('Failed to update translation history:', err);
        // Continue - this is not critical
      }
    }
  };

  if (loading) {
    return (
      <div className={className}>
        {!compact && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {compact && <Skeleton className="h-10 w-32" />}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (translations.length === 0) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No translations available. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TranslationSelector
      selectedTranslation={selectedTranslation}
      onTranslationChange={handleTranslationChange}
      translations={translations}
      translationGroups={translationGroups}
      recentTranslations={recentTranslations}
      favoriteTranslations={favoriteTranslations}
      compact={compact}
      showDescription={showDescription}
      className={className}
    />
  );
}

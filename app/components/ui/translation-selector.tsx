
'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Search, Star, Globe, BookOpen, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { BibleTranslation, TranslationGroup } from '@/lib/translation-discovery';

interface TranslationSelectorProps {
  selectedTranslation: string;
  onTranslationChange: (translationId: string) => void;
  translations: BibleTranslation[];
  translationGroups: TranslationGroup[];
  recentTranslations?: string[];
  favoriteTranslations?: string[];
  compact?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function TranslationSelector({
  selectedTranslation,
  onTranslationChange,
  translations,
  translationGroups,
  recentTranslations = [],
  favoriteTranslations = [],
  compact = false,
  showDescription = true,
  className
}: TranslationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Get currently selected translation object
  const currentTranslation = translations.find(t => t.id === selectedTranslation);

  // Filter translations based on search query
  const filteredTranslations = translations.filter(translation =>
    translation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    translation.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (translation.description && translation.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get recent translations (last 5 used)
  const recentTranslationObjects = translations.filter(t => 
    recentTranslations.includes(t.id)
  ).slice(0, 5);

  // Get favorite translations
  const favoriteTranslationObjects = translations.filter(t => 
    favoriteTranslations.includes(t.id)
  );

  const handleSelect = (translationId: string) => {
    onTranslationChange(translationId);
    setOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'popular': return <Star className="h-3 w-3 text-yellow-600" />;
      case 'modern': return <Globe className="h-3 w-3 text-blue-600" />;
      case 'traditional': return <BookOpen className="h-3 w-3 text-amber-600" />;
      case 'specialized': return <Settings className="h-3 w-3 text-purple-600" />;
      case 'historical': return <History className="h-3 w-3 text-gray-600" />;
      default: return <BookOpen className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'popular': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'modern': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'traditional': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'specialized': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'historical': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-muted border-muted-foreground/20';
    }
  };

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
          >
            <div className="flex items-center gap-2">
              {currentTranslation && getCategoryIcon(currentTranslation.category)}
              <span className="font-medium">
                {currentTranslation?.abbreviation || selectedTranslation}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <TranslationDropdownContent
            translations={filteredTranslations}
            translationGroups={translationGroups}
            recentTranslations={recentTranslationObjects}
            favoriteTranslations={favoriteTranslationObjects}
            selectedTranslation={selectedTranslation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={handleSelect}
            showDescription={showDescription}
            getCategoryIcon={getCategoryIcon}
            getCategoryColor={getCategoryColor}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Bible Translation</label>
        <Badge variant="outline" className="text-xs">
          {translations.length} available
        </Badge>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto p-3"
          >
            <div className="flex items-start gap-3 text-left">
              {currentTranslation && getCategoryIcon(currentTranslation.category)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {currentTranslation?.abbreviation || selectedTranslation}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", currentTranslation && getCategoryColor(currentTranslation.category))}
                  >
                    {currentTranslation?.source === 'esv' ? 'ESV API' : 'API.Bible'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentTranslation?.name || 'Select translation...'}
                </div>
                {showDescription && currentTranslation?.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {currentTranslation.description}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <TranslationDropdownContent
            translations={filteredTranslations}
            translationGroups={translationGroups}
            recentTranslations={recentTranslationObjects}
            favoriteTranslations={favoriteTranslationObjects}
            selectedTranslation={selectedTranslation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={handleSelect}
            showDescription={showDescription}
            getCategoryIcon={getCategoryIcon}
            getCategoryColor={getCategoryColor}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TranslationDropdownContentProps {
  translations: BibleTranslation[];
  translationGroups: TranslationGroup[];
  recentTranslations: BibleTranslation[];
  favoriteTranslations: BibleTranslation[];
  selectedTranslation: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (translationId: string) => void;
  showDescription: boolean;
  getCategoryIcon: (category: string) => React.ReactNode;
  getCategoryColor: (category: string) => string;
}

function TranslationDropdownContent({
  translations,
  translationGroups,
  recentTranslations,
  favoriteTranslations,
  selectedTranslation,
  searchQuery,
  onSearchChange,
  onSelect,
  showDescription,
  getCategoryIcon,
  getCategoryColor
}: TranslationDropdownContentProps) {
  return (
    <Command>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search translations..."
          value={searchQuery}
          onValueChange={onSearchChange}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <CommandList>
        <ScrollArea className="max-h-[400px]">
          {searchQuery === '' && (
            <>
              {/* Recent Translations */}
              {recentTranslations.length > 0 && (
                <CommandGroup heading="Recently Used">
                  {recentTranslations.map((translation) => (
                    <CommandItem
                      key={translation.id}
                      value={translation.id}
                      onSelect={onSelect}
                      className="flex items-start gap-3 p-3"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5",
                          selectedTranslation === translation.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getCategoryIcon(translation.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{translation.abbreviation}</span>
                            <Badge variant="outline" className="text-xs">
                              {translation.source === 'esv' ? 'ESV' : 'API'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {translation.name}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Favorite Translations */}
              {favoriteTranslations.length > 0 && (
                <CommandGroup heading="Favorites">
                  {favoriteTranslations.map((translation) => (
                    <CommandItem
                      key={translation.id}
                      value={translation.id}
                      onSelect={onSelect}
                      className="flex items-start gap-3 p-3"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5",
                          selectedTranslation === translation.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {getCategoryIcon(translation.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{translation.abbreviation}</span>
                            <Badge variant="outline" className="text-xs">
                              {translation.source === 'esv' ? 'ESV' : 'API'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {translation.name}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {(recentTranslations.length > 0 || favoriteTranslations.length > 0) && <Separator />}
            </>
          )}

          {/* Translation Groups */}
          {searchQuery === '' ? (
            // Show grouped translations when not searching
            translationGroups.map((group) => (
              <CommandGroup key={group.category} heading={group.label}>
                {group.translations.map((translation) => (
                  <TranslationItem
                    key={translation.id}
                    translation={translation}
                    isSelected={selectedTranslation === translation.id}
                    onSelect={onSelect}
                    showDescription={showDescription}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </CommandGroup>
            ))
          ) : (
            // Show filtered results when searching
            <CommandGroup heading="Search Results">
              {translations.length === 0 ? (
                <CommandEmpty>No translations found.</CommandEmpty>
              ) : (
                translations.map((translation) => (
                  <TranslationItem
                    key={translation.id}
                    translation={translation}
                    isSelected={selectedTranslation === translation.id}
                    onSelect={onSelect}
                    showDescription={showDescription}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryColor={getCategoryColor}
                  />
                ))
              )}
            </CommandGroup>
          )}
        </ScrollArea>
      </CommandList>
    </Command>
  );
}

interface TranslationItemProps {
  translation: BibleTranslation;
  isSelected: boolean;
  onSelect: (translationId: string) => void;
  showDescription: boolean;
  getCategoryIcon: (category: string) => React.ReactNode;
  getCategoryColor: (category: string) => string;
}

function TranslationItem({
  translation,
  isSelected,
  onSelect,
  showDescription,
  getCategoryIcon,
  getCategoryColor
}: TranslationItemProps) {
  return (
    <CommandItem
      value={translation.id}
      onSelect={onSelect}
      className="flex items-start gap-3 p-3"
    >
      <Check
        className={cn(
          "h-4 w-4 mt-0.5",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex items-start gap-2 min-w-0 flex-1">
        {getCategoryIcon(translation.category)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{translation.abbreviation}</span>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getCategoryColor(translation.category))}
            >
              {translation.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {translation.source === 'esv' ? 'ESV API' : 'API.Bible'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {translation.name}
          </div>
          {showDescription && translation.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {translation.description}
            </div>
          )}
        </div>
      </div>
    </CommandItem>
  );
}

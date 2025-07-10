
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  StickyNote,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { formatReadingTime, getCurrentPhase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

interface ReadingData {
  plan: {
    id: string;
    name: string;
    totalDays: number;
  };
  reading: {
    id: string;
    day: number;
    phase: number;
    // New Testament readings
    ntPassages: string[];
    ntEstimatedMinutes: number | null;
    ntRepetitionType: string;
    ntRepetitionCount: number;
    // Old Testament readings
    otPassages: string[];
    otEstimatedMinutes: number | null;
    otCycle: number;
    // Combined
    totalEstimatedMinutes: number | null;
    // Legacy support
    passages?: string[];
    estimatedMinutes?: number | null;
  };
  progress: {
    id: string;
    // Combined progress
    isCompleted: boolean;
    completedAt: Date | null;
    totalReadingTimeSeconds: number | null;
    currentPhase: number;
    otCycle: number;
    // Individual progress
    ntCompleted: boolean;
    ntCompletedAt: Date | null;
    ntReadingTimeSeconds: number | null;
    otCompleted: boolean;
    otCompletedAt: Date | null;
    otReadingTimeSeconds: number | null;
    // Legacy support
    readingTimeSeconds?: number | null;
    currentCycle?: number;
  };
  notes: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  navigation: {
    previous: { day: number } | null;
    next: { day: number } | null;
  };
}

interface ReadingContentProps {
  data: ReadingData;
}

export function ReadingContent({ data }: ReadingContentProps) {
  const [ntBibleText, setNtBibleText] = useState<string>('');
  const [otBibleText, setOtBibleText] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<string>('BSB');
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [readingTimer, setReadingTimer] = useState(0);
  const [ntTimer, setNtTimer] = useState(0);
  const [otTimer, setOtTimer] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [activeSection, setActiveSection] = useState<'nt' | 'ot' | 'both'>('both');
  const { toast } = useToast();
  const router = useRouter();

  // Backward compatibility: extract passages from new or legacy format
  const ntPassages = data.reading.ntPassages || data.reading.passages || [];
  const otPassages = data.reading.otPassages || [];
  const allPassages = [...ntPassages, ...otPassages];

  // Load Bible text for both NT and OT
  useEffect(() => {
    const fetchBibleText = async () => {
      try {
        setLoading(true);
        
        // Fetch NT text
        if (ntPassages.length > 0) {
          const ntResponse = await fetch(`/api/bible/passage?passages=${ntPassages.join(',')}`);
          const ntResult = await ntResponse.json();
          if (ntResponse.ok) {
            setNtBibleText(ntResult.content);
            // Set translation from the first successful response
            if (ntResult.translation) {
              setCurrentTranslation(ntResult.translation);
            }
          }
        }
        
        // Fetch OT text
        if (otPassages.length > 0) {
          const otResponse = await fetch(`/api/bible/passage?passages=${otPassages.join(',')}`);
          const otResult = await otResponse.json();
          if (otResponse.ok) {
            setOtBibleText(otResult.content);
            // Set translation if not already set from NT response
            if (otResult.translation && currentTranslation === 'BSB') {
              setCurrentTranslation(otResult.translation);
            }
          }
        }
        
      } catch (error) {
        toast({
          title: "Error loading Bible text",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBibleText();
  }, [ntPassages, otPassages, toast]);

  // Reading timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isReading) {
      interval = setInterval(() => {
        setReadingTimer(prev => prev + 1);
        
        // Update individual timers based on active section
        if (activeSection === 'nt' || activeSection === 'both') {
          setNtTimer(prev => prev + 1);
        }
        if (activeSection === 'ot' || activeSection === 'both') {
          setOtTimer(prev => prev + 1);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isReading, activeSection]);

  // Auto-start reading timer when page loads
  useEffect(() => {
    if (!data.progress.isCompleted && !loading) {
      setIsReading(true);
    }
  }, [data.progress.isCompleted, loading]);

  const handleMarkComplete = async (section?: 'nt' | 'ot') => {
    setMarkingComplete(true);
    
    try {
      const response = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId: data.progress.id,
          section: section,
          ntReadingTimeSeconds: ntTimer,
          otReadingTimeSeconds: otTimer,
          totalReadingTimeSeconds: readingTimer
        }),
      });

      if (response.ok) {
        if (section) {
          toast({
            title: `${section.toUpperCase()} reading completed! 🎉`,
            description: `Great job on completing the ${section === 'nt' ? 'New Testament' : 'Old Testament'} portion.`,
          });
        } else {
          toast({
            title: "Reading completed! 🎉",
            description: "Great job on your daily Scripture reading.",
          });
          
          // Navigate to dashboard after a short delay for full completion
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        throw new Error('Failed to mark reading as complete');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark reading as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleShare = async () => {
    const ntText = ntPassages.length > 0 ? `NT: ${ntPassages.join(', ')}` : '';
    const otText = otPassages.length > 0 ? `OT: ${otPassages.join(', ')}` : '';
    const readingText = [ntText, otText].filter(Boolean).join(' | ');
    
    const shareData = {
      title: `Day ${data.reading.day}: ${readingText}`,
      text: `I'm reading ${readingText} today as part of my 1,260-day Berean Bible journey! (Phase ${data.reading.phase})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied to your clipboard.",
      });
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingId: data.reading.id,
          content: noteContent.trim()
        }),
      });

      if (response.ok) {
        toast({
          title: "Note saved",
          description: "Your reflection has been saved.",
        });
        setNoteContent('');
        setShowNotes(false);
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentPhase = data.reading.phase || getCurrentPhase(data.reading.day);
  const progressPercentage = (data.reading.day / data.plan.totalDays) * 100;
  const currentCycle = data.progress.otCycle || data.progress.currentCycle || 1;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Day {data.reading.day}</Badge>
              <Badge variant="outline">Phase {currentPhase}</Badge>
              <Badge variant="outline">OT Cycle {currentCycle}</Badge>
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                <BookOpen className="h-3 w-3 mr-1" />
                {currentTranslation}
              </Badge>
              {data.reading.ntRepetitionType && (
                <Badge variant="outline" className="text-xs">
                  {data.reading.ntRepetitionType === 'entire_book' ? 'Whole Book' : 'Chapters'}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              {ntPassages.length > 0 && (
                <h1 className="text-xl font-bold font-serif text-blue-700">
                  NT: {ntPassages.join(', ')}
                </h1>
              )}
              {otPassages.length > 0 && (
                <h2 className="text-lg font-semibold font-serif text-amber-700">
                  OT: {otPassages.join(', ')}
                </h2>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {data.reading.totalEstimatedMinutes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatReadingTime(data.reading.totalEstimatedMinutes)}
              </div>
            )}
            <div className="flex items-center gap-2">
              {data.progress.ntCompleted && (
                <Badge variant="default" className="bg-blue-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  NT ✓
                </Badge>
              )}
              {data.progress.otCompleted && (
                <Badge variant="default" className="bg-amber-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  OT ✓
                </Badge>
              )}
              {data.progress.isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Reading Timer */}
        {!data.progress.isCompleted && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReading(!isReading)}
                  >
                    {isReading ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="text-sm space-y-1">
                    <div>
                      Total: {Math.floor(readingTimer / 60)}:{(readingTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {ntPassages.length > 0 && (
                        <span>NT: {Math.floor(ntTimer / 60)}:{(ntTimer % 60).toString().padStart(2, '0')}</span>
                      )}
                      {otPassages.length > 0 && (
                        <span>OT: {Math.floor(otTimer / 60)}:{(otTimer % 60).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={activeSection === 'nt' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('nt')}
                      disabled={ntPassages.length === 0}
                    >
                      NT
                    </Button>
                    <Button
                      variant={activeSection === 'ot' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('ot')}
                      disabled={otPassages.length === 0}
                    >
                      OT
                    </Button>
                    <Button
                      variant={activeSection === 'both' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('both')}
                    >
                      Both
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <StickyNote className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bible Text */}
        <div className="space-y-4">
          {/* New Testament Reading */}
          {ntPassages.length > 0 && (activeSection === 'nt' || activeSection === 'both') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  New Testament Reading
                  {data.reading.ntEstimatedMinutes && (
                    <Badge variant="outline" className="ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatReadingTime(data.reading.ntEstimatedMinutes)}
                    </Badge>
                  )}
                  {data.progress.ntCompleted && (
                    <Badge variant="default" className="bg-blue-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {ntPassages.join(', ')}
                  {data.reading.ntRepetitionType === 'entire_book' && (
                    <span className="ml-2 text-xs">• Read entire book for {data.reading.ntRepetitionCount} days</span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="reading-text whitespace-pre-wrap">
                    {ntBibleText}
                  </div>
                )}
                {!data.progress.ntCompleted && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleMarkComplete('nt')}
                      disabled={markingComplete}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {markingComplete ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete NT Reading
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Old Testament Reading */}
          {otPassages.length > 0 && (activeSection === 'ot' || activeSection === 'both') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  Old Testament Reading
                  {data.reading.otEstimatedMinutes && (
                    <Badge variant="outline" className="ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatReadingTime(data.reading.otEstimatedMinutes)}
                    </Badge>
                  )}
                  {data.progress.otCompleted && (
                    <Badge variant="default" className="bg-amber-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {otPassages.join(', ')} • Cycle {currentCycle}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="reading-text whitespace-pre-wrap">
                    {otBibleText}
                  </div>
                )}
                {!data.progress.otCompleted && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleMarkComplete('ot')}
                      disabled={markingComplete}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {markingComplete ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete OT Reading
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notes Section */}
        {showNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your reflections and insights..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSaveNote} disabled={!noteContent.trim()}>
                Save Note
              </Button>
              
              {/* Previous Notes */}
              {data.notes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Previous Notes</h4>
                  {data.notes.map(note => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!data.progress.isCompleted && (
            <div className="flex-1 space-y-2">
              {/* Complete Both Button */}
              {!data.progress.ntCompleted || !data.progress.otCompleted ? (
                <Button
                  onClick={() => handleMarkComplete()}
                  disabled={markingComplete}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {markingComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete All Readings
                </Button>
              ) : (
                <div className="text-center py-2">
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Day {data.reading.day} Complete!
                  </Badge>
                </div>
              )}
              
              {/* Individual Section Progress */}
              <div className="flex gap-2 text-sm">
                {ntPassages.length > 0 && (
                  <div className={`flex-1 p-2 rounded border text-center ${
                    data.progress.ntCompleted 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-muted border-muted-foreground/20'
                  }`}>
                    <div className="font-medium">New Testament</div>
                    <div className="text-xs">
                      {data.progress.ntCompleted ? '✓ Complete' : 'In Progress'}
                    </div>
                  </div>
                )}
                {otPassages.length > 0 && (
                  <div className={`flex-1 p-2 rounded border text-center ${
                    data.progress.otCompleted 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-muted border-muted-foreground/20'
                  }`}>
                    <div className="font-medium">Old Testament</div>
                    <div className="text-xs">
                      {data.progress.otCompleted ? '✓ Complete' : 'In Progress'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/read/${data.navigation.previous?.day}`)}
              disabled={!data.navigation.previous}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/read/${data.navigation.next?.day}`)}
              disabled={!data.navigation.next}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


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
    passages: string[];
    estimatedMinutes: number | null;
  };
  progress: {
    id: string;
    isCompleted: boolean;
    completedAt: Date | null;
    readingTimeSeconds: number | null;
    currentCycle: number;
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
  const [bibleText, setBibleText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [readingTimer, setReadingTimer] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load Bible text
  useEffect(() => {
    const fetchBibleText = async () => {
      try {
        const response = await fetch(`/api/bible/passage?passages=${data.reading.passages.join(',')}`);
        const result = await response.json();
        
        if (response.ok) {
          setBibleText(result.content);
        } else {
          toast({
            title: "Error loading Bible text",
            description: "Please try again later.",
            variant: "destructive",
          });
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
  }, [data.reading.passages, toast]);

  // Reading timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isReading) {
      interval = setInterval(() => {
        setReadingTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isReading]);

  // Auto-start reading timer when page loads
  useEffect(() => {
    if (!data.progress.isCompleted && !loading) {
      setIsReading(true);
    }
  }, [data.progress.isCompleted, loading]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    
    try {
      const response = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId: data.progress.id,
          readingTimeSeconds: readingTimer
        }),
      });

      if (response.ok) {
        toast({
          title: "Reading completed! 🎉",
          description: "Great job on your daily Scripture reading.",
        });
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
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
    const shareData = {
      title: `Day ${data.reading.day}: ${data.reading.passages.join(', ')}`,
      text: `I'm reading ${data.reading.passages.join(', ')} today as part of my 750-day Berean Bible journey!`,
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

  const currentPhase = getCurrentPhase(data.reading.day);
  const progressPercentage = (data.reading.day / data.plan.totalDays) * 100;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Day {data.reading.day}</Badge>
              <Badge variant="outline">{currentPhase}</Badge>
              <Badge variant="outline">Cycle {data.progress.currentCycle}</Badge>
            </div>
            <h1 className="text-2xl font-bold font-serif">
              {data.reading.passages.join(', ')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {data.reading.estimatedMinutes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatReadingTime(data.reading.estimatedMinutes)}
              </div>
            )}
            {data.progress.isCompleted && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
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
                  <div className="text-sm">
                    Reading time: {Math.floor(readingTimer / 60)}:{(readingTimer % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Today's Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="reading-text whitespace-pre-wrap">
                {bibleText}
              </div>
            )}
          </CardContent>
        </Card>

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
            <Button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="flex-1"
            >
              {markingComplete ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Mark as Complete
            </Button>
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

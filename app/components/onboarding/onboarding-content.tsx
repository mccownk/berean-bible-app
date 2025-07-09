
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Repeat,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  {
    title: 'Welcome to Berean',
    description: 'Your journey of daily Scripture examination begins here',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Berean</h2>
          <p className="text-muted-foreground">
            "Now the Berean Jews were of more noble character than those in Thessalonica, 
            for they received the message with great eagerness and examined the Scriptures every day"
          </p>
          <p className="text-sm text-muted-foreground mt-2">- Acts 17:11</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">
            You're about to embark on a comprehensive 750-day journey through the New Testament, 
            designed to help you develop deep Biblical understanding through repetition and daily study.
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'The 750-Day Plan',
    description: 'Understanding the unique repetition methodology',
    icon: Calendar,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">The 750-Day Reading Plan</h2>
        </div>
        <div className="grid gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Repetition Learning</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The same passages are read multiple times over 3.5 years for deeper understanding and memorization.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Structured Phases</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Progress through Gospels, Acts, Paul's letters, and Revelation in carefully designed phases.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Daily Consistency</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manageable daily readings averaging 5-10 minutes that fit into your schedule.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Track Your Progress',
    description: 'Monitor your spiritual growth journey',
    icon: Target,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Track Your Progress</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold">Reading Streaks</h3>
              <p className="text-sm text-muted-foreground">
                Build consistency and track your daily reading habits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold">Progress Analytics</h3>
              <p className="text-sm text-muted-foreground">
                See your journey through detailed statistics and insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-semibold">Achievement System</h3>
              <p className="text-sm text-muted-foreground">
                Earn achievements as you reach reading milestones
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Begin Reading' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

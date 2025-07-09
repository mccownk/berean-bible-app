
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Users, Award, ArrowRight } from 'lucide-react';
import { SignInDialog } from '@/components/auth/sign-in-dialog';
import { SignUpDialog } from '@/components/auth/sign-up-dialog';

export function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4 font-serif">
            Berean
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            "Now the Berean Jews were of more noble character than those in Thessalonica, 
            for they received the message with great eagerness and examined the Scriptures every day" 
            <span className="font-medium">- Acts 17:11</span>
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowSignUp(true)}
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>750-Day Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete New Testament reading plan with repetition-based learning over 3.5 years
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Daily Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manageable daily readings averaging 5-10 minutes for deep, consistent study
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Cross-Device Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless progress tracking across all your devices with real-time synchronization
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your reading streaks, achievements, and spiritual growth journey
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Reading Plan Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 font-serif">
            The Berean Reading Method
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Repetition Learning</h3>
              <p className="text-gray-600">
                Read through the same passages multiple times over 3.5 years for deeper understanding and memorization
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Structured Phases</h3>
              <p className="text-gray-600">
                Progress through carefully designed phases: Gospels, Early Church, Pauline Letters, and Revelation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily Consistency</h3>
              <p className="text-gray-600">
                Build lasting habits with manageable daily readings that fit into your schedule
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">
            Start Examining Scripture Daily
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of believers who have transformed their Bible study through the Berean method. 
            Begin your 750-day journey today.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowSignUp(true)}
          >
            Create Your Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Auth Dialogs */}
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      <SignUpDialog open={showSignUp} onOpenChange={setShowSignUp} />
    </div>
  );
}

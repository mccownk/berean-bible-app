
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { formatReadingTime, getCurrentPhase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

interface PlanData {
  plan: {
    id: string;
    name: string;
    description: string | null;
    totalDays: number;
  };
  readings: Array<{
    id: string;
    day: number;
    passages: string[];
    estimatedMinutes: number | null;
    progress: {
      isCompleted: boolean;
      completedAt: Date | null;
      currentCycle: number;
    } | null;
  }>;
  overview: {
    completedDays: number;
    totalDays: number;
    currentDay: number;
  };
}

interface PlanContentProps {
  data: PlanData;
}

export function PlanContent({ data }: PlanContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  // Filter readings based on search and status
  const filteredReadings = data.readings.filter(reading => {
    const matchesSearch = searchTerm === '' || 
      reading.passages.some(passage => 
        passage.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      reading.day.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'completed' && reading.progress?.isCompleted) ||
      (filterStatus === 'pending' && !reading.progress?.isCompleted);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReadings = filteredReadings.slice(startIndex, startIndex + itemsPerPage);

  const progressPercentage = (data.overview.completedDays / data.overview.totalDays) * 100;

  const handleReadingClick = (day: number) => {
    router.push(`/read/${day}`);
  };

  // Group readings by phases
  const groupedReadings = paginatedReadings.reduce((groups, reading) => {
    const phase = getCurrentPhase(reading.day);
    if (!groups[phase]) {
      groups[phase] = [];
    }
    groups[phase].push(reading);
    return groups;
  }, {} as Record<string, typeof paginatedReadings>);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif">{data.plan.name}</h1>
            <p className="text-muted-foreground">{data.plan.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {data.overview.completedDays}/{data.overview.totalDays}
            </div>
            <div className="text-sm text-muted-foreground">days completed</div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {progressPercentage.toFixed(1)}% Complete
                </span>
                <span className="text-sm text-muted-foreground">
                  Current: Day {data.overview.currentDay}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.overview.completedDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.overview.totalDays - data.overview.completedDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {getCurrentPhase(data.overview.currentDay)}
                  </div>
                  <div className="text-xs text-muted-foreground">Current Phase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.ceil((data.overview.totalDays - data.overview.completedDays) / 7)}
                  </div>
                  <div className="text-xs text-muted-foreground">Weeks Left</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by passage or day number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                  size="sm"
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  size="sm"
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading List */}
        <div className="space-y-6">
          {Object.entries(groupedReadings).map(([phase, readings]) => (
            <Card key={phase}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {phase}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {readings.map((reading) => (
                    <div
                      key={reading.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        reading.progress?.isCompleted
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-background hover:bg-muted'
                      }`}
                      onClick={() => handleReadingClick(reading.day)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {reading.day}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {reading.passages.join(', ')}
                          </div>
                          {reading.estimatedMinutes && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatReadingTime(reading.estimatedMinutes)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {reading.progress?.isCompleted ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

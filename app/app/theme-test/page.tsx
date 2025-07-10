
'use client';

import { useState, useEffect } from 'react';
import { useCustomTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ThemeTestPage() {
  const { theme, setTheme, mounted } = useCustomTheme();
  const [testResults, setTestResults] = useState<string[]>([]);

  const runThemeTest = (targetTheme: string) => {
    const results: string[] = [];
    
    // Test theme switching
    setTheme(targetTheme);
    
    setTimeout(() => {
      // Check DOM classes after theme change
      const htmlClasses = document.documentElement.className;
      results.push(`Theme: ${targetTheme}`);
      results.push(`HTML Classes: "${htmlClasses}"`);
      
      // Check CSS variables
      const style = getComputedStyle(document.documentElement);
      const background = style.getPropertyValue('--background').trim();
      const foreground = style.getPropertyValue('--foreground').trim();
      results.push(`Background: ${background}`);
      results.push(`Foreground: ${foreground}`);
      
      // Validate theme application
      if (targetTheme === 'dark') {
        const isCorrect = htmlClasses.includes('dark') && !htmlClasses.includes('theme-sepia');
        results.push(`✅ Dark theme ${isCorrect ? 'correctly applied' : 'NOT applied correctly'}`);
      } else if (targetTheme === 'sepia') {
        const isCorrect = htmlClasses.includes('theme-sepia') && !htmlClasses.includes('dark');
        results.push(`✅ Sepia theme ${isCorrect ? 'correctly applied' : 'NOT applied correctly'}`);
      } else {
        const isCorrect = !htmlClasses.includes('dark') && !htmlClasses.includes('theme-sepia');
        results.push(`✅ Light theme ${isCorrect ? 'correctly applied' : 'NOT applied correctly'}`);
      }
      
      setTestResults(results);
    }, 100);
  };

  const runAllTests = () => {
    const themes = ['light', 'dark', 'sepia'];
    let currentIndex = 0;
    
    const testNext = () => {
      if (currentIndex < themes.length) {
        runThemeTest(themes[currentIndex]);
        currentIndex++;
        setTimeout(testNext, 2000);
      }
    };
    
    testNext();
  };

  if (!mounted) {
    return <div className="p-8">Loading theme system...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🎨 Theme Switching Test</h1>
        <p className="text-muted-foreground">
          Testing the fixed theme switching functionality in Berean Bible App
        </p>
        <Badge variant="outline">Current Theme: {theme}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Theme Switching */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Theme Switching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Theme:</label>
              <Select value={theme} onValueChange={(value) => runThemeTest(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => runThemeTest('light')} variant="outline" size="sm">
                Light
              </Button>
              <Button onClick={() => runThemeTest('dark')} variant="outline" size="sm">
                Dark
              </Button>
              <Button onClick={() => runThemeTest('sepia')} variant="outline" size="sm">
                Sepia
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Automated Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAllTests} className="w-full">
              Run All Theme Tests
            </Button>
            <div className="text-sm space-y-1">
              <div><strong>Current Theme:</strong> {theme}</div>
              <div><strong>HTML Classes:</strong> "{document.documentElement.className}"</div>
              <div><strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length > 0 ? (
              <div className="bg-muted p-4 rounded-md">
                <div className="font-mono text-sm space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className={result.includes('✅') ? 'text-green-600' : ''}>
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No test results yet. Click a theme button or run automated tests.</p>
            )}
          </CardContent>
        </Card>

        {/* Sample UI Components */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sample UI Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card should adapt to the current theme.</p>
                  <Button className="mt-2">Button</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Text Samples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>Regular text</p>
                  <p className="text-muted-foreground">Muted text</p>
                  <p className="text-primary">Primary colored text</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <input className="w-full p-2 border rounded bg-background text-foreground" placeholder="Input field" />
                  <Button variant="secondary" className="w-full">Secondary Button</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MicroscopeIcon as Molecule, Database, BarChart3, Target, TrendingUp, Zap } from "lucide-react"

interface LoadingScreenProps {
  onComplete: () => void
}

const loadingSteps = [
  { icon: Database, text: "Gathering competitive intelligence...", duration: 1000 },
  { icon: BarChart3, text: "Analyzing market dynamics...", duration: 800 },
  { icon: Target, text: "Assessing regulatory pathways...", duration: 900 },
  { icon: TrendingUp, text: "Modeling financial projections...", duration: 700 },
  { icon: Zap, text: "Calculating strategic fit scores...", duration: 600 },
  { icon: Molecule, text: "Finalizing analysis...", duration: 500 },
]

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let totalDuration = 60000;
    let currentDuration = 0

    // Calculate total duration
    loadingSteps.forEach((step) => {
      totalDuration += step.duration
    })

    const runSteps = async () => {
      for (let i = 0; i < loadingSteps.length; i++) {
        setCurrentStep(i)

        // Animate progress for current step
        const stepDuration = loadingSteps[i].duration
        const startProgress = (currentDuration / totalDuration) * 100
        const endProgress = ((currentDuration + stepDuration) / totalDuration) * 100

        const animateProgress = () => {
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const stepProgress = Math.min(elapsed / stepDuration, 1)
            const currentProgress = startProgress + (endProgress - startProgress) * stepProgress

            setProgress(currentProgress)

            if (stepProgress < 1) {
              requestAnimationFrame(animate)
            }
          }
          animate()
        }

        animateProgress()
        await new Promise((resolve) => setTimeout(resolve, stepDuration))
        currentDuration += stepDuration
      }

      // Complete
      setTimeout(async () => {
        // 1. Call the Perplexity API
        try {
          const response = await fetch('/api/perplexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Placeholder: replace with real molecule data' })
          });
          const data = await response.json();
          // 2. Save to localStorage
          localStorage.setItem('perplexityResult', JSON.stringify(data));
        } catch (err) {
          localStorage.setItem('perplexityResult', JSON.stringify({ error: 'Failed to fetch Perplexity result', details: String(err) }));
        }
        // 3. Move to analysis
        onComplete();
      }, 300);
    }

    runSteps()
  }, [onComplete])

  const CurrentIcon = loadingSteps[currentStep]?.icon || Molecule

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <CurrentIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          </div>
          {/* Commercial Analysis Spinner Text */}
          <div className="text-lg font-semibold text-blue-700 mt-2 mb-4">
            Analyzing competitive landscape.<br />
            <span className="text-slate-600 font-normal">This may take up to 30 minutes...</span>
          </div>
          {/* Progress Bar and Step Text */}
          <Progress value={progress} className="h-2 mb-2" />
          <div className="text-sm text-slate-500">{loadingSteps[currentStep]?.text}</div>
        </CardContent>
      </Card>
    </div>
  )
}

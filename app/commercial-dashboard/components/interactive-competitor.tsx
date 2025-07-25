"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, TrendingUp, FileText, DollarSign, Target } from "lucide-react"

interface CompetitorData {
  name: string
  sponsor: string
  moa: string
  target: string
  milestone: string
  marketValue: string
  patients: string
  status: "approved" | "regional" | "development"
  trialData: {
    phase: string
    status: string
    primaryEndpoint: string
    enrollment: string
    estimatedCompletion: string
    clinicalTrialId: string
  }
  keyDifferentiators: string[]
  licensingTerms?: {
    dealValue: string
    upfront: string
    milestones: string
    royalties: string
    date: string
  }
  sources: Array<{
    name: string
    type: string
    url?: string
  }>
}

interface InteractiveCompetitorProps {
  competitor: CompetitorData
}

export function InteractiveCompetitor({ competitor }: InteractiveCompetitorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{competitor.name}</CardTitle>
              <Badge
                variant={
                  competitor.status === "approved"
                    ? "default"
                    : competitor.status === "regional"
                      ? "secondary"
                      : "outline"
                }
              >
                {competitor.status === "approved"
                  ? "Approved"
                  : competitor.status === "regional"
                    ? "Regional"
                    : "Development"}
              </Badge>
            </div>
            <CardDescription>{competitor.sponsor}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">MoA:</span>
                <p className="font-medium">{competitor.moa}</p>
              </div>
              <div>
                <span className="text-slate-600">Target:</span>
                <p className="font-medium">{competitor.target}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Market Value:</span>
                <p className="font-medium text-green-600">{competitor.marketValue}</p>
              </div>
              <div>
                <span className="text-slate-600">Patients:</span>
                <p className="font-medium">{competitor.patients}</p>
              </div>
            </div>
            <div>
              <span className="text-slate-600 text-sm">Latest Milestone:</span>
              <p className="font-medium">{competitor.milestone}</p>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {competitor.name} - Competitive Intelligence
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of {competitor.sponsor}'s {competitor.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trials">Trial Data</TabsTrigger>
            <TabsTrigger value="differentiators">Differentiators</TabsTrigger>
            <TabsTrigger value="licensing">Deal Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Market Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Market Value:</span>
                    <span className="text-sm font-semibold text-green-600">{competitor.marketValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Patient Base:</span>
                    <span className="text-sm font-semibold">{competitor.patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {competitor.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Mechanism</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-slate-600">MoA:</span>
                    <p className="text-sm font-medium">{competitor.moa}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Target:</span>
                    <p className="text-sm font-medium">{competitor.target}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Clinical Trial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Phase:</span>
                    <p className="text-sm">{competitor.trialData.phase}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {competitor.trialData.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Enrollment:</span>
                    <p className="text-sm">{competitor.trialData.enrollment}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Est. Completion:</span>
                    <p className="text-sm">{competitor.trialData.estimatedCompletion}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Primary Endpoint:</span>
                  <p className="text-sm mt-1">{competitor.trialData.primaryEndpoint}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Trial ID:</span>
                  <p className="text-sm font-mono">{competitor.trialData.clinicalTrialId}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="differentiators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Differentiators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {competitor.keyDifferentiators.map((differentiator, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm">{differentiator}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licensing" className="space-y-4">
            {competitor.licensingTerms ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Licensing & Acquisition Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Total Deal Value:</span>
                      <p className="text-lg font-bold text-green-600">{competitor.licensingTerms.dealValue}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Deal Date:</span>
                      <p className="text-sm">{competitor.licensingTerms.date}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Upfront Payment:</span>
                      <p className="text-sm font-semibold">{competitor.licensingTerms.upfront}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Milestones:</span>
                      <p className="text-sm font-semibold">{competitor.licensingTerms.milestones}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Royalty Structure:</span>
                    <p className="text-sm">{competitor.licensingTerms.royalties}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-500">No public licensing information available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Sources */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-slate-700 mb-2">Data Sources</h4>
          <div className="flex flex-wrap gap-2">
            {competitor.sources.map((source, index) => (
              <div key={index} className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {source.name}
                </Badge>
                {source.url && (
                  <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

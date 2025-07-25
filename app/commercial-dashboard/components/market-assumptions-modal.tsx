"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, DollarSign, Globe, ExternalLink, Info } from "lucide-react"

interface MarketAssumption {
  category: string
  assumptions: Array<{
    parameter: string
    value: string
    rationale: string
    confidence: number
    source: string
  }>
}

interface MarketAssumptionsModalProps {
  title: string
  value: string
  unit?: string
  assumptions: MarketAssumption[]
  growthDrivers: string[]
  sources: Array<{
    name: string
    type: string
    url?: string
    description: string
  }>
}

export function MarketAssumptionsModal({
  title,
  value,
  unit,
  assumptions,
  growthDrivers,
  sources,
}: MarketAssumptionsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1 text-blue-600 hover:text-blue-800">
          <Info className="w-4 h-4 mr-1" />
          View Assumptions
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {title} - Market Assumptions
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of assumptions, drivers, and methodology for {value} {unit}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="assumptions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assumptions">Key Assumptions</TabsTrigger>
            <TabsTrigger value="drivers">Growth Drivers</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="assumptions" className="space-y-4">
            {assumptions.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.category === "CAGR" && <TrendingUp className="w-4 h-4" />}
                    {category.category === "Patient Population" && <Users className="w-4 h-4" />}
                    {category.category === "Pricing" && <DollarSign className="w-4 h-4" />}
                    {category.category === "Geographic" && <Globe className="w-4 h-4" />}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.assumptions.map((assumption, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{assumption.parameter}</h4>
                        <Badge variant="outline" className="text-xs">
                          {assumption.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{assumption.rationale}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Confidence:</span>
                          <Progress value={assumption.confidence} className="w-20 h-2" />
                          <span className="text-xs font-semibold">{assumption.confidence}%</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {assumption.source}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Growth Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {growthDrivers.map((driver, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm">{driver}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((source, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{source.name}</CardTitle>
                      <Badge
                        variant={
                          source.type === "database" ? "default" : source.type === "manual" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {source.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">{source.description}</p>
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Source
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

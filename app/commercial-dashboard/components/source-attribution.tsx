"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ExternalLink, Database, FileText, Brain, BookOpen, Shield } from "lucide-react"

interface Source {
  name: string
  type: "database" | "manual" | "ai-generated" | "literature" | "regulatory"
  url?: string
  description?: string
  lastUpdated?: string
}

interface SourceAttributionProps {
  sectionTitle: string
  sources: Source[]
}

const getSourceIcon = (type: string) => {
  switch (type) {
    case "database":
      return Database
    case "manual":
      return FileText
    case "ai-generated":
      return Brain
    case "literature":
      return BookOpen
    case "regulatory":
      return Shield
    default:
      return FileText
  }
}

const getSourceColor = (type: string) => {
  switch (type) {
    case "database":
      return "default"
    case "manual":
      return "secondary"
    case "ai-generated":
      return "outline"
    case "literature":
      return "default"
    case "regulatory":
      return "default"
    default:
      return "outline"
  }
}

export function SourceAttribution({ sectionTitle, sources }: SourceAttributionProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs bg-transparent">
          <Database className="w-3 h-3 mr-1" />
          Sources ({sources.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Data Sources</SheetTitle>
          <SheetDescription>Sources used for {sectionTitle} analysis</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {sources.map((source, index) => {
            const Icon = getSourceIcon(source.type)
            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <CardTitle className="text-sm">{source.name}</CardTitle>
                    </div>
                    <Badge variant={getSourceColor(source.type) as any} className="text-xs">
                      {source.type === "manual"
                        ? "Manual Input"
                        : source.type === "ai-generated"
                          ? "AI Generated"
                          : source.type === "database"
                            ? "Database"
                            : source.type === "literature"
                              ? "Literature"
                              : "Regulatory"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {source.description && <p className="text-sm text-slate-600 mb-2">{source.description}</p>}
                  <div className="flex items-center justify-between">
                    {source.lastUpdated && (
                      <span className="text-xs text-slate-500">Updated: {source.lastUpdated}</span>
                    )}
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Source
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {sources.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sources available for this section</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

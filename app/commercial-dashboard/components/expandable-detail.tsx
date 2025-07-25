"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronRight, ExternalLink, Info } from "lucide-react"

interface Source {
  name: string
  type: "database" | "manual" | "ai-generated" | "literature" | "regulatory"
  url?: string
  description?: string
}

interface ExpandableDetailProps {
  title: string
  value: string | number
  unit?: string
  assumptions?: string[]
  formula?: string
  sources?: Source[]
  aiDerivation?: string
  children?: React.ReactNode
}

export function ExpandableDetail({
  title,
  value,
  unit,
  assumptions = [],
  formula,
  sources = [],
  aiDerivation,
  children,
}: ExpandableDetailProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1 text-blue-600 hover:text-blue-800">
          <Info className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-xs">
              {value} {unit}
            </Badge>
          </DialogTitle>
          <DialogDescription>Detailed breakdown of assumptions, methodology, and sources</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Key Assumptions</h4>
              <ul className="space-y-1">
                {assumptions.map((assumption, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formula */}
          {formula && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Calculation Method</h4>
              <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm">{formula}</div>
            </div>
          )}

          {/* AI Derivation */}
          {aiDerivation && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">AI-Generated Estimate</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{aiDerivation}</p>
              </div>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Data Sources</h4>
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          source.type === "manual"
                            ? "secondary"
                            : source.type === "ai-generated"
                              ? "outline"
                              : "default"
                        }
                        className="text-xs"
                      >
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
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Content */}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

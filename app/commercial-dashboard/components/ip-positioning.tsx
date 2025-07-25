import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const patentPortfolio = [
  {
    type: "Composition of Matter",
    expiration: "2029",
    strength: "Strong",
    description: "Core compound structure and key analogs",
    riskLevel: 15,
  },
  {
    type: "Method of Use",
    expiration: "2030",
    strength: "Moderate",
    description: "Treatment methods for EGFR+ NSCLC",
    riskLevel: 35,
  },
  {
    type: "Formulation",
    expiration: "2028",
    strength: "Moderate",
    description: "Tablet formulation and manufacturing process",
    riskLevel: 40,
  },
  {
    type: "Combination",
    expiration: "2031",
    strength: "Weak",
    description: "Combination with checkpoint inhibitors",
    riskLevel: 65,
  },
]

const mitigationStrategies = [
  {
    strategy: "Continuation Filings",
    description: "File additional patents on new formulations and combinations",
    timeline: "Ongoing",
    impact: "Extend exclusivity 2-3 years",
  },
  {
    strategy: "Trade Secrets",
    description: "Protect manufacturing processes and know-how",
    timeline: "Immediate",
    impact: "Indefinite protection",
  },
  {
    strategy: "Regulatory Exclusivity",
    description: "Leverage orphan drug and data exclusivity periods",
    timeline: "Upon approval",
    impact: "7-12 years protection",
  },
  {
    strategy: "Strategic Partnerships",
    description: "Cross-licensing agreements with complementary IP",
    timeline: "2024-2025",
    impact: "Strengthen overall position",
  },
]

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Source {
  name: string
  type: string
  url?: string
}

interface ExpandableDetailProps {
  title: string
  value: string
  unit?: string
  assumptions: string[]
  formula?: string
  sources: Source[]
  aiDerivation?: string
}

function ExpandableDetail({ title, value, unit, assumptions, formula, sources, aiDerivation }: ExpandableDetailProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex justify-between w-full">
            {title}
            <div className="font-bold">
              {value} {unit}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-4">
            <h5 className="font-semibold">Key Assumptions:</h5>
            <ul className="list-disc pl-5">
              {assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>

          {formula && (
            <div className="mb-4">
              <h5 className="font-semibold">Exclusivity Formula:</h5>
              <p>{formula}</p>
            </div>
          )}

          <div className="mb-4">
            <h5 className="font-semibold">Data Sources:</h5>
            <ul>
              {sources.map((source, index) => (
                <li key={index} className="flex items-center gap-2">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {source.name}
                    </a>
                  ) : (
                    <span>{source.name}</span>
                  )}
                  <Badge variant="secondary">{source.type}</Badge>
                </li>
              ))}
            </ul>
          </div>

          {aiDerivation && (
            <div>
              <h5 className="font-semibold">AI Derivation:</h5>
              <p className="text-sm">{aiDerivation}</p>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function IPPositioning() {
  return (
    <div className="space-y-6">
      {/* Summary Box */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Patent & Exclusivity Summary</CardTitle>
              <CardDescription>Intellectual property protection landscape</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600"><span className="blurred-section">4</span></div>
              <p className="text-sm text-slate-600">Years to Expiration</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600"><span className="blurred-section">4</span></p>
              <p className="text-sm text-slate-600">Years to Expiration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">45%</p>
              <p className="text-sm text-slate-600">Generic Entry Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">Strong</p>
              <p className="text-sm text-slate-600">Core IP Position</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patent Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Patent Portfolio Analysis</CardTitle>
            <CardDescription>Detailed breakdown of IP protection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="blurred-section">
              {patentPortfolio.map((patent, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{patent.type}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          patent.strength === "Strong"
                            ? "default"
                            : patent.strength === "Moderate"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {patent.strength}
                      </Badge>
                      <span className="text-sm text-slate-600">{patent.expiration}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{patent.description}</p>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Challenge Risk</span>
                      <span className="text-xs font-semibold">{patent.riskLevel}%</span>
                    </div>
                    <Progress value={patent.riskLevel} className="h-2" />
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <ExpandableDetail
                      title={`${patent.type} Patent Analysis`}
                      value={patent.expiration}
                      assumptions={[
                        patent.type === "Composition of Matter"
                          ? "Core compound patents filed 2022, 20-year term"
                          : patent.type === "Method of Use"
                            ? "Treatment method patents, potential for continuation filings"
                            : patent.type === "Formulation"
                              ? "Manufacturing process and formulation IP"
                              : "Combination therapy patents with checkpoint inhibitors",
                      ]}
                      sources={[
                        { name: "USPTO Patent Database", type: "regulatory", url: "https://www.uspto.gov" },
                        { name: "Patent Landscape Analysis", type: "manual" },
                        { name: "Freedom to Operate Study", type: "manual" },
                      ]}
                      aiDerivation={`Patent strength assessment using AI analysis of 500+ pharmaceutical patent challenges, weighted by patent type and therapeutic area`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patent Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Patent Expiration Timeline</CardTitle>
            <CardDescription>Visual timeline of IP protection periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="blurred-section">
              <div className="space-y-6">
                {/* Timeline visualization */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                  {/* Current year marker */}
                  <div className="relative flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      NOW
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-sm">2024</p>
                      <p className="text-xs text-slate-600">Current position</p>
                    </div>
                  </div>

                  {/* Patent expirations */}
                  {patentPortfolio.map((patent, index) => {
                    const yearsFromNow = Number.parseInt(patent.expiration) - 2024
                    return (
                      <div key={index} className="relative flex items-center mb-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            patent.strength === "Strong"
                              ? "bg-green-500"
                              : patent.strength === "Moderate"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        >
                          {yearsFromNow}
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-sm">{patent.expiration}</p>
                          <p className="text-xs text-slate-600">{patent.type}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>IP Protection Strategies</CardTitle>
          <CardDescription>Approaches to extend and strengthen IP position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mitigationStrategies.map((strategy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{strategy.strategy}</h4>
                    <Badge variant="outline">{strategy.timeline}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{strategy.description}</p>
                  <div className="text-xs text-green-600 font-semibold">Impact: {strategy.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Immediate Actions</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>File continuation patents on new formulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Conduct comprehensive FTO analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Establish trade secret protocols</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Medium-term Strategy</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Develop combination patent portfolio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Explore international filing strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Monitor competitor patent activity</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Long-term Planning</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Build next-generation compound IP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Strategic licensing partnerships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Lifecycle management planning</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

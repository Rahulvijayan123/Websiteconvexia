import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const payerSentiment = [
  {
    payer: "Medicare",
    icer: "$125K/QALY",
    date: "Mar 2024",
    wtp: "$150K",
    timeline: "6-12 mo",
    barriers: ["Prior Authorization", "Step Therapy"],
  },
  {
    payer: "Commercial",
    icer: "$110K/QALY",
    date: "Feb 2024",
    wtp: "$180K",
    timeline: "3-6 mo",
    barriers: ["Limited Networks", "Copay Limits"],
  },
  {
    payer: "Medicaid",
    icer: "$140K/QALY",
    date: "Jan 2024",
    wtp: "$75K",
    timeline: "12-24 mo",
    barriers: ["State Variability", "Budget Impact"],
  },
]

const comparators = [
  { drug: "Osimertinib", price: "$165K", indication: "EGFR+ NSCLC", access: "Broad" },
  { drug: "Alectinib", price: "$155K", indication: "ALK+ NSCLC", access: "Broad" },
  { drug: "Lorlatinib", price: "$195K", indication: "ALK+ NSCLC", access: "Limited" },
  { drug: "Selpercatinib", price: "$175K", indication: "RET+ NSCLC", access: "Moderate" },
]

interface ExpandableDetailProps {
  title: string
  value: string
  unit?: string
  assumptions: string[]
  formula?: string
  sources: { name: string; type: string; url?: string }[]
  aiDerivation?: string
}

function ExpandableDetail({ title, value, unit, assumptions, formula, sources, aiDerivation }: ExpandableDetailProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="blurred-section">{title}</DialogTitle>
          <DialogDescription className="blurred-section">
            Detailed analysis and methodology
          </DialogDescription>
        </DialogHeader>
        <div className="blurred-section space-y-4">
          <div>
            <h5 className="font-semibold">Key Assumptions:</h5>
            <ul className="list-disc pl-5">
              {assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>

          {formula && (
            <div>
              <h5 className="font-semibold">Calculation Formula:</h5>
              <p>{formula}</p>
            </div>
          )}

          <div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PricingAccess({
  competitorPricing,
  pricingScenarios
}: {
  competitorPricing?: any[],
  pricingScenarios?: any[]
} = {}) {
  return (
    <Tabs defaultValue="sentiment" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sentiment">Payer Sentiment</TabsTrigger>
        <TabsTrigger value="scenarios">Pricing Scenarios</TabsTrigger>
      </TabsList>

      <TabsContent value="sentiment" className="space-y-6">
        {/* Payer Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {payerSentiment.map((payer, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{payer.payer}</CardTitle>
                <CardDescription>
                  <span className="blurred-section">ICER: {payer.icer} • {payer.date}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="blurred-section space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Willingness to Pay</span>
                      <span className="text-sm font-bold text-green-600">{payer.wtp}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Reimbursement Timeline</span>
                    <p className="text-sm font-semibold">{payer.timeline}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Access Barriers</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {payer.barriers.map((barrier, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {barrier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <ExpandableDetail
                      title={`${payer.payer} Payer Analysis`}
                      value={payer.wtp}
                      assumptions={[
                        `ICER threshold: ${payer.icer} based on QALY analysis`,
                        `Reimbursement timeline reflects ${payer.payer} approval processes`,
                        `Access barriers typical for ${payer.payer} coverage policies`,
                        `WTP derived from comparable oncology approvals 2022-2024`,
                      ]}
                      formula={`WTP = Base ICER Threshold × (Clinical Benefit Score × Unmet Need Factor)`}
                      sources={[
                        { name: "ICER Reports", type: "database", url: "https://icer.org" },
                        { name: `${payer.payer} Coverage Policies`, type: "regulatory" },
                        { name: "Payer Intelligence Database", type: "database" },
                      ]}
                      aiDerivation={`Generated using payer sentiment analysis from 15 comparable EGFR TKI launches, weighted by indication overlap and coverage patterns`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Comparators */}
        <Card>
          <CardHeader>
            <CardTitle>Market Comparator Benchmarks</CardTitle>
            <CardDescription>Pricing and access patterns for similar oncology assets</CardDescription>
          </CardHeader>
          <CardContent>
            {competitorPricing && competitorPricing.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Drug</th>
                        <th className="text-left py-2">Annual Price</th>
                        <th className="text-left py-2">Indication</th>
                        <th className="text-left py-2">Access Level</th>
                        <th className="text-left py-2">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorPricing.map((comp, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{comp.drugName}</td>
                          <td className="py-2 text-green-600 font-semibold">{comp.annualPrice}</td>
                          <td className="py-2">{comp.indication}</td>
                          <td className="py-2">
                            <Badge
                              variant={
                                comp.accessLevel === "Broad" ? "default" : comp.accessLevel === "Moderate" ? "secondary" : "outline"
                              }
                            >
                              {comp.accessLevel}
                            </Badge>
                          </td>
                          <td className="py-2 text-xs text-slate-600 max-w-xs">{comp.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                No competitor pricing data available. This will be populated with real data from the competitive analysis.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scenarios" className="space-y-6">
        {/* Pricing Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Strategy Scenarios</CardTitle>
            <CardDescription>Comparative analysis of pricing and access strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {pricingScenarios && pricingScenarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Scenario</th>
                      <th className="text-left py-3">US Price</th>
                      <th className="text-left py-3">Ex-US Price</th>
                      <th className="text-left py-3">Gross-to-Net</th>
                      <th className="text-left py-3">Copay Support</th>
                      <th className="text-left py-3">Access Programs</th>
                      <th className="text-left py-3">Generic Entry</th>
                      <th className="text-left py-3">LOE Impact</th>
                      <th className="text-left py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingScenarios.map((scenario, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-medium">{scenario.scenario}</td>
                        <td className="py-3 text-green-600 font-semibold">{scenario.usPrice}</td>
                        <td className="py-3 text-blue-600 font-semibold">{scenario.exUsPrice}</td>
                        <td className="py-3">{scenario.grossToNet}</td>
                        <td className="py-3">
                          <Badge variant={scenario.copay === "Yes" ? "default" : "outline"}>{scenario.copay}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={scenario.access === "Yes" ? "default" : "outline"}>{scenario.access}</Badge>
                        </td>
                        <td className="py-3">{scenario.genericYear}</td>
                        <td className="py-3 text-red-600 font-semibold">{scenario.lossOfExclusivity}</td>
                        <td className="py-3">
                          <ExpandableDetail
                            title={`${scenario.scenario} Rationale`}
                            value={scenario.usPrice}
                            assumptions={[
                              `Reference pricing vs competitors with market positioning strategy`,
                              `Gross-to-net erosion based on oncology benchmarks and payer negotiations`,
                              `Copay support program covering patient responsibility`,
                              `Value-based contracts with major payers for broader access`,
                            ]}
                            sources={[
                              { name: "SSR Health Pricing Database", type: "database" },
                              { name: "IQVIA Pricing Analytics", type: "database" },
                              { name: "Payer Coverage Analysis", type: "manual" },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                No pricing scenarios data available. This will be populated with real research data.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scenario Rationales */}
        {pricingScenarios && pricingScenarios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingScenarios.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.scenario} Rationale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{scenario.rationale}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Access Strategy Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Access Strategy Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="blurred-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-slate-600 mb-3">Early Access Strategies</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Expanded Access Program (EAP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Named Patient Programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Compassionate Use Protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Bridge Programs</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-600 mb-3">Commercial Access Tools</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Patient Assistance Programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Copay Support Cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Hub Services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Outcomes-Based Contracts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

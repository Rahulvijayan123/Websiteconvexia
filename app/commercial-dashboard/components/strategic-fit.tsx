import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"

const tailwindComponents = [
  {
    category: "FDA Designations",
    score: 18,
    maxScore: 25,
    items: [
      { name: "Breakthrough Therapy", status: "Likely", impact: "High" },
      { name: "Fast Track", status: "Eligible", impact: "Medium" },
      { name: "Orphan Drug", status: "Eligible", impact: "High" },
      { name: "Priority Review", status: "Potential", impact: "Medium" },
    ],
  },
  {
    category: "Guidance Documents",
    score: 15,
    maxScore: 20,
    items: [
      { name: "Oncology Endpoints", status: "Aligned", impact: "High" },
      { name: "Biomarker Strategy", status: "Compliant", impact: "High" },
      { name: "Real-World Evidence", status: "Supportive", impact: "Medium" },
      { name: "Patient-Reported Outcomes", status: "Included", impact: "Medium" },
    ],
  },
  {
    category: "Policy Incentives",
    score: 12,
    maxScore: 20,
    items: [
      { name: "ARPA-H Funding", status: "Potential", impact: "Medium" },
      { name: "Medicare Innovation", status: "Aligned", impact: "High" },
      { name: "IRA Exclusions", status: "Eligible", impact: "High" },
      { name: "Tax Credits", status: "Available", impact: "Low" },
    ],
  },
  {
    category: "Advocacy Activity",
    score: 14,
    maxScore: 15,
    items: [
      { name: "Patient Organizations", status: "Strong", impact: "High" },
      { name: "KOL Support", status: "Established", impact: "High" },
      { name: "Medical Societies", status: "Engaged", impact: "Medium" },
      { name: "Congressional Interest", status: "Moderate", impact: "Medium" },
    ],
  },
  {
    category: "Market Precedent",
    score: 8,
    maxScore: 20,
    items: [
      { name: "Similar Approvals", status: "Limited", impact: "Medium" },
      { name: "Pricing Precedent", status: "Established", impact: "High" },
      { name: "Access Patterns", status: "Favorable", impact: "Medium" },
      { name: "Competitive Response", status: "Predictable", impact: "Low" },
    ],
  },
]

const buyerImpact = [
  {
    factor: "Regulatory Pathway Clarity",
    impact: "High",
    description: "Clear FDA guidance reduces development risk and timeline uncertainty",
  },
  {
    factor: "Policy Support",
    impact: "Medium",
    description: "Legislative incentives provide financial benefits and competitive advantages",
  },
  {
    factor: "Market Access Precedent",
    impact: "High",
    description: "Established payer acceptance patterns reduce commercial risk",
  },
  {
    factor: "Advocacy Momentum",
    impact: "Medium",
    description: "Strong patient advocacy creates favorable environment for approval and access",
  },
]

const strategicRecommendations = [
  {
    timeframe: "Immediate (0-6 months)",
    actions: [
      "Submit Breakthrough Therapy Designation request",
      "Engage with FDA on biomarker strategy",
      "Initiate patient advocacy partnerships",
      "Develop real-world evidence plan",
    ],
  },
  {
    timeframe: "Near-term (6-18 months)",
    actions: [
      "File for Fast Track designation",
      "Establish KOL advisory board",
      "Engage with CMS on coverage strategy",
      "Develop health economics dossier",
    ],
  },
  {
    timeframe: "Long-term (18+ months)",
    actions: [
      "Prepare for Priority Review Voucher",
      "Build international regulatory strategy",
      "Establish outcomes-based contracts",
      "Develop lifecycle management plan",
    ],
  },
]

const strategicSources = [
  {
    name: "FDA Guidance Documents",
    type: "regulatory" as const,
    url: "https://www.fda.gov/drugs/guidance-compliance-regulatory-information",
    description: "Current FDA guidance on oncology drug development",
  },
  {
    name: "ARPA-H Strategic Plan",
    type: "regulatory" as const,
    description: "Federal health research priorities and funding",
  },
  {
    name: "Medicare Innovation Center",
    type: "regulatory" as const,
    description: "CMS innovation pathways and coverage policies",
  },
  {
    name: "Policy Impact Analysis",
    type: "ai-generated" as const,
    description: "ML-based analysis of regulatory sentiment and policy trends",
  },
]

export function StrategicFit() {
  const totalScore = tailwindComponents.reduce((sum, component) => sum + component.score, 0)
  const maxTotalScore = tailwindComponents.reduce((sum, component) => sum + component.maxScore, 0)
  const overallScore = Math.round((totalScore / maxTotalScore) * 100)

  return (
    <div className="space-y-6">
      {/* Header Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Strategic Tailwind Score</CardTitle>
              </div>
              <CardDescription>Regulatory and policy environment assessment</CardDescription>
            </div>
            {/* Remove number, label, and sources from header */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-5 gap-4">
              {tailwindComponents.map((component, index) => (
                <div key={index} className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {component.score}/{component.maxScore}
                  </p>
                  <p className="text-sm text-slate-600">{component.category}</p>
                </div>
              ))}
            </div>
            {/* Add 30 scrollable sources below the grid */}
            <div className="mt-4 max-h-40 overflow-y-auto border-t pt-2">
              <h4 className="text-xs font-semibold text-slate-500 mb-1">Sources</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {Array.from({length: 30}).map((_, i) => (
                  <li key={i}>https://tailwind-source-{i+1}.com</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tailwindComponents.map((component, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{component.category}</CardTitle>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">
                    {component.score}/{component.maxScore}
                  </span>
                </div>
              </div>
              <Progress value={(component.score / component.maxScore) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="blurred-section">
                {component.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-slate-600">{item.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.impact === "High" ? "default" : item.impact === "Medium" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {item.impact}
                      </Badge>
                      <ExpandableDetail
                        title={`${item.name} Analysis`}
                        value={item.status}
                        assumptions={[
                          item.name === "Breakthrough Therapy"
                            ? "Substantial improvement over existing therapy demonstrated in Phase II"
                            : item.name === "Patient Organizations"
                              ? "Strong advocacy from LUNGevity, GO2 Foundation, and LCFA"
                              : item.name === "Medicare Innovation"
                                ? "Alignment with CMS Innovation Center value-based care initiatives"
                                : `${item.name} provides strategic advantage in regulatory and commercial pathways`,
                        ]}
                        sources={[
                          { name: "FDA Guidance Documents", type: "regulatory" },
                          { name: "Policy Impact Database", type: "database" },
                          { name: "Stakeholder Analysis", type: "manual" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Buyer Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Impact on Buyer Interest</CardTitle>
          <CardDescription>How regulatory tailwinds influence acquisition attractiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buyerImpact.map((factor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{factor.factor}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          factor.impact === "High" ? "default" : factor.impact === "Medium" ? "secondary" : "outline"
                        }
                      >
                        {factor.impact} Impact
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Action Plan</CardTitle>
          <CardDescription>Recommended actions to maximize regulatory tailwinds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="space-y-6">
              {strategicRecommendations.map((timeframe, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-sm text-slate-600 mb-3">{timeframe.timeframe}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {timeframe.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Success Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Key Success Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Regulatory Excellence</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Proactive FDA engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Robust biomarker strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Quality clinical execution</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Stakeholder Alignment</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Patient advocacy partnerships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>KOL engagement strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Payer relationship building</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Commercial Readiness</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Market access preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Health economics evidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Launch strategy development</span>
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

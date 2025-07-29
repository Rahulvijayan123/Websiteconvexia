import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"

const regulatoryIncentives = [
  {
    incentive: "Orphan Drug Designation",
    status: "Eligible",
    description: "Rare disease indication with <200K US patients",
    impact: "7-year exclusivity + tax credits",
    probability: "85%",
  },
  {
    incentive: "Breakthrough Therapy",
    status: "Eligible",
    description: "Substantial improvement over existing therapies",
    impact: "Accelerated review + FDA guidance",
    probability: "70%",
  },
  {
    incentive: "Fast Track Designation",
    status: "Eligible",
    description: "Unmet medical need in serious condition",
    impact: "Rolling review + priority review",
    probability: "90%",
  },
  {
    incentive: "Priority Review Voucher",
    status: "Not Eligible",
    description: "Rare pediatric disease or tropical disease",
    impact: "6-month priority review for future drug",
    probability: "0%",
  },
]

const reviewTimeline = [
  { phase: "Pre-IND Meeting", timeline: "Q1 2024", status: "Completed" },
  { phase: "IND Submission", timeline: "Q2 2024", status: "Completed" },
  { phase: "Phase I Start", timeline: "Q3 2024", status: "In Progress" },
  { phase: "Phase II Start", timeline: "Q1 2025", status: "Planned" },
  { phase: "Phase III Start", timeline: "Q3 2026", status: "Planned" },
  { phase: "NDA Submission", timeline: "Q4 2028", status: "Planned" },
  { phase: "FDA Approval", timeline: "Q2 2029", status: "Planned" },
]

const regulatorySources = [
  {
    name: "FDA Guidance Documents",
    type: "manual" as const,
    description: "Orphan Drug Act, Breakthrough Therapy Designation guidance",
  },
  {
    name: "ClinicalTrials.gov",
    type: "database" as const,
    url: "https://clinicaltrials.gov",
    description: "Clinical trial registration and status",
    lastUpdated: "Dec 2024",
  },
  {
    name: "FDA Drug Approval Database",
    type: "database" as const,
    description: "Historical approval timelines and designations",
  },
  {
    name: "Regulatory Intelligence Platform",
    type: "ai-generated" as const,
    description: "AI-powered regulatory pathway analysis",
  },
]

export function IncentivesRegulation({
  prvEligibility,
  orphanDrugEligibility,
  breakthroughTherapyEligibility,
  fastTrackEligibility,
  priorityReviewEligibility,
  regulatoryTimeline,
  approvalProbability
}: {
  prvEligibility?: string,
  orphanDrugEligibility?: string,
  breakthroughTherapyEligibility?: string,
  fastTrackEligibility?: string,
  priorityReviewEligibility?: string,
  regulatoryTimeline?: string,
  approvalProbability?: string
} = {}) {
  // Input validation function to detect invalid inputs
  const isInvalidInput = (input: string | null | undefined): boolean => {
    if (!input || typeof input !== 'string') return true;
    const trimmed = input.trim().toLowerCase();
    // Only detect obviously invalid inputs - be more permissive for real drug/target names
    const invalidPatterns = ['xxx', 'n/a', 'random', 'asdf', 'test', 'placeholder', 'dummy', 'fake', 'qwerty', '123456'];
    return invalidPatterns.some(pattern => trimmed.includes(pattern)) || trimmed.length < 1;
  };

  // Get input values from localStorage to validate
  const getInputValues = () => {
    try {
      const stored = localStorage.getItem('perplexityResult');
      if (stored) {
        const data = JSON.parse(stored);
        return data.inputValues || {
          therapeuticArea: '',
          indication: '',
          target: '',
          geography: '',
          developmentPhase: ''
        };
      }
    } catch (e) {
      // If localStorage fails, assume valid input
    }
    return { therapeuticArea: '', indication: '', target: '', geography: '', developmentPhase: '' };
  };

  const inputValues = getInputValues();
  // Only trigger fallback if MOST fields are invalid (at least 3 out of 5)
  const invalidFields = [
    isInvalidInput(inputValues.therapeuticArea),
    isInvalidInput(inputValues.indication),
    isInvalidInput(inputValues.target),
    isInvalidInput(inputValues.geography),
    isInvalidInput(inputValues.developmentPhase)
  ].filter(Boolean);
  const hasInvalidInput = invalidFields.length >= 3;

  // Generate detailed rationales for each regulatory aspect
  const getPRVEligibilityRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (prvEligibility && prvEligibility !== 'Unknown') {
      return `${prvEligibility} - based on disease prevalence, pediatric population, and FDA guidance for Priority Review Voucher eligibility`;
    }
    return 'PRV eligibility requires assessment of disease prevalence and pediatric population impact';
  };

  const getOrphanDrugRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (orphanDrugEligibility && orphanDrugEligibility !== 'Unknown') {
      return `${orphanDrugEligibility} - based on patient population size and rare disease criteria per Orphan Drug Act`;
    }
    return 'Orphan drug designation requires patient population analysis and rare disease assessment';
  };

  const getBreakthroughTherapyRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (breakthroughTherapyEligibility && breakthroughTherapyEligibility !== 'Unknown') {
      return `${breakthroughTherapyEligibility} - based on clinical data showing substantial improvement over existing therapies`;
    }
    return 'Breakthrough therapy designation requires clinical data analysis and comparative efficacy assessment';
  };

  const getFastTrackRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (fastTrackEligibility && fastTrackEligibility !== 'Unknown') {
      return `${fastTrackEligibility} - based on unmet medical need assessment and serious condition criteria`;
    }
    return 'Fast track designation requires unmet medical need analysis and serious condition assessment';
  };

  const getPriorityReviewRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (priorityReviewEligibility && priorityReviewEligibility !== 'Unknown') {
      return `${priorityReviewEligibility} - based on disease severity, unmet need, and therapeutic advancement criteria`;
    }
    return 'Priority review eligibility requires disease severity and therapeutic advancement assessment';
  };

  const getRegulatoryTimelineRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (regulatoryTimeline && regulatoryTimeline !== 'Unknown') {
      return `${regulatoryTimeline} - based on development phase, regulatory pathway, and historical approval timelines`;
    }
    return 'Regulatory timeline requires development phase analysis and regulatory pathway assessment';
  };

  const getApprovalProbabilityRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (approvalProbability && approvalProbability !== 'Unknown') {
      return `${approvalProbability} approval probability - based on clinical data quality, regulatory precedents, and risk factors`;
    }
    return 'Approval probability requires clinical data analysis and regulatory risk assessment';
  };

  return (
    <div className="space-y-6">
      {/* Regulatory Incentives */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Regulatory Incentives & Designations</CardTitle>
          <CardDescription>Available regulatory pathways and incentives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Orphan Drug Designation</h4>
                <Badge variant={orphanDrugEligibility === 'Eligible' ? "default" : "secondary"}>
                  {hasInvalidInput ? 'N/A' : (orphanDrugEligibility || 'N/A')}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">Rare disease indication with &lt;200K US patients</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">7-year exclusivity + tax credits</span>
                <span className="font-medium text-blue-600">85%</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {getOrphanDrugRationale()}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Breakthrough Therapy</h4>
                <Badge variant={breakthroughTherapyEligibility === 'Eligible' ? "default" : "secondary"}>
                  {hasInvalidInput ? 'N/A' : (breakthroughTherapyEligibility || 'N/A')}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">Substantial improvement over existing therapies</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Accelerated review + FDA guidance</span>
                <span className="font-medium text-blue-600">70%</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {getBreakthroughTherapyRationale()}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Fast Track Designation</h4>
                <Badge variant={fastTrackEligibility === 'Eligible' ? "default" : "secondary"}>
                  {hasInvalidInput ? 'N/A' : (fastTrackEligibility || 'N/A')}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">Unmet medical need in serious condition</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Rolling review + priority review</span>
                <span className="font-medium text-blue-600">90%</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {getFastTrackRationale()}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Priority Review Voucher</h4>
                <Badge variant={prvEligibility === 'Eligible' ? "default" : "secondary"}>
                  {hasInvalidInput ? 'N/A' : (prvEligibility || 'N/A')}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">Rare pediatric disease or tropical disease</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">6-month priority review for future drug</span>
                <span className="font-medium text-blue-600">0%</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {getPRVEligibilityRationale()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regulatory Timeline */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Regulatory Timeline</CardTitle>
            <CardDescription>Expected development and approval milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Pre-IND Meeting</p>
                  <p className="text-sm text-slate-600">Q1 2024</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">IND Submission</p>
                  <p className="text-sm text-slate-600">Q2 2024</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Phase I Start</p>
                  <p className="text-sm text-slate-600">Q3 2024</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Phase II Start</p>
                  <p className="text-sm text-slate-600">Q1 2025</p>
                </div>
                <Badge variant="outline">Planned</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Phase III Start</p>
                  <p className="text-sm text-slate-600">Q3 2026</p>
                </div>
                <Badge variant="outline">Planned</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">NDA Submission</p>
                  <p className="text-sm text-slate-600">Q4 2028</p>
                </div>
                <Badge variant="outline">Planned</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">FDA Approval</p>
                  <p className="text-sm text-slate-600">Q2 2029</p>
                </div>
                <Badge variant="outline">Planned</Badge>
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-4 leading-relaxed">
              {getRegulatoryTimelineRationale()}
            </p>
          </CardContent>
        </Card>

        {/* Approval Probability */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Approval Probability Analysis</CardTitle>
            <CardDescription>Risk factors and success likelihood</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {hasInvalidInput ? 'N/A' : (approvalProbability || 'N/A')}
              </div>
              <p className="text-sm text-slate-600">Overall Approval Probability</p>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {getApprovalProbabilityRationale()}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Clinical Data Quality</span>
                  <span className="text-sm font-bold text-green-600">High</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Safety Profile</span>
                  <span className="text-sm font-bold text-green-600">Favorable</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Unmet Medical Need</span>
                  <span className="text-sm font-bold text-blue-600">Moderate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Regulatory Risk</span>
                  <span className="text-sm font-bold text-yellow-600">Low-Medium</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Risk Factors */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Key Regulatory Risk Factors</CardTitle>
          <CardDescription>Potential challenges and mitigation strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Clinical Development Risks</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Patient recruitment challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Strong preclinical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Endpoint validation required</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Regulatory Risks</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Clear regulatory pathway</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>FDA guidance evolution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Precedent approvals exist</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Market Access Risks</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Payer coverage uncertainty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Strong value proposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Competitive landscape changes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <SourceAttribution sectionTitle="Regulatory Analysis" sources={regulatorySources} />
    </div>
  )
}

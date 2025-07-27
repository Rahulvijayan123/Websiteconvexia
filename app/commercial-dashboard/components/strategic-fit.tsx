import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"

// Input validation utility function
const isInvalidInput = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== 'string') return true;
  const trimmed = input.trim().toLowerCase();
  const invalidPatterns = ['xxx', 'n/a', 'random', 'asdf', 'test', 'placeholder', 'dummy', 'fake'];
  return invalidPatterns.some(pattern => trimmed.includes(pattern)) || trimmed.length < 2;
};

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

export function StrategicFit({
  strategicTailwindData
}: {
  strategicTailwindData?: any
} = {}) {
  // Check for invalid inputs
  const inputValues = getInputValues();
  const hasInvalidInput = isInvalidInput(inputValues.therapeuticArea) ||
                         isInvalidInput(inputValues.indication) ||
                         isInvalidInput(inputValues.target) ||
                         isInvalidInput(inputValues.geography) ||
                         isInvalidInput(inputValues.developmentPhase);

  // Helper function to get status with impact
  const getStatusWithImpact = (status: string) => {
    if (status?.toLowerCase().includes('likely') || status?.toLowerCase().includes('strong') || status?.toLowerCase().includes('aligned')) {
      return { status, impact: "High" };
    } else if (status?.toLowerCase().includes('eligible') || status?.toLowerCase().includes('established') || status?.toLowerCase().includes('compliant')) {
      return { status, impact: "Medium" };
    } else {
      return { status, impact: "Low" };
    }
  };

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
            {/* Removed number, label, and sources from header as requested */}
          </div>
        </CardHeader>
        <CardContent>
          {strategicTailwindData ? (
            <div className="grid grid-cols-5 gap-4">
              {/* FDA Designations */}
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  FDA Designations
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {strategicTailwindData.fdaDesignations?.rationale || 'Assessment based on FDA criteria and current guidance'}
                </p>
              </div>
              
              {/* Guidance Documents */}
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  Guidance Documents
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {strategicTailwindData.guidanceDocuments?.rationale || 'Alignment with FDA guidance and regulatory precedents'}
                </p>
              </div>
              
              {/* Policy Incentives */}
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">
                  Policy Incentives
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {strategicTailwindData.policyIncentives?.rationale || 'Current policy landscape and legislative developments'}
                </p>
              </div>
              
              {/* Advocacy Activity */}
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  Advocacy Activity
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {strategicTailwindData.advocacyActivity?.rationale || 'Stakeholder analysis and advocacy landscape'}
                </p>
              </div>
              
              {/* Market Precedent */}
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  Market Precedent
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {strategicTailwindData.marketPrecedent?.rationale || 'Market analysis and competitive intelligence'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Strategic tailwind data will be populated with real research-backed values.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FDA Designations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">FDA Designations</CardTitle>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {strategicTailwindData?.fdaDesignations?.rationale || 'Assessment based on FDA criteria and current guidance'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicTailwindData?.fdaDesignations ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Breakthrough Therapy</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.fdaDesignations.breakthroughTherapy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.fdaDesignations.breakthroughTherapy).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Fast Track</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.fdaDesignations.fastTrack}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.fdaDesignations.fastTrack).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Orphan Drug</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.fdaDesignations.orphanDrug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.fdaDesignations.orphanDrug).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Priority Review</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.fdaDesignations.priorityReview}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.fdaDesignations.priorityReview).impact}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">
                FDA designations data will be populated with real research-backed values.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidance Documents */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Guidance Documents</CardTitle>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {strategicTailwindData?.guidanceDocuments?.rationale || 'Alignment with FDA guidance and regulatory precedents'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicTailwindData?.guidanceDocuments ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Oncology Endpoints</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.guidanceDocuments.oncologyEndpoints}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.guidanceDocuments.oncologyEndpoints).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Biomarker Strategy</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.guidanceDocuments.biomarkerStrategy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.guidanceDocuments.biomarkerStrategy).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Real-World Evidence</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.guidanceDocuments.realWorldEvidence}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.guidanceDocuments.realWorldEvidence).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Patient-Reported Outcomes</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.guidanceDocuments.patientReportedOutcomes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.guidanceDocuments.patientReportedOutcomes).impact}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">
                Guidance documents data will be populated with real research-backed values.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Incentives */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Policy Incentives</CardTitle>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {strategicTailwindData?.policyIncentives?.rationale || 'Current policy landscape and legislative developments'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicTailwindData?.policyIncentives ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ARPA-H Funding</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.policyIncentives.arpaHFunding}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.policyIncentives.arpaHFunding).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Medicare Innovation</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.policyIncentives.medicareInnovation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.policyIncentives.medicareInnovation).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">IRA Exclusions</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.policyIncentives.iraExclusions}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.policyIncentives.iraExclusions).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tax Credits</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.policyIncentives.taxCredits}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.policyIncentives.taxCredits).impact}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">
                Policy incentives data will be populated with real research-backed values.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advocacy Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advocacy Activity</CardTitle>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {strategicTailwindData?.advocacyActivity?.rationale || 'Stakeholder analysis and advocacy landscape'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicTailwindData?.advocacyActivity ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Patient Organizations</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.advocacyActivity.patientOrganizations}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.advocacyActivity.patientOrganizations).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">KOL Support</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.advocacyActivity.kolSupport}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.advocacyActivity.kolSupport).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Medical Societies</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.advocacyActivity.medicalSocieties}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.advocacyActivity.medicalSocieties).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Congressional Interest</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.advocacyActivity.congressionalInterest}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.advocacyActivity.congressionalInterest).impact}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">
                Advocacy activity data will be populated with real research-backed values.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Precedent */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Market Precedent</CardTitle>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {strategicTailwindData?.marketPrecedent?.rationale || 'Market analysis and competitive intelligence'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicTailwindData?.marketPrecedent ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Similar Approvals</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.marketPrecedent.similarApprovals}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.marketPrecedent.similarApprovals).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pricing Precedent</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.marketPrecedent.pricingPrecedent}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.marketPrecedent.pricingPrecedent).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Access Patterns</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.marketPrecedent.accessPatterns}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.marketPrecedent.accessPatterns).impact}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Competitive Response</p>
                    <p className="text-xs text-slate-600">{strategicTailwindData.marketPrecedent.competitiveResponse}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getStatusWithImpact(strategicTailwindData.marketPrecedent.competitiveResponse).impact}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-4">
                Market precedent data will be populated with real research-backed values.
              </div>
            )}
          </CardContent>
        </Card>
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
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Regulatory Pathway Clarity</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">High Impact</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">Clear FDA guidance reduces development risk and timeline uncertainty</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Policy Support</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Medium Impact</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">Legislative incentives provide financial benefits and competitive advantages</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Market Access Precedent</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">High Impact</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">Established payer acceptance patterns reduce commercial risk</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Advocacy Momentum</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Medium Impact</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">Strong patient advocacy creates favorable environment for approval and access</p>
              </div>
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
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Immediate (0-6 months)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Submit Breakthrough Therapy Designation request</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Engage with FDA on biomarker strategy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Initiate patient advocacy partnerships</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Develop real-world evidence plan</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Near-term (6-18 months)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">File for Fast Track designation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Establish KOL advisory board</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Engage with CMS on coverage strategy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Develop health economics dossier</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Long-term (18+ months)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Prepare for Priority Review Voucher</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Build international regulatory strategy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Establish outcomes-based contracts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm">Develop lifecycle management plan</span>
                  </div>
                </div>
              </div>
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

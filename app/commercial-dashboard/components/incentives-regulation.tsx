import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExpandableDetail } from "./expandable-detail"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"

// Input validation utility function
const isInvalidInput = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== 'string') return true;
  const trimmed = input.trim().toLowerCase();
  // Only detect obviously invalid inputs - be more permissive for real drug/target names
  const invalidPatterns = ['xxx', 'n/a', 'random', 'asdf', 'test', 'placeholder', 'dummy', 'fake', 'qwerty', '123456'];
  return invalidPatterns.some(pattern => trimmed.includes(pattern)) || trimmed.length < 1;
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

const incentives = [
  {
    name: "Orphan Drug Designation",
    status: "Eligible",
    value: "$3M PDUFA fee waiver",
    exclusivity: "7 years",
    probability: 85,
  },
  {
    name: "Priority Review Voucher",
    status: "Potential",
    value: "$100-350M",
    exclusivity: "N/A",
    probability: 45,
  },
  {
    name: "Breakthrough Designation",
    status: "Likely",
    value: "Expedited review",
    exclusivity: "N/A",
    probability: 70,
  },
  {
    name: "Fast Track Designation",
    status: "Eligible",
    value: "Rolling review",
    exclusivity: "N/A",
    probability: 90,
  },
]

const regulatoryTimeline = [
  { milestone: "IND Filing", timeline: "Completed", status: "done" },
  { milestone: "Phase I Initiation", timeline: "Q1 2024", status: "done" },
  { milestone: "Phase II Initiation", timeline: "Q3 2024", status: "current" },
  { milestone: "Breakthrough Designation", timeline: "Q4 2024", status: "pending" },
  { milestone: "Phase III Initiation", timeline: "Q2 2025", status: "pending" },
  { milestone: "NDA Filing", timeline: "Q4 2026", status: "pending" },
  { milestone: "FDA Approval", timeline: "Q2 2027", status: "pending" },
]

const policyIncentives = [
  {
    category: "OBBBA 2024 Provisions",
    items: [
      "ODD expansion for rare cancer subtypes",
      "IRA pricing exclusion (7 years)",
      "Enhanced tax credits for pediatric trials",
      "Accelerated PDUFA fee waivers",
      "Extended market exclusivity periods",
    ],
  },
  {
    category: "FDA Modernization",
    items: [
      "Real-world evidence acceptance",
      "Biomarker-driven approvals",
      "Patient-reported outcomes emphasis",
      "Decentralized trial support",
      "AI/ML guidance implementation",
    ],
  },
  {
    category: "International Harmonization",
    items: [
      "EMA parallel scientific advice",
      "PMDA consultation alignment",
      "Health Canada priority review",
      "Global regulatory strategy coordination",
      "Mutual recognition agreements",
    ],
  },
]

export function IncentivesRegulation({
  prvEligibility,
  nationalPriority,
  reviewTimelineMonths
}: {
  prvEligibility?: string | number,
  nationalPriority?: string,
  reviewTimelineMonths?: string | number
}) {
  // Check for invalid inputs
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

  // Business logic validation functions
  const validatePRVEligibility = () => {
    if (hasInvalidInput) return { isValid: false, message: 'Input validation failed' };
    
    if (prvEligibility === 'Yes' || prvEligibility === 'yes' || prvEligibility === 1) {
      return { isValid: true, message: 'Eligible for Priority Review Voucher' };
    } else if (prvEligibility === 'No' || prvEligibility === 'no' || prvEligibility === 0) {
      return { isValid: false, message: 'Not eligible for Priority Review Voucher' };
    } else if (typeof prvEligibility === 'number' && prvEligibility > 50) {
      return { isValid: true, message: `High probability (${prvEligibility}%) for PRV eligibility` };
    } else if (typeof prvEligibility === 'number' && prvEligibility <= 50) {
      return { isValid: false, message: `Low probability (${prvEligibility}%) for PRV eligibility` };
    }
    return { isValid: false, message: 'PRV eligibility unclear' };
  };

  const validateRareDiseaseEligibility = () => {
    // This would need patient count data from other components
    // For now, we'll show a placeholder
    return { isValid: true, message: 'Rare disease eligibility depends on patient population (<200k)' };
  };

  const validateReviewTimeline = () => {
    if (hasInvalidInput) return { isValid: false, message: 'Input validation failed' };
    
    if (typeof reviewTimelineMonths === 'number') {
      if (reviewTimelineMonths <= 6) {
        return { isValid: true, message: 'Priority review timeline (≤6 months)' };
      } else if (reviewTimelineMonths <= 12) {
        return { isValid: true, message: 'Standard review timeline (≤12 months)' };
      } else {
        return { isValid: false, message: 'Extended review timeline (>12 months)' };
      }
    }
    return { isValid: false, message: 'Review timeline unclear' };
  };

  // Run validations
  const prvValidation = validatePRVEligibility();
  const rareDiseaseValidation = validateRareDiseaseEligibility();
  const timelineValidation = validateReviewTimeline();

  // Generate detailed, specific information for each field
  const getDetailedPRVEligibility = () => {
    if (hasInvalidInput) return 'N/A';
    if (prvEligibility === 'No' || prvEligibility === 'no' || prvEligibility === 0) {
      return 'Not eligible for Priority Review Voucher - indication does not meet tropical disease or rare pediatric disease criteria under FDA guidance';
    }
    if (prvEligibility === 'Yes' || prvEligibility === 'yes' || prvEligibility === 1) {
      return 'Eligible for Priority Review Voucher - meets tropical disease designation criteria with potential $100-350M voucher value';
    }
    if (typeof prvEligibility === 'number') {
      return `Priority Review Voucher eligibility probability: ${prvEligibility}% based on indication classification and regulatory precedent`;
    }
    if (typeof prvEligibility === 'string' && prvEligibility.includes('%')) {
      return `Priority Review Voucher eligibility assessment: ${prvEligibility} probability based on current FDA guidance and indication characteristics`;
    }
    return `Priority Review Voucher status: ${prvEligibility} - requires further regulatory assessment for tropical disease or rare pediatric designation`;
  };

  const getDetailedNationalPriority = () => {
    if (hasInvalidInput) return 'N/A';
    if (nationalPriority === 'High') {
      return 'High national priority designation - addresses critical unmet medical need with significant public health impact and government support';
    }
    if (nationalPriority === 'Medium') {
      return 'Medium national priority - recognized public health importance with moderate government interest and funding consideration';
    }
    if (nationalPriority === 'Low') {
      return 'Low national priority - limited government focus but may qualify for standard regulatory pathways and incentives';
    }
    return `National priority assessment: ${nationalPriority} - based on public health impact, government funding priorities, and regulatory framework`;
  };

  const getDetailedReviewTimeline = () => {
    if (hasInvalidInput) return 'N/A';
    if (typeof reviewTimelineMonths === 'number') {
      return `FDA review timeline: ${reviewTimelineMonths} months - standard review pathway with potential for priority review if breakthrough designation granted`;
    }
    if (typeof reviewTimelineMonths === 'string') {
      if (reviewTimelineMonths.includes('10-12') || reviewTimelineMonths.includes('12')) {
        return 'FDA review timeline: 10-12 months - standard review pathway with potential for priority review (6 months) if breakthrough designation criteria met';
      }
      if (reviewTimelineMonths.includes('6') || reviewTimelineMonths.includes('priority')) {
        return 'FDA review timeline: 6 months - priority review pathway granted due to breakthrough designation or unmet medical need';
      }
      return `FDA review timeline: ${reviewTimelineMonths} - based on current regulatory pathway and designation status`;
    }
    return `FDA review timeline: ${reviewTimelineMonths} - requires confirmation of regulatory pathway and designation status`;
  };

  const getDetailedRareDiseaseEligibility = () => {
    if (hasInvalidInput) return 'N/A';
    return 'Rare disease eligibility: 85% probability - patient population estimated below 200,000 in US, qualifying for orphan drug designation with 7-year exclusivity';
  };

  return (
    <div className="space-y-6">
      {/* Business Logic Validation Alert */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            Regulatory Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {prvValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">{prvValidation.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {rareDiseaseValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">{rareDiseaseValidation.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {timelineValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">{timelineValidation.message}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">CNPV/PRV Eligibility Score</CardTitle>
              <CardDescription>Regulatory incentive qualification assessment</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {hasInvalidInput ? 'N/A' : (typeof prvEligibility === 'number' ? `${prvEligibility}%` : prvEligibility || 'N/A')}
              </div>
              <Badge variant={prvValidation.isValid ? "default" : "destructive"}>
                {prvValidation.isValid ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">PRV Eligibility</span>
                <span className="text-sm text-slate-600">
                  {hasInvalidInput ? 'N/A' : (typeof prvEligibility === 'number' ? `${prvEligibility}%` : prvEligibility || 'N/A')}
                </span>
              </div>
              <Progress value={typeof prvEligibility === 'number' ? prvEligibility : 0} className="h-2" />
              <ExpandableDetail
                title="PRV Eligibility Details"
                value={typeof prvEligibility === 'number' ? `${prvEligibility}%` : prvEligibility || 'N/A'}
                aiDerivation={getDetailedPRVEligibility()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Designations */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Designations & Incentives</CardTitle>
          <CardDescription>FDA designations and regulatory pathway opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incentives.map((incentive, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{incentive.name}</h4>
                    <Badge variant={incentive.status === 'Eligible' ? 'default' : incentive.status === 'Likely' ? 'secondary' : 'outline'}>
                      {incentive.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{incentive.value}</p>
                  {incentive.exclusivity !== 'N/A' && (
                    <p className="text-xs text-slate-500">Exclusivity: {incentive.exclusivity}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{incentive.probability}%</div>
                  <Progress value={incentive.probability} className="w-20 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Timeline</CardTitle>
          <CardDescription>Expected FDA review and approval milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulatoryTimeline.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  milestone.status === 'done' ? 'bg-green-500' : 
                  milestone.status === 'current' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{milestone.milestone}</span>
                    <span className="text-sm text-slate-600">{milestone.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Review Timeline</span>
              </div>
              <ExpandableDetail
                title="Timeline Details"
                value={typeof reviewTimelineMonths === 'number' ? `${reviewTimelineMonths} months` : reviewTimelineMonths || 'N/A'}
                aiDerivation={getDetailedReviewTimeline()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Incentives */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Incentives & Regulatory Tailwinds</CardTitle>
          <CardDescription>Current regulatory environment and policy support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {policyIncentives.map((category, index) => (
              <div key={index}>
                <h4 className="font-semibold text-slate-700 mb-3">{category.category}</h4>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

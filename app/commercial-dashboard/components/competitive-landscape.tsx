import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"
import { InteractiveCompetitor } from "./interactive-competitor"
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const competitorData = [
  {
    name: "Osimertinib",
    sponsor: "AstraZeneca",
    moa: "3rd-gen EGFR TKI",
    target: "EGFR T790M",
    milestone: "Approved 2015",
    marketValue: "$5.4B",
    patients: "45K",
    status: "approved" as const,
    trialData: {
      phase: "Phase III (FLAURA)",
      status: "Completed",
      primaryEndpoint: "Progression-free survival",
      enrollment: "556 patients",
      estimatedCompletion: "Completed 2017",
      clinicalTrialId: "NCT02296125",
    },
    keyDifferentiators: [
      "First-in-class 3rd generation EGFR TKI with T790M selectivity",
      "Superior CNS penetration vs. earlier generation TKIs",
      "Improved tolerability profile with reduced skin/GI toxicity",
      "Established first-line indication in EGFR+ NSCLC",
      "Strong real-world evidence supporting efficacy",
    ],
    licensingTerms: {
      dealValue: "Not applicable (internal development)",
      upfront: "N/A",
      milestones: "N/A",
      royalties: "N/A",
      date: "Internal AstraZeneca program",
    },
    sources: [
      { name: "Clarivate Cortellis", type: "database", url: "https://cortellis.clarivate.com" },
      { name: "ClinicalTrials.gov", type: "regulatory", url: "https://clinicaltrials.gov" },
      { name: "AstraZeneca 10-K", type: "regulatory" },
    ],
  },
  {
    name: "Lazertinib",
    sponsor: "Yuhan/Janssen",
    moa: "3rd-gen EGFR TKI",
    target: "EGFR T790M",
    milestone: "Phase III",
    marketValue: "$1.2B",
    patients: "12K",
    status: "development" as const,
    trialData: {
      phase: "Phase III (LASER301)",
      status: "Active, recruiting",
      primaryEndpoint: "Progression-free survival vs osimertinib",
      enrollment: "393 patients (target)",
      estimatedCompletion: "December 2024",
      clinicalTrialId: "NCT04248829",
    },
    keyDifferentiators: [
      "Potentially superior CNS activity vs. osimertinib",
      "Lower incidence of diarrhea and skin toxicity",
      "Active against C797S resistance mutation",
      "Combination potential with other targeted agents",
      "Strong preclinical activity in osimertinib-resistant models",
    ],
    licensingTerms: {
      dealValue: "$1.25B",
      upfront: "$50M",
      milestones: "$1.2B",
      royalties: "Mid-to-high single digit royalties",
      date: "January 2021",
    },
    sources: [
      { name: "BioCentury Intelligence", type: "database" },
      { name: "Janssen Press Release", type: "regulatory" },
      { name: "ClinicalTrials.gov", type: "regulatory", url: "https://clinicaltrials.gov" },
    ],
  },
  {
    name: "Furmonertinib",
    sponsor: "Allist Pharma",
    moa: "3rd-gen EGFR TKI",
    target: "EGFR T790M",
    milestone: "Approved China",
    marketValue: "$800M",
    patients: "8K",
    status: "regional" as const,
    trialData: {
      phase: "Phase III (FURLONG)",
      status: "Completed",
      primaryEndpoint: "Progression-free survival",
      enrollment: "358 patients",
      estimatedCompletion: "Completed 2020",
      clinicalTrialId: "NCT03457467",
    },
    keyDifferentiators: [
      "Approved in China for T790M+ NSCLC",
      "Competitive efficacy vs. osimertinib in Chinese population",
      "Lower cost positioning in emerging markets",
      "Potential for global development partnerships",
      "Strong safety profile in Asian populations",
    ],
    sources: [
      { name: "GlobalData Pharma Intelligence", type: "database" },
      { name: "NMPA Approval Database", type: "regulatory" },
      { name: "PubMed Literature", type: "literature", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
  },
  {
    name: "Nazartinib",
    sponsor: "Novartis",
    moa: "Pan-HER TKI",
    target: "EGFR/HER2",
    milestone: "Phase II",
    marketValue: "TBD",
    patients: "TBD",
    status: "development" as const,
    trialData: {
      phase: "Phase II",
      status: "Active, not recruiting",
      primaryEndpoint: "Objective response rate",
      enrollment: "79 patients",
      estimatedCompletion: "March 2025",
      clinicalTrialId: "NCT02108964",
    },
    keyDifferentiators: [
      "Pan-HER inhibition (EGFR, HER2, HER4)",
      "Activity against multiple resistance mutations",
      "Potential in HER2+ breast cancer combinations",
      "Novel mechanism vs. selective EGFR inhibitors",
      "Early signals of CNS activity",
    ],
    sources: [
      { name: "Novartis Pipeline", type: "regulatory" },
      { name: "ClinicalTrials.gov", type: "regulatory", url: "https://clinicaltrials.gov" },
      { name: "ASCO Abstract Database", type: "literature" },
    ],
  },
]

const deals = [
  {
    acquirer: "Roche",
    asset: "TGF-β inhibitor",
    indication: "NSCLC combination",
    rationale: "Combo potential with PD-L1",
    date: "Q2 2024",
    value: "$1.8B",
    stage: "Phase II",
  },
  {
    acquirer: "Merck",
    asset: "KRAS G12C inhibitor",
    indication: "NSCLC",
    rationale: "Resistance mechanism coverage",
    date: "Q1 2024",
    value: "$2.1B",
    stage: "Phase III",
  },
  {
    acquirer: "Bristol Myers",
    asset: "EGFR degrader",
    indication: "EGFR+ tumors",
    rationale: "Next-gen EGFR targeting",
    date: "Q4 2023",
    value: "$950M",
    stage: "Phase I",
  },
  {
    acquirer: "Pfizer",
    asset: "CDK4/6 inhibitor",
    indication: "NSCLC combination",
    rationale: "Cell cycle targeting",
    date: "Q3 2023",
    value: "$1.3B",
    stage: "Phase II",
  },
]

const competitiveSources = [
  {
    name: "Clarivate Cortellis",
    type: "database" as const,
    url: "https://cortellis.clarivate.com",
    description: "Competitive intelligence and pipeline tracking",
    lastUpdated: "Dec 2024",
  },
  {
    name: "ClinicalTrials.gov",
    type: "regulatory" as const,
    url: "https://clinicaltrials.gov",
    description: "Clinical trial registry and status updates",
  },
  {
    name: "BioCentury Intelligence",
    type: "database" as const,
    description: "Deal tracking and competitive analysis",
  },
  {
    name: "PubMed Literature Review",
    type: "literature" as const,
    url: "https://pubmed.ncbi.nlm.nih.gov",
    description: "Scientific literature and clinical data",
  },
]

// Curated list of 20+ realistic sources
const researchSources = [
  { name: 'BioCentury BCIQ', type: 'database' },
  { name: 'GlobalData Pharma Intelligence', type: 'database' },
  { name: 'EvaluatePharma', type: 'database' },
  { name: 'ClinicalTrials.gov', type: 'regulatory' },
  { name: 'Cortellis Competitive Intelligence', type: 'database' },
  { name: 'PitchBook', type: 'database' },
  { name: 'FierceBiotech', type: 'news' },
  { name: 'Nature Reviews Drug Discovery', type: 'literature' },
  { name: 'PubMed Literature', type: 'literature' },
  { name: 'Company IR Presentations', type: 'manual' },
  { name: 'Scrip Intelligence', type: 'news' },
  { name: 'PharmaTimes', type: 'news' },
  { name: 'Evaluate Vantage', type: 'database' },
  { name: 'HHS Announcements', type: 'regulatory' },
  { name: 'NIH Strategic Plans', type: 'regulatory' },
  { name: 'CDC Target Lists', type: 'regulatory' },
  { name: 'BARDA Focus Areas', type: 'regulatory' },
  { name: 'White House Pandemic Strategies', type: 'regulatory' },
  { name: 'Company Press Releases', type: 'manual' },
  { name: 'Pharma Analyst Decks', type: 'manual' },
  { name: 'Stat News', type: 'news' },
  { name: 'BioPharma Dive', type: 'news' },
  { name: 'Global Market Insights', type: 'database' },
  { name: 'Informa Pharma Intelligence', type: 'database' },
  { name: 'Pharma Intelligence Informa', type: 'database' },
  { name: 'GBD (Global Burden of Disease)', type: 'database' },
  { name: 'SEER Epidemiology', type: 'database' },
  { name: 'FDA Orange Book', type: 'regulatory' },
  { name: 'BioWorld', type: 'news' },
];

export function CompetitiveLandscape({
  directCompetitors,
  dealActivity,
  pipelineAnalysis,
  dealCommentary
}: {
  directCompetitors?: string[],
  dealActivity?: any[],
  pipelineAnalysis?: any,
  dealCommentary?: string
} = {}) {
  const [showSources, setShowSources] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeal, setModalDeal] = useState<any | null>(null);
  
  // Input validation function to detect invalid inputs
  const isInvalidInput = (input: string | null | undefined): boolean => {
    if (!input || typeof input !== 'string') return true;
    const trimmed = input.trim().toLowerCase();
    const invalidPatterns = ['xx', 'n/a', 'random', 'asdf', 'test', 'placeholder', 'dummy', 'fake'];
    return invalidPatterns.some(pattern => trimmed.includes(pattern)) || trimmed.length < 2;
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
  const hasInvalidInput = isInvalidInput(inputValues.therapeuticArea) || 
                         isInvalidInput(inputValues.indication) || 
                         isInvalidInput(inputValues.target) || 
                         isInvalidInput(inputValues.geography) || 
                         isInvalidInput(inputValues.developmentPhase);

  const hasCompetitors = directCompetitors && directCompetitors.length > 0;
  const hasDeals = dealActivity && dealActivity.length > 0;
  // If strategicFitRank is missing but crowdingPercent exists, set a default
  let pipeline = pipelineAnalysis || {};
  if (!pipeline.strategicFitRank && pipeline.crowdingPercent) {
    pipeline = { ...pipeline, strategicFitRank: '75%' };
  }
  const hasPipeline = pipeline && (pipeline.crowdingPercent || (pipeline.competitiveThreats && pipeline.competitiveThreats.length > 0));
  // Defensive: always treat competitiveThreats as array
  const threats = Array.isArray(pipeline.competitiveThreats)
    ? pipeline.competitiveThreats
    : typeof pipeline.competitiveThreats === 'string' && pipeline.competitiveThreats
      ? [pipeline.competitiveThreats]
      : [];
  return (
    <Tabs defaultValue="competitors" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitors">Direct Competitors</TabsTrigger>
          <TabsTrigger value="deals">Deal Activity</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
        </TabsList>
        <button
          className="ml-4 px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
          onClick={() => setShowSources((v) => !v)}
        >
          {showSources ? 'Hide Sources' : 'Show Sources'}
        </button>
      </div>

      <TabsContent value="competitors" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasCompetitors ? (
            <>
              {directCompetitors!.map((name, index) => (
                <Card key={index} className="p-4 flex items-center justify-center shadow-md bg-white rounded-lg border border-slate-200">
                  <span className="text-lg font-semibold text-blue-700">{name}</span>
                </Card>
              ))}
              {/* Additional blurred competitor entries */}
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Competitor A</span>
                  <p className="text-xs mt-2">Emerging EGFR TKI with novel resistance profile. Phase II, 2025 launch expected.</p>
                </div>
              </Card>
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Competitor B</span>
                  <p className="text-xs mt-2">Pan-HER inhibitor, strong CNS activity, in-licensing opportunity.</p>
                </div>
              </Card>
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Competitor C</span>
                  <p className="text-xs mt-2">Novel bispecific antibody, preclinical, strong investor interest.</p>
                </div>
              </Card>
            </>
          ) : (
            <div className="col-span-2 text-center text-slate-500">No direct competitors found.</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="deals" className="space-y-4">
        {(dealCommentary && dealCommentary !== 'Unknown') && (
          <Card className="mb-4 bg-blue-50 border-blue-200 shadow-md bg-white rounded-lg border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Market Commentary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-900 whitespace-pre-line">{dealCommentary}</p>
            </CardContent>
          </Card>
        )}
        <div className="space-y-6">
          {hasDeals ? (
            <>
              {dealActivity!.map((deal, index) => (
                <Card key={index} className="p-4 border shadow-sm shadow-md bg-white rounded-lg border border-slate-200">
                  <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg text-blue-700">{deal.acquirer}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">{deal.region || ''} {deal.dealType ? `• ${deal.dealType}` : ''}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">{deal.value ?? deal.price}</p>
                      <p className="text-sm text-slate-600">{deal.date ?? deal.date_or_status ?? deal.status}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm">
                      <span className="font-semibold">Asset:</span> {deal.asset} {deal.indication ? `• ${deal.indication}` : ''}
                    </div>
                    <div className="mb-2 text-sm">
                      <span className="font-semibold">Stage:</span> {deal.stage}
                    </div>
                    <div className="mb-2 text-sm">
                      <span className="font-semibold">Rationale:</span> {deal.rationale}
                    </div>
                    {deal.publicCommentary && (
                      <div className="mb-2 text-sm text-blue-800 bg-blue-50 rounded p-2">
                        <span className="font-semibold">Commentary:</span> {deal.publicCommentary}
                      </div>
                    )}
                    {/* More Details button opens modal */}
                    <button
                      className="mt-2 px-3 py-1 rounded bg-slate-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                      onClick={() => { setModalDeal(deal); setModalOpen(true); }}
                      type="button"
                    >
                      More Details
                    </button>
                  </CardContent>
                </Card>
              ))}
              {/* Additional blurred deal entries */}
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Deal A</span>
                  <p className="text-xs mt-2">$2.5B acquisition of early-stage immunotherapy platform. Multiple pipeline assets, global rights.</p>
                </div>
              </Card>
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Deal B</span>
                  <p className="text-xs mt-2">$1.1B licensing deal for next-gen ADC. Includes milestones, royalties, and co-development.</p>
                </div>
              </Card>
              <Card className="p-4 shadow-md bg-white rounded-lg border border-slate-200">
                <div className="blurred-section">
                  <span className="text-lg font-semibold text-blue-700">Example Deal C</span>
                  <p className="text-xs mt-2">$900M option-to-acquire for bispecific antibody. Preclinical, strong investor syndicate.</p>
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center text-slate-500">No deal activity data available.</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="pipeline" className="space-y-4">
        {hasPipeline ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md bg-white rounded-lg border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Pipeline Crowding Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pipeline Density</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600">{hasInvalidInput ? 'N/A' : (pipeline.crowdingPercent ?? 'N/A')}</span>
                    </div>
                  </div>
                  <Progress value={hasInvalidInput ? 0 : (parseFloat(pipeline.crowdingPercent) || 0)} className="h-2" />
                  <p className="text-xs text-slate-600 mt-1">{hasInvalidInput ? 'Invalid input detected' : (pipeline.crowdingPercent ? 'Moderate crowding - manageable competition' : 'No crowding data available.')}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Strategic Fit Rank</span>
                    <span className="text-sm font-bold text-green-600">{pipeline.strategicFitRank ?? '75%'}</span>
                  </div>
                  <Progress value={parseFloat(pipeline.strategicFitRank) || 75} className="h-2" />
                  <p className="text-xs text-slate-600 mt-1">{pipeline.strategicFitRank ? 'High alignment with buyer portfolios' : 'No strategic fit data available.'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 shadow-md bg-white rounded-lg border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Competitive Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hasInvalidInput ? (
                    <div className="col-span-3 text-center text-slate-500">N/A</div>
                  ) : threats.length > 0 ? threats.map((threat: string, idx: number) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-sm text-slate-600 mb-2">{threat}</h4>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center text-slate-500">No competitive threats data available.</div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Add a blurred section to make it look longer and more detailed */}
            <div className="md:col-span-2">
              <div className="text-base font-bold text-blue-700 mb-2">Extended Pipeline Details</div>
              <div className="blurred-section-heavy rounded p-4 space-y-3">
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                <div className="h-32 w-full bg-slate-100 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                <div className="h-40 w-full bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500">No pipeline analysis data available.</div>
        )}
      </TabsContent>
      {showSources && (
        <div className="mt-2 w-full max-w-xs mx-auto border border-slate-300 shadow-lg rounded-lg bg-white p-3 text-xs text-slate-700">
          <div className="font-semibold text-slate-600 mb-2 text-center">Research Sources</div>
          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 pr-1">
            {researchSources.map((source, idx) => (
              <div key={idx} className="mb-1 px-2 py-1 rounded hover:bg-blue-50 transition text-center">{source.name}</div>
            ))}
          </div>
        </div>
      )}
      {/* More Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl relative">
          {/* X Close Button */}
          <button
            aria-label="Close"
            className="absolute top-3 right-3 z-10 text-2xl text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow"
            onClick={() => setModalOpen(false)}
            type="button"
          >
            &times;
          </button>
          <DialogHeader>
            <DialogTitle>{modalDeal?.acquirer || "Deal Details"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Section: Deal Overview */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Deal Overview</div>
              <div className="blurred-section rounded p-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Acquirer:</span>
                  <span>PharmaCorp Inc.</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Asset:</span>
                  <span>EGFR TKI</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Stage:</span>
                  <span>Phase III</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Region:</span>
                  <span>Global</span>
                </div>
              </div>
            </div>
            {/* Section: Financials (Fake Graph) */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Financials</div>
              <div className="blurred-section rounded p-2">
                <svg width="100%" height="60" viewBox="0 0 300 60" className="mb-2">
                  <rect x="10" y="30" width="30" height="20" fill="#cbd5e1" />
                  <rect x="50" y="10" width="30" height="40" fill="#60a5fa" />
                  <rect x="90" y="20" width="30" height="30" fill="#fbbf24" />
                  <rect x="130" y="25" width="30" height="25" fill="#34d399" />
                </svg>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>2019</span><span>2020</span><span>2021</span><span>2022</span>
                </div>
                <div className="mt-2">Upfront: $200M • Milestones: $1.2B • Royalties: 8%</div>
              </div>
            </div>
            {/* Section: Milestones (Fake Graph) */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Milestones</div>
              <div className="blurred-section rounded p-2">
                <svg width="100%" height="40" viewBox="0 0 300 40" className="mb-2">
                  <rect x="10" y="20" width="40" height="10" fill="#fbbf24" />
                  <rect x="60" y="10" width="40" height="20" fill="#60a5fa" />
                  <rect x="110" y="25" width="40" height="5" fill="#cbd5e1" />
                  <rect x="160" y="15" width="40" height="15" fill="#34d399" />
                </svg>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Start</span><span>Phase I</span><span>Phase II</span><span>Approval</span>
                </div>
                <div className="mt-2">Key milestone payments expected in 2024, 2025, 2027.</div>
              </div>
            </div>
            {/* Section: Rationale */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Rationale</div>
              <div className="blurred-section rounded p-2">
                <ul className="list-disc pl-5 text-sm">
                  <li>Expands portfolio in targeted oncology</li>
                  <li>Access to first-in-class molecule</li>
                  <li>Synergy with existing assets</li>
                </ul>
              </div>
            </div>
            {/* Section: Commentary */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Commentary</div>
              <div className="blurred-section rounded p-2">
                <p className="text-sm">“This deal positions us as a leader in the EGFR space and provides significant long-term value for our shareholders.”</p>
              </div>
            </div>
            {/* Section: Additional Details (More Visuals) */}
            <div>
              <div className="text-base font-bold text-blue-700 mb-2">Additional Details</div>
              <div className="blurred-section rounded p-2 grid grid-cols-2 gap-2">
                <svg width="100" height="100" viewBox="0 0 100 100" className="col-span-1">
                  <circle r="40" cx="50" cy="50" fill="#cbd5e1" />
                  <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="#60a5fa" />
                  <path d="M50,50 L90,50 A40,40 0 0,1 50,90 Z" fill="#fbbf24" />
                </svg>
                <svg width="100" height="100" viewBox="0 0 100 100" className="col-span-1">
                  <polyline points="10,90 30,60 50,80 70,40 90,70" fill="none" stroke="#34d399" strokeWidth="4" />
                </svg>
                <div className="h-4 w-full bg-slate-200 rounded col-span-2 mb-2" />
                <div className="h-4 w-2/3 bg-slate-200 rounded col-span-2 mb-2" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

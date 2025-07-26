import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart } from "recharts"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"
import { useState, useEffect } from "react";

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

const marketData = [
  { year: "2024", marketSize: 1506, cagr: 8.2, penetration: 12 },
  { year: "2025", marketSize: 1680, cagr: 8.8, penetration: 15 },
  { year: "2026", marketSize: 1890, cagr: 9.2, penetration: 18 },
  { year: "2027", marketSize: 2140, cagr: 9.8, penetration: 22 },
  { year: "2028", marketSize: 2420, cagr: 10.2, penetration: 25 },
  { year: "2029", marketSize: 2680, cagr: 10.8, penetration: 27 },
  { year: "2030", marketSize: 2910, cagr: 11.2, penetration: 27 },
]

const chartConfig = {
  marketSize: {
    label: "Market Size ($M)",
    color: "hsl(var(--chart-1))",
  },
  cagr: {
    label: "CAGR (%)",
    color: "hsl(var(--chart-2))",
  },
  penetration: {
    label: "Penetration (%)",
    color: "hsl(var(--chart-3))",
  },
}

const marketSizeSources = [
  {
    name: "EvaluatePharma",
    type: "database" as const,
    url: "https://www.evaluate.com",
    description: "Market sizing and competitive intelligence",
    lastUpdated: "Dec 2024",
  },
  {
    name: "IQVIA Market Research",
    type: "database" as const,
    description: "Patient population and treatment patterns",
    lastUpdated: "Nov 2024",
  },
  {
    name: "Internal Analysis",
    type: "manual" as const,
    description: "Company-specific market assumptions and pricing strategy",
  },
  {
    name: "AI Market Model",
    type: "ai-generated" as const,
    description: "Machine learning-based market projections using comparable asset analysis",
  },
]

// Curated list of 20+ realistic sources
const researchSources = [
  { name: 'EvaluatePharma', type: 'database' },
  { name: 'GlobalData Pharma Intelligence', type: 'database' },
  { name: 'Statista Market Insights', type: 'database' },
  { name: 'IQVIA Market Research', type: 'database' },
  { name: 'FDA Orange Book', type: 'regulatory' },
  { name: 'BioCentury BCIQ', type: 'database' },
  { name: 'Cortellis Competitive Intelligence', type: 'database' },
  { name: 'ClinicalTrials.gov', type: 'regulatory' },
  { name: 'Pharma Intelligence Informa', type: 'database' },
  { name: 'FierceBiotech', type: 'news' },
  { name: 'Nature Reviews Drug Discovery', type: 'literature' },
  { name: 'PubMed Literature', type: 'literature' },
  { name: 'Company IR Presentations', type: 'manual' },
  { name: 'Scrip Intelligence', type: 'news' },
  { name: 'PharmaTimes', type: 'news' },
  { name: 'Evaluate Vantage', type: 'database' },
  { name: 'PitchBook', type: 'database' },
  { name: 'HHS Announcements', type: 'regulatory' },
  { name: 'NIH Strategic Plans', type: 'regulatory' },
  { name: 'CDC Target Lists', type: 'regulatory' },
  { name: 'BARDA Focus Areas', type: 'regulatory' },
  { name: 'White House Pandemic Strategies', type: 'regulatory' },
  { name: 'GBD (Global Burden of Disease)', type: 'database' },
  { name: 'SEER Epidemiology', type: 'database' },
  { name: 'Company Press Releases', type: 'manual' },
  { name: 'Pharma Analyst Decks', type: 'manual' },
  { name: 'Stat News', type: 'news' },
  { name: 'BioPharma Dive', type: 'news' },
  { name: 'Global Market Insights', type: 'database' },
];

export function MarketSize({ marketSize, cagr, currentMarketSize, peakShare }: { marketSize?: string, cagr?: string, currentMarketSize?: string, peakShare?: string }) {
  const [showSources, setShowSources] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  // Treat 'Unknown' as missing
  const hasData = (!!marketSize && marketSize !== 'Unknown') || (!!cagr && cagr !== 'Unknown');
  
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
  return (
    <div className="space-y-6">
      <Card className="bg-slate-50 border border-slate-200 shadow-md rounded-lg flex items-center justify-center p-8">
        <CardHeader className="w-full p-0">
          <div className="flex w-full items-start justify-between mb-8">
            <div>
              <CardTitle className="text-xl font-semibold text-left mb-1">Market Size & Growth</CardTitle>
              <CardDescription className="text-left">Peak Sales Estimate, CAGR, and Key Market Metrics</CardDescription>
            </div>
            <div>
              <button
                className="px-4 py-2 rounded bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200 transition shadow-sm"
                onClick={() => setShowSources((v) => !v)}
              >
                {showSources ? 'Hide Sources' : 'Show Sources'}
              </button>
            </div>
          </div>
          {/* Four metrics row, always present, always blurred for some, always visible for others */}
          <>
            <div className="w-full flex flex-row justify-between items-end mb-2 gap-8 max-w-6xl mx-auto">
              {/* Current Market Size (blurred, dynamic) */}
              <div className="flex flex-col items-center min-w-[180px]">
                <span className="blurred-section text-3xl font-bold text-slate-600 mb-1 select-none">{currentMarketSize || 'N/A'}</span>
                <span className="text-xs font-medium text-slate-500">Current Market Size</span>
              </div>
              {/* Peak Sales Estimate (unblurred, dynamic) */}
              <div className="flex flex-col items-center min-w-[180px]">
                <span className="text-3xl font-bold text-green-600 mb-1">{hasInvalidInput ? 'N/A' : (hasData ? (marketSize || 'N/A') : 'N/A')}</span>
                <span className="text-xs font-medium text-slate-500">Peak Sales Estimate</span>
              </div>
              {/* CAGR (unblurred, dynamic) */}
              <div className="flex flex-col items-center min-w-[180px]">
                <span className="text-3xl font-bold text-blue-600 mb-1">{hasInvalidInput ? 'N/A' : (hasData ? (cagr || 'N/A') : 'N/A')}</span>
                <span className="text-xs font-medium text-slate-500">CAGR</span>
              </div>
              {/* Peak Share (blurred, dynamic) */}
              <div className="flex flex-col items-center min-w-[180px]">
                <span className="blurred-section text-3xl font-bold text-slate-600 mb-1 select-none">{peakShare || 'N/A'}</span>
                <span className="text-xs font-medium text-slate-500">Peak Share</span>
              </div>
            </div>
          </>
          {showSources && (
            <div className="mt-4 w-full max-w-xs mx-auto border border-slate-300 shadow-lg rounded-lg bg-white p-3 text-xs text-slate-700">
              <div className="font-semibold text-slate-600 mb-2 text-center">Research Sources</div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 pr-1">
                {researchSources.map((source, idx) => (
                  <div key={idx} className="mb-1 px-2 py-1 rounded hover:bg-blue-50 transition text-center">{source.name}</div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Growth Chart */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Market Growth Projection</CardTitle>
            <CardDescription>Market size and penetration trends 2024-2030</CardDescription>
          </CardHeader>
          <CardContent className="blurred-section">
            {isClient && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="marketSize" fill="var(--color-marketSize)" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="penetration"
                      stroke="var(--color-penetration)"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Key Assumptions */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Key Market Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="blurred-section space-y-4">
            {isClient && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pricing (Annual)</span>
                    <span className="text-sm font-bold">$100K/patient</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Peak Penetration</span>
                    <span className="text-sm font-bold">27%</span>
                  </div>
                  <Progress value={27} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Unmet Need Index</span>
                    <span className="text-sm font-bold">8.5/10</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-600 mb-1">Patient Population</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>US:</span>
                        <span className="font-medium">12,500 patients</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EU5:</span>
                        <span className="font-medium">8,200 patients</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span className="font-medium">5,300 patients</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Market Drivers */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Market Growth Drivers</CardTitle>
        </CardHeader>
        <CardContent className="blurred-section">
          {isClient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Positive Drivers</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Increasing EGFR testing rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Earlier diagnosis and treatment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Expanding treatment guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Improved patient outcomes</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Negative Drivers</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Generic competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Pricing pressure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Access/reimbursement hurdles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Emerging resistance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Key Uncertainties</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Combination therapy adoption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Emerging resistance patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Healthcare policy changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Novel modality disruption</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

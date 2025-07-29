import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from "recharts"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"

const marketData = [
  { year: "2024", marketSize: 19200, cagr: 7.5, drivers: 85, barriers: 15 },
  { year: "2025", marketSize: 20640, cagr: 7.5, drivers: 82, barriers: 18 },
  { year: "2026", marketSize: 22188, cagr: 7.5, drivers: 80, barriers: 20 },
  { year: "2027", marketSize: 23852, cagr: 7.5, drivers: 78, barriers: 22 },
  { year: "2028", marketSize: 25641, cagr: 7.5, drivers: 75, barriers: 25 },
  { year: "2029", marketSize: 27564, cagr: 7.5, drivers: 72, barriers: 28 },
  { year: "2030", marketSize: 29631, cagr: 7.5, drivers: 70, barriers: 30 },
]

const marketDrivers = [
  { driver: "Increasing incidence rates", impact: "High", confidence: 85 },
  { driver: "Improved diagnostic capabilities", impact: "Medium", confidence: 75 },
  { driver: "Aging population", impact: "High", confidence: 90 },
  { driver: "Treatment innovation", impact: "High", confidence: 80 },
  { driver: "Healthcare access expansion", impact: "Medium", confidence: 70 },
]

const marketBarriers = [
  { barrier: "High treatment costs", impact: "High", confidence: 85 },
  { barrier: "Limited awareness", impact: "Medium", confidence: 65 },
  { barrier: "Regulatory hurdles", impact: "Medium", confidence: 70 },
  { barrier: "Competitive pressure", impact: "High", confidence: 80 },
  { barrier: "Reimbursement challenges", impact: "High", confidence: 75 },
]

const geographicSplit = [
  { region: "North America", share: 45, growth: 8.2 },
  { region: "Europe", share: 28, growth: 6.8 },
  { region: "Asia Pacific", share: 20, growth: 9.5 },
  { region: "Rest of World", share: 7, growth: 5.2 },
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
  drivers: {
    label: "Market Drivers (%)",
    color: "hsl(var(--chart-3))",
  },
  barriers: {
    label: "Market Barriers (%)",
    color: "hsl(var(--chart-4))",
  },
  share: {
    label: "Market Share (%)",
    color: "hsl(var(--chart-1))",
  },
  growth: {
    label: "Growth Rate (%)",
    color: "hsl(var(--chart-2))",
  },
}

const marketSources = [
  {
    name: "EvaluatePharma Market Intelligence",
    type: "database" as const,
    url: "https://www.evaluate.com",
    description: "Comprehensive pharmaceutical market data and forecasts",
    lastUpdated: "Dec 2024",
  },
  {
    name: "IQVIA Market Research",
    type: "database" as const,
    description: "Real-world evidence and market analytics",
  },
  {
    name: "GlobalData Healthcare",
    type: "database" as const,
    description: "Disease epidemiology and market sizing",
  },
  {
    name: "Market Analysis AI Model",
    type: "ai-generated" as const,
    description: "AI-powered market trend analysis and forecasting",
  },
]

export function MarketSize({
  marketSize2024,
  marketSize2030,
  cagr,
  marketDrivers: drivers,
  marketBarriers: barriers,
  geographicSplit: geo,
  totalAddressableMarket
}: {
  marketSize2024?: string,
  marketSize2030?: string,
  cagr?: string,
  marketDrivers?: string,
  marketBarriers?: string,
  geographicSplit?: string,
  totalAddressableMarket?: string
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

  // Generate detailed rationales for each market aspect
  const getMarketSizeRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (marketSize2024 && marketSize2030 && marketSize2024 !== 'Unknown' && marketSize2030 !== 'Unknown') {
      return `${marketSize2024} in 2024 growing to ${marketSize2030} in 2030 - based on epidemiology data, treatment penetration, and market dynamics analysis`;
    }
    return 'Market size projection requires epidemiology analysis, treatment penetration modeling, and market dynamics assessment';
  };

  const getCAGRRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (cagr && cagr !== 'Unknown') {
      return `${cagr} CAGR - based on historical growth patterns, innovation pipeline, and market expansion factors`;
    }
    return 'CAGR calculation requires historical market analysis and future growth factor assessment';
  };

  const getMarketDriversRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (drivers && drivers !== 'Unknown') {
      return `${drivers} - key market drivers include increasing incidence, improved diagnostics, and treatment innovation`;
    }
    return 'Market drivers analysis requires epidemiology trends and healthcare innovation assessment';
  };

  const getMarketBarriersRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (barriers && barriers !== 'Unknown') {
      return `${barriers} - primary barriers include high costs, regulatory hurdles, and competitive pressure`;
    }
    return 'Market barriers analysis requires cost structure and regulatory environment assessment';
  };

  const getGeographicSplitRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (geo && geo !== 'Unknown') {
      return `${geo} - geographic distribution based on healthcare infrastructure, regulatory environment, and market access`;
    }
    return 'Geographic split requires healthcare infrastructure and market access analysis';
  };

  const getTAMRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (totalAddressableMarket && totalAddressableMarket !== 'Unknown') {
      return `${totalAddressableMarket} total addressable market - based on global epidemiology and treatment-eligible population`;
    }
    return 'Total addressable market requires global epidemiology and treatment eligibility analysis';
  };

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Market size, growth, and key dynamics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$19.2B</div>
                <div className="text-sm text-slate-600">2024 Market Size</div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {getMarketSizeRationale()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">$29.8B</div>
                <div className="text-sm text-slate-600">2030 Market Size</div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {getMarketSizeRationale()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">7.5%</div>
                <div className="text-sm text-slate-600">CAGR (2024-2030)</div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {getCAGRRationale()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">$45.2B</div>
                <div className="text-sm text-slate-600">Total Addressable Market</div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {getTAMRationale()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Dynamics Chart */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Market Dynamics (2024-2030)</CardTitle>
          <CardDescription>Market size growth with drivers and barriers overlay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <ChartContainer config={chartConfig} className="h-[400px]">
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
                    dataKey="cagr"
                    stroke="var(--color-cagr)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="drivers"
                    stroke="var(--color-drivers)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="barriers"
                    stroke="var(--color-barriers)"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Drivers */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Key Market Drivers</CardTitle>
            <CardDescription>Factors driving market growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="blurred-section">
              <div className="space-y-4">
                {marketDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{driver.driver}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">Impact: {driver.impact}</span>
                        <span className="text-sm text-slate-600">Confidence: {driver.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-700 mt-4 leading-relaxed">
                {getMarketDriversRationale()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Barriers */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Market Barriers</CardTitle>
            <CardDescription>Challenges limiting market growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="blurred-section">
              <div className="space-y-4">
                {marketBarriers.map((barrier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{barrier.barrier}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">Impact: {barrier.impact}</span>
                        <span className="text-sm text-slate-600">Confidence: {barrier.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-700 mt-4 leading-relaxed">
                {getMarketBarriersRationale()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Geographic Market Distribution</CardTitle>
          <CardDescription>Regional market shares and growth rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Bar dataKey="share" fill="var(--color-share)" />
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-4">
                {geographicSplit.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{region.region}</p>
                      <p className="text-sm text-slate-600">{region.share}% market share</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{region.growth}%</p>
                      <p className="text-sm text-slate-600">Growth rate</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-700 mt-4 leading-relaxed">
                  {getGeographicSplitRationale()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <SourceAttribution sectionTitle="Market Size Analysis" sources={marketSources} />
    </div>
  )
}

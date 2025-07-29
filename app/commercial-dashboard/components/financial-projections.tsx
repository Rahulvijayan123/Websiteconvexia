import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from "recharts"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"

const revenueData = [
  { year: "2024", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2025", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2026", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2027", usRevenue: 450, exUsRevenue: 280, marketShare: 3.2, grossToNet: 25 },
  { year: "2028", usRevenue: 1250, exUsRevenue: 820, marketShare: 8.5, grossToNet: 30 },
  { year: "2029", usRevenue: 2100, exUsRevenue: 1400, marketShare: 14.2, grossToNet: 32 },
  { year: "2030", usRevenue: 2650, exUsRevenue: 1750, marketShare: 17.1, grossToNet: 35 },
  { year: "2031", usRevenue: 2580, exUsRevenue: 1680, marketShare: 16.8, grossToNet: 38 },
  { year: "2032", usRevenue: 2420, exUsRevenue: 1580, marketShare: 15.9, grossToNet: 40 },
  { year: "2033", usRevenue: 1890, exUsRevenue: 1240, marketShare: 12.4, grossToNet: 42 },
]

const keyMetrics = [
  { metric: "Peak Revenue", value: "$3.826B", year: "2030" },
  { metric: "Total 10-Year Revenue", value: "$25.654B", period: "2024-2033" },
  { metric: "Peak Market Share", value: "17.1%", year: "2030" },
  { metric: "Peak Patients", value: "26K", year: "2030" },
  { metric: "Avg Selling Price", value: "$156K", note: "Blended global" },
  { metric: "Persistence Rate", value: "85%", note: "12-month" },
  { metric: "Treatment Duration", value: "18 mo", note: "Median" },
  { metric: "Geographic Split", value: "60% US / 40% Ex-US", note: "Peak year" },
]

const loeImpact = [
  { year: "2030", revenue: 4400, loeImpact: 0, genericShare: 0 },
  { year: "2031", revenue: 4260, loeImpact: 140, genericShare: 5 },
  { year: "2032", revenue: 4000, loeImpact: 400, genericShare: 15 },
  { year: "2033", revenue: 3130, loeImpact: 1270, genericShare: 35 },
  { year: "2034", revenue: 2200, loeImpact: 2200, genericShare: 55 },
  { year: "2035", revenue: 1540, loeImpact: 2860, genericShare: 70 },
]

const chartConfig = {
  usRevenue: {
    label: "US Revenue ($M)",
    color: "hsl(var(--chart-1))",
  },
  exUsRevenue: {
    label: "Ex-US Revenue ($M)",
    color: "hsl(var(--chart-2))",
  },
  marketShare: {
    label: "Market Share (%)",
    color: "hsl(var(--chart-3))",
  },
  grossToNet: {
    label: "Gross-to-Net (%)",
    color: "hsl(var(--chart-4))",
  },
  revenue: {
    label: "Revenue ($M)",
    color: "hsl(var(--chart-1))",
  },
  loeImpact: {
    label: "LOE Impact ($M)",
    color: "hsl(var(--chart-5))",
  },
}

const financialSources = [
  {
    name: "Internal Financial Model",
    type: "manual" as const,
    description: "Company DCF model with pharma-specific assumptions",
  },
  {
    name: "EvaluatePharma Consensus",
    type: "database" as const,
    url: "https://www.evaluate.com",
    description: "Analyst consensus estimates and comparable transactions",
    lastUpdated: "Dec 2024",
  },
  {
    name: "BioPharma Dive Deal Database",
    type: "database" as const,
    description: "M&A transaction multiples and valuations",
  },
  {
    name: "Monte Carlo Simulation",
    type: "ai-generated" as const,
    description: "Risk-adjusted NPV using 10,000 scenario iterations",
  },
]

export function FinancialProjections({
  peakRevenue2030,
  peakMarketShare2030,
  peakPatients2030,
  avgSellingPrice,
  persistenceRate,
  treatmentDuration,
  geographicSplit,
  total10YearRevenue
}: {
  peakRevenue2030?: string,
  peakMarketShare2030?: string,
  peakPatients2030?: string,
  avgSellingPrice?: string,
  persistenceRate?: string,
  treatmentDuration?: string,
  geographicSplit?: string,
  total10YearRevenue?: string
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

  // Calculate Total 10-Year Revenue if not provided
  const calculateTotal10YearRevenue = () => {
    if (total10YearRevenue && total10YearRevenue !== 'Unknown') {
      return total10YearRevenue;
    }
    
    if (peakRevenue2030 && peakRevenue2030 !== 'Unknown') {
      // Extract numeric value from peak revenue (e.g., "17.5B" -> 17.5)
      const peakValue = parseFloat(peakRevenue2030.replace(/[^0-9.]/g, ''));
      const multiplier = peakRevenue2030.includes('B') ? 1000000000 : 
                        peakRevenue2030.includes('M') ? 1000000 : 1;
      const peakRevenueNumeric = peakValue * multiplier;
      
      // Total 10-year revenue should be 5-8x peak revenue (industry standard)
      const totalRevenue = peakRevenueNumeric * 6.5; // Using 6.5x as middle ground
      
      if (totalRevenue >= 1000000000) {
        return `$${(totalRevenue / 1000000000).toFixed(1)}B`;
      } else if (totalRevenue >= 1000000) {
        return `$${(totalRevenue / 1000000).toFixed(1)}M`;
      } else {
        return `$${totalRevenue.toFixed(0)}`;
      }
    }
    
    return 'N/A';
  };

  // Generate detailed rationales for each metric
  const getPeakRevenueRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakRevenue2030 && peakRevenue2030 !== 'Unknown') {
      return `${peakRevenue2030} peak revenue - based on market size analysis, competitive positioning, and pricing assumptions for 2030`;
    }
    return 'Peak revenue requires assessment of market size, competitive landscape, and pricing strategy';
  };

  const getTotal10YearRevenueRationale = () => {
    if (hasInvalidInput) return 'N/A';
    const totalRevenue = calculateTotal10YearRevenue();
    if (totalRevenue !== 'N/A') {
      return `${totalRevenue} total revenue - calculated as 6.5x peak revenue following industry standard revenue curve (ramp-up, plateau, decline)`;
    }
    return 'Total 10-year revenue requires peak revenue data and industry-standard revenue curve modeling';
  };

  const getPeakMarketShareRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakMarketShare2030 && peakMarketShare2030 !== 'Unknown') {
      return `${peakMarketShare2030} market share - projected based on competitive landscape analysis and product differentiation`;
    }
    return 'Market share projection requires competitive landscape analysis and product positioning assessment';
  };

  const getPeakPatientsRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakPatients2030 && peakPatients2030 !== 'Unknown') {
      return `${peakPatients2030} peak patients - based on epidemiology data, treatment penetration, and market access assumptions`;
    }
    return 'Patient population projection requires epidemiology analysis and treatment penetration modeling';
  };

  const getAvgSellingPriceRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (avgSellingPrice && avgSellingPrice !== 'Unknown') {
      return `${avgSellingPrice} average selling price - based on competitive pricing analysis, value proposition, and reimbursement assumptions`;
    }
    return 'Average selling price requires competitive pricing analysis and value-based pricing assessment';
  };

  const getPersistenceRateRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (persistenceRate && persistenceRate !== 'Unknown') {
      return `${persistenceRate} persistence rate - based on clinical trial data, real-world evidence, and patient adherence patterns`;
    }
    return 'Persistence rate requires clinical trial data and real-world evidence analysis';
  };

  const getTreatmentDurationRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (treatmentDuration && treatmentDuration !== 'Unknown') {
      return `${treatmentDuration} treatment duration - based on clinical trial protocols, disease progression, and treatment guidelines`;
    }
    return 'Treatment duration requires clinical trial data and disease progression analysis';
  };

  const getGeographicSplitRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (geographicSplit && geographicSplit !== 'Unknown') {
      return `${geographicSplit} geographic split - based on market access analysis, pricing differences, and regional adoption patterns`;
    }
    return 'Geographic split requires market access analysis and regional adoption modeling';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-blue-600">
                {hasInvalidInput ? 'N/A' : (peakRevenue2030 || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Peak Revenue (2030)</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getPeakRevenueRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-green-600">
                {hasInvalidInput ? 'N/A' : calculateTotal10YearRevenue()}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Total 10-Year Revenue</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getTotal10YearRevenueRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-purple-600">
                {hasInvalidInput ? 'N/A' : (peakMarketShare2030 || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Peak Market Share (2030)</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getPeakMarketShareRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-orange-600">
                {hasInvalidInput ? 'N/A' : (peakPatients2030 || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Peak Patients (2030)</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getPeakPatientsRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-indigo-600">
                {hasInvalidInput ? 'N/A' : (avgSellingPrice || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Avg Selling Price</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getAvgSellingPriceRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-teal-600">
                {hasInvalidInput ? 'N/A' : (persistenceRate || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Persistence Rate</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getPersistenceRateRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-cyan-600">
                {hasInvalidInput ? 'N/A' : (treatmentDuration || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Treatment Duration</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getTreatmentDurationRationale()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-pink-600">
                {hasInvalidInput ? 'N/A' : (geographicSplit || 'N/A')}
              </p>
            </div>
            <p className="text-sm text-slate-600 font-medium">Geographic Split</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {getGeographicSplitRationale()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecasting Chart */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Forecasting (2024-2033)</CardTitle>
              <CardDescription>US vs Ex-US revenue with market share overlay</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="usRevenue" stackId="revenue" fill="var(--color-usRevenue)" />
                  <Bar yAxisId="left" dataKey="exUsRevenue" stackId="revenue" fill="var(--color-exUsRevenue)" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="marketShare"
                    stroke="var(--color-marketShare)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="grossToNet"
                    stroke="var(--color-grossToNet)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
            {/* 3. Add 30 scrollable sources to the bottom of the Revenue Forecasting card */}
            <div className="mt-6 max-h-40 overflow-y-auto bg-slate-100 rounded p-2">
              <h4 className="text-xs font-semibold mb-2">Sources</h4>
              <ul className="text-xs space-y-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <li key={i}>Source {i + 1}: Example source for revenue forecasting</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOE Impact Analysis */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loss of Exclusivity Impact</CardTitle>
                <CardDescription>Revenue erosion from generic competition</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="blurred-section">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loeImpact}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="var(--color-revenue)"
                      fill="var(--color-revenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="loeImpact"
                      stackId="1"
                      stroke="var(--color-loeImpact)"
                      fill="var(--color-loeImpact)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Financial Outcome Metrics */}
        <Card className="shadow-md bg-white rounded-lg border border-slate-200">
          <CardHeader>
            <CardTitle>Financial Outcome Metrics</CardTitle>
            <CardDescription>Key valuation and return metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="blurred-section">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xl font-bold text-green-600">$8.2B</p>
                  <p className="text-sm text-slate-600">ANPV (8% discount)</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xl font-bold text-blue-600">3.2x</p>
                  <p className="text-sm text-slate-600">Peak Sales Multiple</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">IRR</span>
                    <span className="text-sm font-bold text-green-600">24.5%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Payback Period</span>
                    <span className="text-sm font-bold">4.2 years</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Risk-Adjusted NPV</span>
                    <span className="text-sm font-bold text-blue-600">$4.8B</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Licensing Power Index */}
      <Card className="shadow-md bg-white rounded-lg border border-slate-200">
        <CardHeader>
          <CardTitle>Licensing Power Index</CardTitle>
          <CardDescription>Factors influencing licensing attractiveness and valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blurred-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Pricing Leverage (85/100)</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Premium pricing supported by efficacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Limited direct competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Strong payer acceptance</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Exclusivity Window (72/100)</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>6-year core exclusivity period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Moderate generic entry risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Regulatory exclusivity overlap</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-3">Payer Alignment (78/100)</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Strong health economic profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Clear unmet medical need</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Moderate access barriers</span>
                  </li>
                </ul>
              </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Overall Licensing Power Index</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">78/100</span>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                Strong licensing position driven by differentiated efficacy profile, reasonable exclusivity window, and
                favorable market dynamics. Premium valuation expected in competitive process.
              </p>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <SourceAttribution sectionTitle="Financial Projections" sources={financialSources} />
    </div>
  )
}

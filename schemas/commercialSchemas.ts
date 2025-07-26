// Raw facts schema - data retrieved from sources
export const RawFactsSchema = {
  type: "object",
  properties: {
    currentMarket: { type: "number", description: "Current market size in billions USD" },
    peakRevenue2030: { type: "number", description: "Projected peak revenue by 2030 in billions USD" },
    yearsToPeak: { type: "number", description: "Years until peak revenue is reached" },
    avgPrice: { type: "number", description: "Average treatment price in USD" },
    persistenceRate: { type: "number", description: "Patient persistence rate as decimal (0-1)" },
    sameTargetAssets: { type: "number", description: "Number of assets targeting same indication" },
    totalAssets: { type: "number", description: "Total assets in development pipeline" },
    vectorA: { type: "array", items: { type: "number" }, description: "Vector A for similarity calculation" },
    vectorB: { type: "array", items: { type: "number" }, description: "Vector B for similarity calculation" },
    sourceMap: {
      type: "object",
      description: "Mapping of fields to source URLs",
      additionalProperties: {
        type: "array",
        items: { type: "string" }
      }
    }
  },
  required: [
    "currentMarket",
    "peakRevenue2030", 
    "yearsToPeak",
    "avgPrice",
    "persistenceRate",
    "sameTargetAssets",
    "totalAssets",
    "vectorA",
    "vectorB",
    "sourceMap"
  ],
  additionalProperties: false
};

// Derived facts schema - computed metrics
export const DerivedFactsSchema = {
  type: "object", 
  properties: {
    cagr: { type: "number", description: "Compound Annual Growth Rate as decimal" },
    peakPatients2030: { type: "number", description: "Projected patient population by 2030" },
    pipelineDensity: { type: "number", description: "Pipeline density as percentage" },
    strategicFit: { type: "number", description: "Strategic fit score (0-1)" }
  },
  required: ["cagr", "peakPatients2030", "pipelineDensity", "strategicFit"],
  additionalProperties: false
}; 
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TabType = "scientific" | "commercial" | "clinical" | "bd-agent"

export default function BiotechPlayground() {
  // Set the only visible form to commercial
  // Remove all tab logic and only render the commercial form
  const [loading, setLoading] = useState(false)
  const commercialFormRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null);

  const handleCommercialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = commercialFormRef.current
    if (!form) return
    const formData = new FormData(form)
    const data = {
      therapeuticArea: formData.get("therapeuticArea"),
      indication: formData.get("indication"),
      target: formData.get("target"),
      geography: formData.get("geography"),
      developmentPhase: formData.get("developmentPhase"),
    }
    try {
      localStorage.removeItem('perplexityResult');
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || errJson.details || "Unknown error from Perplexity API");
        return;
      }
      const result = await res.json()
      // Store both the API result and the input values for validation
      const dataToStore = {
        ...result,
        inputValues: data
      };
      localStorage.setItem('perplexityResult', JSON.stringify(dataToStore));
      window.location.href = '/commercial-dashboard';
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false)
    }
  }

  const renderCommercialForm = () => (
    <form ref={commercialFormRef} onSubmit={handleCommercialSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="therapeutic-area-comm" className="text-white">
            Therapeutic Area
          </Label>
          <Input
            id="therapeutic-area-comm"
            name="therapeuticArea"
            placeholder="e.g., Oncology"
            className="bg-[#002A1A] border-[#00C277]/30 text-white placeholder:text-white/50 focus:border-[#00C277] focus:ring-[#00C277]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="indication-comm" className="text-white">
            Indication
          </Label>
          <Input
            id="indication-comm"
            name="indication"
            placeholder="e.g., Breast Cancer"
            className="bg-[#002A1A] border-[#00C277]/30 text-white placeholder:text-white/50 focus:border-[#00C277] focus:ring-[#00C277]/30"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target-comm" className="text-white">
            Target
          </Label>
          <Input
            id="target-comm"
            name="target"
            placeholder="e.g., HER2"
            className="bg-[#002A1A] border-[#00C277]/30 text-white placeholder:text-white/50 focus:border-[#00C277] focus:ring-[#00C277]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="geography" className="text-white">
            Geography
          </Label>
          <Input
            id="geography"
            name="geography"
            placeholder="e.g., US, EU, Global"
            className="bg-[#002A1A] border-[#00C277]/30 text-white placeholder:text-white/50 focus:border-[#00C277] focus:ring-[#00C277]/30"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="competitors" className="text-white">
          Development Phase
        </Label>
        <Input
          id="competitors"
          name="developmentPhase"
          placeholder="e.g., Preclinical, Phase 1, Phase 2"
          className="bg-[#002A1A] border-[#00C277]/30 text-white placeholder:text-white/50 focus:border-[#00C277] focus:ring-[#00C277]/30"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#00C277] hover:bg-[#008C5B] text-white border-0 shadow-lg shadow-[#00C277]/20"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Commercial Analysis"}
      </Button>
      {loading && (
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-12 h-12 rounded-full border-4 border-[#008C5B]/20 animate-spin border-t-[#00C277] border-r-[#00C277]"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#00C277]/20 to-[#008C5B]/20 animate-pulse"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00C277]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-[#00C277] font-semibold text-center mt-3">Analyzing competitive landscape.</div>
          <div className="text-xs text-[#008C5B]/70 text-center">This may take up to 30 minutes...</div>
        </div>
      )}
    </form>
  )

  return (
    <div className="min-h-screen bg-[#00160E] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Only show the Commercial Intelligence form, no header, disclaimers, tabs, or demo button */}
        <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-[#00160E]/90 backdrop-blur-md border-white/10">
          <CardHeader className="pb-6 border-b border-white/10">
            <CardTitle className="text-xl font-semibold text-center text-white">Commercial Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300 text-center">
                <strong>Perplexity API Error:</strong> {error}
              </div>
            )}
            {renderCommercialForm()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

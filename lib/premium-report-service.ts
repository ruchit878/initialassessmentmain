// Premium report generation service

const REPORT_API = process.env.NEXT_PUBLIC_REPORT_API || 'http://127.0.0.1:8000/resume_assessment/generate-report'

export class PremiumReportService {
  static async generatePremiumReport(resumeData: any, psychometricResults: any, analysisType: string) {
    // Require external API so we don't silently fall back
    if (!REPORT_API) {
      throw new Error('NEXT_PUBLIC_REPORT_API is not set')
    }

    // Build application/x-www-form-urlencoded payload to match backend contract
    const params = new URLSearchParams()
    params.set('analysisType', analysisType || 'quick')
    // Your API expects resume_text; use rawText when available
    params.set('resume_text', resumeData?.rawText ?? '')
    if ((analysisType || 'quick') === 'detailed' && psychometricResults) {
      // Send psychometric results as JSON string if detailed flow is used
      params.set('psychometricResults', JSON.stringify(psychometricResults))
    }

    const res = await fetch(REPORT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Report API ${res.status}: ${txt}`)
    }

    const data = await res.json()
    return Array.isArray(data) ? data[0] : data
  }
}

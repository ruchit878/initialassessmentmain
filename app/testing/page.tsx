"use client"

import type React from "react"

import { useState } from "react"
import { testResumeParser, solutionArchitectResume } from "@/lib/test-resume-parser"
import { parseResumeFile } from "@/lib/resume-parser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUp, Play, TestTube } from "lucide-react"

export default function TestingPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    try {
      const results = await testResumeParser()
      setTestResults(results)
    } catch (error: any) {
      setTestResults({ error: error.message })
    }
    setIsRunning(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const parseSelectedFile = async () => {
    if (!selectedFile) return
    setIsRunning(true)
    try {
      const result = await parseResumeFile(selectedFile)
      setTestResults({ uploadedFile: selectedFile.name, result })
    } catch (error: any) {
      setTestResults({ error: error.message })
    }
    setIsRunning(false)
  }

  const testWithSampleFile = async () => {
    setIsRunning(true)
    try {
      // Create a test file with Solution Architect content
      const blob = new Blob([solutionArchitectResume], { type: "text/plain" })
      const file = new File([blob], "solution-architect-resume.txt", { type: "text/plain" })

      const result = await parseResumeFile(file)
      setTestResults({ sampleTest: result })
    } catch (error: any) {
      setTestResults({ error: error.message })
    }
    setIsRunning(false)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Resume Parser Testing</CardTitle>
          <CardDescription>Test the resume parser with sample data or upload your own files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runTests} disabled={isRunning} className="gap-2">
              <TestTube className="h-4 w-4" />
              {isRunning ? "Running Tests..." : "Run Full Test Suite"}
            </Button>

            <Button onClick={testWithSampleFile} disabled={isRunning} variant="secondary" className="gap-2">
              <Play className="h-4 w-4" />
              {isRunning ? "Testing..." : "Test Sample Resume"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Resume</CardTitle>
              <CardDescription>Upload a resume file (PDF/DOCX/DOC/TXT) to test the parser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,text/plain"
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={parseSelectedFile} disabled={isRunning || !selectedFile} className="gap-2">
                  <FileUp className="h-4 w-4" />
                  {isRunning ? "Parsing..." : "Parse Uploaded File"}
                </Button>
                {selectedFile && <span className="text-sm text-muted-foreground">Selected: {selectedFile.name}</span>}
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Enhanced PDF Parser:</strong> Uses multiple extraction methods (pdfjs-standard, pdfjs-robust,
                  pdfjs-raw) and automatically falls back to OCR for scanned PDFs. Quality scores help determine the
                  best extraction method.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Display */}
                {testResults?.result?.meta?.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Parser Error: {testResults?.result?.parseErrorMessage || "Unknown error"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Legacy Doc Warning */}
                {testResults?.result?.meta?.legacyDoc && (
                  <Alert>
                    <AlertDescription>
                      {testResults.result.meta.warning ||
                        "Legacy .doc detected. Convert to PDF or DOCX for best accuracy."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Meta Information Badges */}
                {(testResults?.result?.meta?.extractor || testResults?.sampleTest?.meta?.extractor) && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Extractor:{" "}
                      <strong className="ml-1">
                        {testResults?.result?.meta?.extractor || testResults?.sampleTest?.meta?.extractor}
                      </strong>
                    </Badge>
                    {testResults?.result?.meta?.pages && (
                      <Badge variant="outline">
                        Pages: <strong className="ml-1">{testResults.result.meta.pages}</strong>
                      </Badge>
                    )}
                    {testResults?.result?.meta?.textLength && (
                      <Badge variant="outline">
                        Text Length: <strong className="ml-1">{testResults.result.meta.textLength}</strong>
                      </Badge>
                    )}
                    {testResults?.result?.meta?.extractionScore && (
                      <Badge variant="outline">
                        Quality Score:{" "}
                        <strong className="ml-1">{Math.round(testResults.result.meta.extractionScore)}</strong>
                      </Badge>
                    )}
                    {testResults?.result?.meta?.usedOCR && <Badge>OCR Fallback Used</Badge>}
                  </div>
                )}

                {/* Results JSON */}
                <div className="bg-muted rounded-lg p-4 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(testResults, null, 2)}</pre>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tip: Open the browser console (F12) to see detailed parsing logs.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

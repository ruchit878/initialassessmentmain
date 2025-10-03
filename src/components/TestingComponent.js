import React, { useState } from 'react';
import { testResumeParser, solutionArchitectResume, juniorDeveloperResume } from '../utils/testResumeParser';
import { parseResumeFile } from '../utils/resumeParser';

const TestingComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await testResumeParser();
      setTestResults(results);
    } catch (error) {
      setTestResults({ error: error.message });
    }
    setIsRunning(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const parseSelectedFile = async () => {
    if (!selectedFile) return;
    setIsRunning(true);
    try {
      const result = await parseResumeFile(selectedFile);
      setTestResults({ uploadedFile: selectedFile.name, result });
    } catch (error) {
      setTestResults({ error: error.message });
    }
    setIsRunning(false);
  };

  const testWithSampleFile = async () => {
    setIsRunning(true);
    try {
      // Create a test file with Solution Architect content
      const blob = new Blob([solutionArchitectResume], { type: 'text/plain' });
      const file = new File([blob], 'solution-architect-resume.txt', { type: 'text/plain' });
      
      const result = await parseResumeFile(file);
      setTestResults({ sampleTest: result });
    } catch (error) {
      setTestResults({ error: error.message });
    }
    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Resume Parser Testing</h2>
      
      <div className="space-y-4">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
        </button>
        
        <button
          onClick={testWithSampleFile}
          disabled={isRunning}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          {isRunning ? 'Testing...' : 'Test Sample Resume'}
        </button>

        <div className="mt-4 p-4 border border-gray-200 rounded">
          <h4 className="font-semibold mb-2">Upload a resume (PDF/DOCX/DOC)</h4>
          <input
            type="file"
            accept=".pdf,.docx,.doc,text/plain"
            onChange={handleFileChange}
            className="block mb-2"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={parseSelectedFile}
              disabled={isRunning || !selectedFile}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isRunning ? 'Parsing...' : 'Parse Uploaded File'}
            </button>
            {selectedFile && (
              <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <strong>Enhanced PDF Parser:</strong> Uses multiple extraction methods (pdfjs-standard, pdfjs-robust, pdfjs-raw) and automatically falls back to OCR for scanned PDFs. Quality scores help determine the best extraction method.
          </div>
        </div>
      </div>

      {testResults && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {/* Warnings and meta badges */}
          {testResults?.result?.meta?.error && (
            <div className="mb-3 text-red-600 text-sm">Parser Error: {testResults?.result?.parseErrorMessage || 'Unknown error'}</div>
          )}
          {testResults?.result?.meta?.legacyDoc && (
            <div className="mb-3 text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded text-sm">
              {testResults.result.meta.warning || 'Legacy .doc detected. Convert to PDF or DOCX for best accuracy.'}
            </div>
          )}
          {(testResults?.result?.meta?.extractor || testResults?.sampleTest?.meta?.extractor) && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Extractor:
                <strong>{testResults?.result?.meta?.extractor || testResults?.sampleTest?.meta?.extractor}</strong>
              </span>
              {testResults?.result?.meta?.pages && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  Pages: <strong>{testResults.result.meta.pages}</strong>
                </span>
              )}
              {testResults?.result?.meta?.textLength && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                  Text Length: <strong>{testResults.result.meta.textLength}</strong>
                </span>
              )}
              {testResults?.result?.meta?.extractionScore && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Quality Score: <strong>{Math.round(testResults.result.meta.extractionScore)}</strong>
                </span>
              )}
              {testResults?.result?.meta?.usedOCR && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  OCR Fallback Used
                </span>
              )}
            </div>
          )}
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
          <div className="mt-2 text-xs text-gray-500">
            Tip: Open the browser console (F12) to see detailed parsing logs.
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingComponent;

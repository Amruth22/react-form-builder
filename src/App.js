import React, { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import FormBuilder from './components/FormBuilder';
// import FormPreview from './components/FormPreview'; // Hidden for now
import JsonDropZone from './components/JsonDropZone';
import PdfUploadZone from './components/PdfUploadZone';
import Header from './components/Header';
import { ensureQuestionIds, generateQuestionTags } from './utils/formUtils';

function App() {
  const [formData, setFormData] = useState(null);
  const [currentView, setCurrentView] = useState('import'); // 'import', 'builder', 'preview'
  const [uploadMode, setUploadMode] = useState('pdf'); // 'pdf' or 'json'

  const handleJsonImport = useCallback((jsonData) => {
    console.log('Imported JSON:', jsonData);

    // Normalize JSON structure - support both old and new formats
    let normalizedData = normalizeFormData(jsonData);

    // Ensure all questions have unique IDs
    normalizedData = ensureQuestionIds(normalizedData);

    // Auto-generate question tags and labels
    normalizedData = generateQuestionTags(normalizedData, {
      prefix: '', // No prefix by default
      forceRegenerate: false, // Only generate if missing
      generateLabels: true // Generate labels too
    });

    setFormData(normalizedData);
    setCurrentView('builder');
  }, []);

  // Normalize form data to support both flat and hierarchical structures
  const normalizeFormData = (data) => {
    if (!data || !data.pages) return data;

    // Check if already in new format (has sections)
    const hasNewFormat = data.pages.some(page => page.sections);

    if (hasNewFormat) {
      // Already in new format
      return data;
    }

    // Convert old format (form_elements) to new format (sections -> groups -> questions)
    const normalizedPages = data.pages.map((page, pageIndex) => {
      if (page.sections) {
        return page; // Already normalized
      }

      // Convert flat form_elements to hierarchical structure
      return {
        ...page,
        title: page.title || `Page ${page.page_number || pageIndex + 1}`,
        sections: [
          {
            title: 'Form Fields',
            groups: [
              {
                title: 'Questions',
                repeatable: false,
                questions: page.form_elements || []
              }
            ]
          }
        ]
      };
    });

    return {
      ...data,
      pages: normalizedPages
    };
  };

  const handleExportHtml = useCallback((htmlContent) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData?.document_info?.source_pdf || 'form'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(null);
    setCurrentView('import');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onReset={handleReset}
        hasData={!!formData}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'import' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                React Form Builder
              </h1>
              <p className="text-gray-600 text-lg">
                Upload PDF or JSON to build beautiful forms
              </p>
            </div>
            
            {/* Upload Mode Selector */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={() => setUploadMode('pdf')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  uploadMode === 'pdf'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Upload PDF</span>
                </div>
              </button>
              
              <button
                onClick={() => setUploadMode('json')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  uploadMode === 'json'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload JSON</span>
                </div>
              </button>
            </div>
            
            {/* Upload Components */}
            {uploadMode === 'pdf' ? (
              <PdfUploadZone onJsonReceived={handleJsonImport} />
            ) : (
              <JsonDropZone onJsonImport={handleJsonImport} />
            )}
            
            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How it works:
              </h3>
              <div className="space-y-3 text-gray-600">
                {uploadMode === 'pdf' ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p>Upload your PDF form - AI will extract all fields automatically</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p>Organize and edit your form questions visually</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p>Export as a beautiful HTML form ready to use</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p>Drag & drop your JSON file (from PDF processing) above</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p>Organize and edit your form questions visually</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p>Export as a beautiful HTML form ready to use</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'builder' && formData && (
          <FormBuilder 
            formData={formData}
            onFormDataChange={setFormData}
            onExportHtml={handleExportHtml}
          />
        )}

        {/* Preview hidden for now */}
        {/* {currentView === 'preview' && formData && (
          <FormPreview 
            formData={formData}
            onExportHtml={handleExportHtml}
          />
        )} */}
      </main>
    </div>
  );
}

export default App;
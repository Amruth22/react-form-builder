import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Eye, Settings } from 'lucide-react';
import FormBuilder from './components/FormBuilder';
import JsonDropZone from './components/JsonDropZone';
import Header from './components/Header';

function App() {
  const [formData, setFormData] = useState(null);
  const [currentView, setCurrentView] = useState('import'); // 'import', 'builder', 'preview'

  const handleJsonImport = useCallback((jsonData) => {
    console.log('Imported JSON:', jsonData);
    setFormData(jsonData);
    setCurrentView('builder');
  }, []);

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
                Import your JSON file from PDF processing and build beautiful forms
              </p>
            </div>
            
            <JsonDropZone onJsonImport={handleJsonImport} />
            
            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How it works:
              </h3>
              <div className="space-y-3 text-gray-600">
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

        {currentView === 'preview' && formData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Preview</h2>
              {/* Preview component will be implemented */}
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4" />
                <p>Form preview coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
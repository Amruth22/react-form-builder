import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import API_CONFIG from '../config/api';
import { applySmartFieldDetection, enrichWithPdfMetadata } from '../utils/pdfFieldDetection';
import { generateQuestionTags } from '../utils/formUtils';

const PdfUploadZone = ({ onJsonReceived, apiUrl = API_CONFIG.baseUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processPdf = async (file) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress('Uploading PDF...');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      setProgress('Processing PDF with AI...');
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Processing failed');
      }

      // Get the JSON file
      setProgress('Downloading extracted data...');
      const jsonFilename = result.data.output_files.json.filename;
      const jsonUrl = `${apiUrl}/api/files/${jsonFilename}`;

      const jsonResponse = await fetch(jsonUrl);
      if (!jsonResponse.ok) {
        throw new Error('Failed to download JSON');
      }

      const jsonData = await jsonResponse.json();

      // Enrich with PDF metadata
      setProgress('Adding PDF metadata...');
      const enrichedData = enrichWithPdfMetadata(jsonData, result.data);

      // Apply smart field detection
      setProgress('Applying smart field detection...');
      const processedData = applySmartFieldDetection(enrichedData);

      // Auto-generate question labels only (not tags - we use PDF field names)
      setProgress('Generating question labels...');
      const taggedData = generateQuestionTags(processedData, {
        prefix: '',
        forceRegenerate: false,
        generateLabels: true,
        usePdfFieldNames: false // Don't modify tags, just generate labels
      });

      // Success!
      setSuccess({
        filename: file.name,
        pages: result.data.pages_extracted.length,
        elements: result.data.extraction_info.total_form_elements,
        structure: result.data.document_structure
      });

      setProgress('Complete! Loading form builder...');

      // Pass JSON to parent component
      setTimeout(() => {
        onJsonReceived(taggedData);
      }, 500);

    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err.message || 'Failed to process PDF');
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const processJson = async (file) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress('Reading JSON file...');

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      setProgress('Loading form data...');

      // Success!
      setSuccess({
        filename: file.name,
        pages: jsonData.pages?.length || 0,
        elements: jsonData.pages?.reduce((total, page) =>
          total + (page.sections?.reduce((sTotal, section) =>
            sTotal + (section.groups?.reduce((gTotal, group) =>
              gTotal + (group.questions?.length || 0), 0) || 0), 0) || 0), 0) || 0,
        structure: { sections: jsonData.pages?.[0]?.sections?.length || 0 }
      });

      setProgress('Complete! Loading form builder...');

      // Pass JSON to parent component
      setTimeout(() => {
        onJsonReceived(jsonData);
      }, 500);

    } catch (err) {
      console.error('JSON processing error:', err);
      setError(err.message || 'Failed to process JSON file');
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));

    if (pdfFile) {
      processPdf(pdfFile);
    } else if (jsonFile) {
      processJson(jsonFile);
    } else {
      setError('Please upload a PDF or JSON file');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      processPdf(file);
    } else if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      processJson(file);
    } else {
      setError('Please select a PDF or JSON file');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetUpload = () => {
    setIsProcessing(false);
    setProgress(null);
    setError(null);
    setSuccess(null);
  };

  const fileInputRef = React.useRef(null);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* Upload Zone - Hero Section */}
        {!isProcessing && !success && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative drop-zone overflow-hidden
              ${isDragging ? 'active scale-105' : ''}
            `}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, #667eea 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="relative z-10 pointer-events-none">
              {/* Animated Icon */}
              <div className="mb-10">
                <div className="relative w-32 h-32 mx-auto">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                  {/* Icon container */}
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-500 hover:scale-110">
                    <FileText className="w-16 h-16 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Text */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4">
                  <span className="text-gradient">Transform Your Forms</span>
                </h1>
                <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto leading-relaxed">
                  Upload PDF forms for instant AI extraction or import existing JSON structures
                </p>
                <p className="text-sm text-gray-500">
                  Powered by advanced AI • Secure • Lightning fast
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10">
              <button
                onClick={handleButtonClick}
                className="btn-primary pointer-events-auto transform transition-all hover:scale-105 text-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose File to Upload
              </button>
            </div>

            {/* Supported formats */}
            <div className="mt-10 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">PDF supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">JSON supported</span>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && !success && (
          <div className="card-premium p-16 animate-bounce-in">
            <div className="text-center">
              {/* Animated Loader */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4">
                <span className="text-gradient">Processing Your File</span>
              </h3>

              <p className="text-lg text-gray-600 mb-8 font-medium">
                {progress}
              </p>

              {/* Premium Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-4 mb-6 overflow-hidden relative">
                <div className="absolute inset-0 shimmer"></div>
                <div className="relative h-full rounded-full" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: '70%',
                  boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
                }}></div>
              </div>

              <p className="text-sm text-gray-500">
                AI is analyzing your document • This may take 2-5 minutes
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="card-premium p-16 animate-bounce-in border-2 border-green-300">
            <div className="text-center">
              {/* Success Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600" style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Success!</span>
              </h3>

              <p className="text-lg text-gray-600 mb-8 font-medium">
                {progress}
              </p>

              {/* Stats Grid */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-2 font-medium">📄 File</p>
                    <p className="font-bold text-gray-900 truncate text-lg">{success.filename}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-2 font-medium">📑 Pages</p>
                    <p className="font-bold text-gray-900 text-lg">{success.pages}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-2 font-medium">📝 Form Elements</p>
                    <p className="font-bold text-gray-900 text-lg">{success.elements}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-2 font-medium">🗂️ Sections</p>
                    <p className="font-bold text-gray-900 text-lg">{success.structure.sections}</p>
                  </div>
                </div>
              </div>

              {/* Loading Animation */}
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-base font-semibold text-gradient">Loading form builder...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-premium p-16 animate-bounce-in border-2 border-rose-300">
            <div className="text-center">
              {/* Error Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-rose-600 to-red-600" style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Processing Failed</span>
              </h3>

              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 mb-8">
                <p className="text-lg text-rose-700 font-medium max-w-md mx-auto">
                  {error}
                </p>
              </div>

              <button
                onClick={resetUpload}
                className="btn-primary"
              >
                <Upload className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUploadZone;

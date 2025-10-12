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
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        {/* Upload Zone */}
        {!isProcessing && !success && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-3 border-dashed rounded-2xl p-16 text-center transition-all shadow-lg
              ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-xl'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="mb-8 pointer-events-none">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Upload Your Form
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Drag and drop your PDF or JSON file here, or click the button below
              </p>
            </div>

            <button
              onClick={handleButtonClick}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 pointer-events-auto relative z-10"
            >
              <Upload className="w-6 h-6 mr-3" />
              Select PDF or JSON File
            </button>

            <p className="text-sm text-gray-500 mt-8">
              Upload a PDF for AI extraction or import an existing JSON form structure
            </p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && !success && (
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-12 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Processing Your PDF
              </h3>

              <p className="text-lg text-gray-600 mb-8">
                {progress}
              </p>

              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>

              <p className="text-sm text-gray-500">
                This may take 2-5 minutes depending on the PDF size
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-white rounded-2xl border-2 border-green-200 p-12 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                PDF Processed Successfully!
              </h3>

              <p className="text-lg text-gray-600 mb-8">
                {progress}
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">File</p>
                    <p className="font-semibold text-gray-900 truncate">{success.filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pages</p>
                    <p className="font-semibold text-gray-900">{success.pages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Form Elements</p>
                    <p className="font-semibold text-gray-900">{success.elements}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sections</p>
                    <p className="font-semibold text-gray-900">{success.structure.sections}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-base font-medium">Loading form builder...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl border-2 border-red-200 p-12 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Processing Failed
              </h3>

              <p className="text-lg text-red-600 mb-8 max-w-md mx-auto">
                {error}
              </p>

              <button
                onClick={resetUpload}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="w-6 h-6 mr-3" />
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

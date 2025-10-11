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

  const handleDrop = useCallback((e) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      processPdf(pdfFile);
    } else {
      setError('Please upload a PDF file');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      processPdf(file);
    } else {
      setError('Please select a PDF file');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      processPdf(file);
    } else {
      setError('Please select a PDF file');
    }
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

      // Auto-generate question tags and labels
      setProgress('Generating question tags...');
      const taggedData = generateQuestionTags(processedData, {
        prefix: '',
        forceRegenerate: false,
        generateLabels: true
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

  const resetUpload = () => {
    setIsProcessing(false);
    setProgress(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      {!isProcessing && !success && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <FileText className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload PDF Form
          </h3>
          
          <p className="text-gray-600 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-5 h-5 mr-2" />
            Select PDF File
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Your PDF will be processed with AI to extract form fields
          </p>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && !success && (
        <div className="bg-white rounded-lg border-2 border-blue-200 p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processing PDF...
            </h3>
            
            <p className="text-gray-600 mb-6">
              {progress}
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
            
            <p className="text-sm text-gray-500">
              This may take 2-5 minutes depending on the PDF size
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="bg-white rounded-lg border-2 border-green-200 p-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              PDF Processed Successfully!
            </h3>
            
            <p className="text-gray-600 mb-6">
              {progress}
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">File</p>
                  <p className="font-semibold text-gray-900">{success.filename}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pages</p>
                  <p className="font-semibold text-gray-900">{success.pages}</p>
                </div>
                <div>
                  <p className="text-gray-600">Form Elements</p>
                  <p className="font-semibold text-gray-900">{success.elements}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sections</p>
                  <p className="font-semibold text-gray-900">{success.structure.sections}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading form builder...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg border-2 border-red-200 p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Failed
            </h3>
            
            <p className="text-red-600 mb-6">
              {error}
            </p>
            
            <button
              onClick={resetUpload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* API Configuration Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full mt-1 ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              API Connection
            </p>
            <p className="text-sm text-gray-600">
              Connected to: <code className="text-xs bg-white px-2 py-1 rounded">{apiUrl}</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Make sure your Flask API is running on this URL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfUploadZone;

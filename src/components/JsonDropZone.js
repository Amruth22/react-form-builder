import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const JsonDropZone = ({ onJsonImport }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateJsonStructure = (data) => {
    // Check if it's a valid form JSON structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON format');
    }

    // Check for expected structure from PDF processing
    if (!data.pages && !data.document_info) {
      throw new Error('This doesn\'t appear to be a valid form JSON file from PDF processing');
    }

    return true;
  };

  const processFile = useCallback(async (file) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Check file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        throw new Error('Please select a JSON file');
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 10MB');
      }

      // Read file content
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate structure
      validateJsonStructure(jsonData);

      // Import successful
      onJsonImport(jsonData);
    } catch (err) {
      console.error('File processing error:', err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onJsonImport]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          drop-zone cursor-pointer relative
          ${isDragOver ? 'active' : ''}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <>
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Processing file...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Drop your JSON file here
                </p>
                <p className="text-gray-600">
                  or click to browse files
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Supports JSON files from PDF processing</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">Upload Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-800 font-medium">Expected File Format</h4>
            <p className="text-blue-700 text-sm mt-1">
              Upload JSON files generated from the PDF processing app. 
              These files contain structured form data with pages and form elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonDropZone;
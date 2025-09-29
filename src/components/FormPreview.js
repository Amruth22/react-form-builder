import React, { useState, useCallback } from 'react';
import { 
  Eye, 
  Download, 
  Copy, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  Type, 
  Mail, 
  Phone, 
  Calendar, 
  Hash, 
  List, 
  CheckSquare, 
  Circle, 
  FileText,
  MessageSquare
} from 'lucide-react';

const FormPreview = ({ formData, onExportHtml }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [jsonOutput, setJsonOutput] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const pages = formData?.pages || [];
  const currentPage = pages[currentPageIndex];
  const questions = currentPage?.form_elements || [];

  const getQuestionIcon = (answerType) => {
    const iconMap = {
      text: Type,
      email: Mail,
      tel: Phone,
      date: Calendar,
      number: Hash,
      dropdown: List,
      checkbox: CheckSquare,
      radio: Circle,
      textarea: FileText,
      display_text: MessageSquare,
    };
    return iconMap[answerType] || Type;
  };

  const handleInputChange = useCallback((questionIndex, value, isMultiple = false) => {
    const key = `page_${currentPageIndex}_question_${questionIndex}`;
    
    setFormValues(prev => {
      if (isMultiple) {
        const currentValues = prev[key] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [key]: newValues };
      } else {
        return { ...prev, [key]: value };
      }
    });

    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [currentPageIndex, validationErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    pages.forEach((page, pageIndex) => {
      page.form_elements?.forEach((question, questionIndex) => {
        if (question.required && question.answer_type !== 'display_text') {
          const key = `page_${pageIndex}_question_${questionIndex}`;
          const value = formValues[key];
          
          if (!value || (Array.isArray(value) && value.length === 0) || 
              (typeof value === 'string' && value.trim() === '')) {
            errors[key] = 'This field is required';
          }
        }
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [pages, formValues]);

  const exportToJson = useCallback(() => {
    if (!validateForm()) {
      alert('Please fill in all required fields before exporting.');
      return;
    }

    const exportData = {
      formData: {},
      metadata: {
        exportedAt: new Date().toISOString(),
        totalPages: pages.length,
        totalQuestions: pages.reduce((sum, page) => sum + (page.form_elements?.length || 0), 0),
        sourceDocument: formData.document_info?.source_pdf || 'Unknown'
      }
    };

    // Organize data by pages and questions
    pages.forEach((page, pageIndex) => {
      const pageData = {};
      
      page.form_elements?.forEach((question, questionIndex) => {
        if (question.answer_type !== 'display_text') {
          const key = `page_${pageIndex}_question_${questionIndex}`;
          const value = formValues[key];
          
          // Create a clean field name from the question
          const fieldName = question.question
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .toLowerCase()
            .substring(0, 50);
          
          pageData[fieldName] = {
            question: question.question,
            answer: value || (question.answer_type === 'checkbox' ? [] : ''),
            type: question.answer_type,
            required: question.required || false
          };
        }
      });
      
      exportData.formData[`page_${page.page_number || pageIndex + 1}`] = pageData;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    setJsonOutput(jsonString);
    setShowJson(true);
  }, [formValues, pages, formData, validateForm]);

  const copyToClipboard = useCallback(() => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput).then(() => {
        alert('JSON copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonOutput;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('JSON copied to clipboard!');
      });
    }
  }, [jsonOutput]);

  const clearForm = useCallback(() => {
    if (window.confirm('Clear all form data?')) {
      setFormValues({});
      setJsonOutput('');
      setShowJson(false);
      setValidationErrors({});
    }
  }, []);

  const renderQuestion = (question, questionIndex) => {
    if (question.answer_type === 'display_text') {
      return (
        <div key={questionIndex} className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 font-medium">{question.question}</p>
            </div>
          </div>
        </div>
      );
    }

    const key = `page_${currentPageIndex}_question_${questionIndex}`;
    const value = formValues[key] || '';
    const hasError = validationErrors[key];
    const Icon = getQuestionIcon(question.answer_type);

    return (
      <div key={questionIndex} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span>{question.question}</span>
            {question.required && <span className="text-red-500">*</span>}
          </div>
        </label>

        {question.answer_type === 'textarea' && (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(questionIndex, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Enter your response..."
          />
        )}

        {question.answer_type === 'dropdown' && (
          <select
            value={value}
            onChange={(e) => handleInputChange(questionIndex, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {(question.options || []).map((option, optIndex) => {
              const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
              const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
              return (
                <option key={optIndex} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        )}

        {question.answer_type === 'radio' && (
          <div className="space-y-2">
            {(question.options || []).map((option, optIndex) => {
              const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
              const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
              return (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${key}_${optIndex}`}
                    name={key}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleInputChange(questionIndex, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`${key}_${optIndex}`} className="text-sm text-gray-700">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {question.answer_type === 'checkbox' && (
          <div className="space-y-2">
            {(question.options || []).map((option, optIndex) => {
              const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
              const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
              const isChecked = Array.isArray(value) && value.includes(optionValue);
              return (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${key}_${optIndex}`}
                    value={optionValue}
                    checked={isChecked}
                    onChange={(e) => handleInputChange(questionIndex, e.target.value, true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${key}_${optIndex}`} className="text-sm text-gray-700">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {['text', 'email', 'tel', 'date', 'number'].includes(question.answer_type) && (
          <input
            type={question.answer_type === 'tel' ? 'text' : question.answer_type}
            value={value}
            onChange={(e) => handleInputChange(questionIndex, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={`Enter ${question.answer_type === 'tel' ? 'phone number' : question.answer_type}...`}
          />
        )}

        {hasError && (
          <div className="mt-1 flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    );
  };

  if (!formData || !pages.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Form to Preview</h2>
          <p className="text-gray-600">Import a JSON file first to see the form preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Preview Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <span>Form Preview</span>
            </h1>
            <p className="text-gray-600 mt-1">
              {formData.document_info?.source_pdf || 'Interactive Form'} • 
              {pages.length} page{pages.length !== 1 ? 's' : ''} • 
              {pages.reduce((sum, page) => sum + (page.form_elements?.length || 0), 0)} questions
            </p>
          </div>
          <button
            onClick={() => onExportHtml && onExportHtml()}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">
            {formData.document_info?.source_pdf || 'Interactive Form'}
          </h1>
          <p className="text-blue-100">Fill out all fields and export your data as JSON</p>
        </div>

        {/* Page Navigation */}
        {pages.length > 1 && (
          <div className="border-b border-gray-200 p-4">
            <div className="flex justify-center space-x-2 flex-wrap">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPageIndex(index)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                    currentPageIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Page {page.page_number || index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p>No questions on this page</p>
              </div>
            ) : (
              questions.map((question, index) => renderQuestion(question, index))
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
          <div className="flex justify-center space-x-3 mb-4">
            <button
              onClick={exportToJson}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to JSON</span>
            </button>
            
            {jsonOutput && (
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy JSON</span>
              </button>
            )}
            
            <button
              onClick={clearForm}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Form</span>
            </button>
          </div>

          {/* JSON Output */}
          {showJson && jsonOutput && (
            <div className="mt-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">JSON Output</h3>
                <button
                  onClick={() => setShowJson(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {jsonOutput}
                </pre>
              </div>
            </div>
          )}

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  Please fill in {Object.keys(validationErrors).length} required field{Object.keys(validationErrors).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {jsonOutput && Object.keys(validationErrors).length === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Form completed successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
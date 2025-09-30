import React, { useState, useCallback } from 'react';
import { 
  Eye, 
  Download, 
  Copy, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Type, 
  Mail, 
  Phone, 
  Calendar, 
  Hash, 
  List, 
  CheckSquare, 
  Circle, 
  FileText,
  MessageSquare,
  Upload as UploadIcon,
  Image as ImageIcon,
  Layers,
  FolderOpen
} from 'lucide-react';

const FormPreview = ({ formData, onExportHtml }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [fileData, setFileData] = useState({});
  const [repeatableInstances, setRepeatableInstances] = useState({});
  const [jsonOutput, setJsonOutput] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const pages = formData?.pages || [];
  const currentPage = pages[currentPageIndex];

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
      file: UploadIcon,
    };
    return iconMap[answerType] || Type;
  };

  // Generate unique key for form fields
  const generateFieldKey = (pageIndex, sectionIndex, groupIndex, questionIndex, instanceIndex = 0) => {
    return `p${pageIndex}_s${sectionIndex}_g${groupIndex}_q${questionIndex}_i${instanceIndex}`;
  };

  // Generate unique key for repeatable groups
  const generateGroupKey = (pageIndex, sectionIndex, groupIndex) => {
    return `p${pageIndex}_s${sectionIndex}_g${groupIndex}`;
  };

  // Get number of instances for a repeatable group
  const getGroupInstances = (pageIndex, sectionIndex, groupIndex) => {
    const key = generateGroupKey(pageIndex, sectionIndex, groupIndex);
    return repeatableInstances[key] || 1;
  };

  // Add instance to repeatable group
  const addGroupInstance = (pageIndex, sectionIndex, groupIndex) => {
    const key = generateGroupKey(pageIndex, sectionIndex, groupIndex);
    setRepeatableInstances(prev => ({
      ...prev,
      [key]: (prev[key] || 1) + 1
    }));
  };

  // Remove instance from repeatable group
  const removeGroupInstance = (pageIndex, sectionIndex, groupIndex, instanceIndex) => {
    const key = generateGroupKey(pageIndex, sectionIndex, groupIndex);
    const currentInstances = repeatableInstances[key] || 1;
    
    if (currentInstances > 1) {
      // Remove form values for this instance
      const newFormValues = { ...formValues };
      const newFileData = { ...fileData };
      
      Object.keys(newFormValues).forEach(fieldKey => {
        if (fieldKey.includes(`p${pageIndex}_s${sectionIndex}_g${groupIndex}`) && 
            fieldKey.endsWith(`_i${instanceIndex}`)) {
          delete newFormValues[fieldKey];
        }
      });
      
      Object.keys(newFileData).forEach(fieldKey => {
        if (fieldKey.includes(`p${pageIndex}_s${sectionIndex}_g${groupIndex}`) && 
            fieldKey.endsWith(`_i${instanceIndex}`)) {
          delete newFileData[fieldKey];
        }
      });
      
      setFormValues(newFormValues);
      setFileData(newFileData);
      setRepeatableInstances(prev => ({
        ...prev,
        [key]: currentInstances - 1
      }));
    }
  };

  const handleInputChange = useCallback((fieldKey, value, isMultiple = false) => {
    setFormValues(prev => {
      if (isMultiple) {
        const currentValues = prev[fieldKey] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [fieldKey]: newValues };
      } else {
        return { ...prev, [fieldKey]: value };
      }
    });

    // Clear validation error
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleFileChange = useCallback((fieldKey, files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setFileData(prev => ({
          ...prev,
          [fieldKey]: {
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target.result
          }
        }));
        
        setFormValues(prev => ({
          ...prev,
          [fieldKey]: file.name
        }));
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  }, []);

  const validateQuestion = (question, value) => {
    if (question.required && question.answer_type !== 'display_text') {
      if (!value || (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.trim() === '')) {
        return question.validation?.errorMessage || 'This field is required';
      }
    }

    if (value && question.validation) {
      const val = question.validation;
      
      // Min/Max length
      if (val.minLength && value.length < val.minLength) {
        return val.errorMessage || `Minimum length is ${val.minLength} characters`;
      }
      if (val.maxLength && value.length > val.maxLength) {
        return val.errorMessage || `Maximum length is ${val.maxLength} characters`;
      }
      
      // Min/Max value
      if (val.min !== undefined && parseFloat(value) < val.min) {
        return val.errorMessage || `Minimum value is ${val.min}`;
      }
      if (val.max !== undefined && parseFloat(value) > val.max) {
        return val.errorMessage || `Maximum value is ${val.max}`;
      }
      
      // Pattern
      if (val.pattern) {
        try {
          const regex = new RegExp(val.pattern);
          if (!regex.test(value)) {
            return val.errorMessage || 'Invalid format';
          }
        } catch (e) {
          console.error('Invalid regex pattern:', val.pattern);
        }
      }
    }

    return null;
  };

  const validateForm = useCallback(() => {
    const errors = {};
    
    pages.forEach((page, pageIndex) => {
      page.sections?.forEach((section, sectionIndex) => {
        section.groups?.forEach((group, groupIndex) => {
          const instances = getGroupInstances(pageIndex, sectionIndex, groupIndex);
          
          for (let instanceIndex = 0; instanceIndex < instances; instanceIndex++) {
            group.questions?.forEach((question, questionIndex) => {
              if (question.answer_type !== 'display_text') {
                const fieldKey = generateFieldKey(pageIndex, sectionIndex, groupIndex, questionIndex, instanceIndex);
                const value = formValues[fieldKey];
                const error = validateQuestion(question, value);
                
                if (error) {
                  errors[fieldKey] = error;
                }
              }
            });
          }
        });
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [pages, formValues, repeatableInstances]);

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
        sourceDocument: formData.document_info?.source_pdf || 'Unknown'
      }
    };

    // Organize data hierarchically
    pages.forEach((page, pageIndex) => {
      const pageData = {
        title: page.title || `Page ${pageIndex + 1}`,
        sections: []
      };

      page.sections?.forEach((section, sectionIndex) => {
        const sectionData = {
          title: section.title,
          groups: []
        };

        section.groups?.forEach((group, groupIndex) => {
          const instances = getGroupInstances(pageIndex, sectionIndex, groupIndex);
          const groupInstances = [];

          for (let instanceIndex = 0; instanceIndex < instances; instanceIndex++) {
            const instanceData = {
              instance: instanceIndex + 1,
              questions: {}
            };

            group.questions?.forEach((question, questionIndex) => {
              if (question.answer_type !== 'display_text') {
                const fieldKey = generateFieldKey(pageIndex, sectionIndex, groupIndex, questionIndex, instanceIndex);
                const value = formValues[fieldKey];
                
                const fieldName = question.question
                  .replace(/[^\w\s]/g, '')
                  .replace(/\s+/g, '_')
                  .toLowerCase()
                  .substring(0, 50);
                
                instanceData.questions[fieldName] = {
                  question: question.question,
                  answer: value || (question.answer_type === 'checkbox' ? [] : ''),
                  type: question.answer_type
                };

                // Include file data if present
                if (question.answer_type === 'file' && fileData[fieldKey]) {
                  instanceData.questions[fieldName].file = {
                    name: fileData[fieldKey].name,
                    size: fileData[fieldKey].size,
                    type: fileData[fieldKey].type
                  };
                }
              }
            });

            groupInstances.push(instanceData);
          }

          sectionData.groups.push({
            title: group.title,
            repeatable: group.repeatable,
            instances: groupInstances
          });
        });

        pageData.sections.push(sectionData);
      });

      exportData.formData[`page_${pageIndex + 1}`] = pageData;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    setJsonOutput(jsonString);
    setShowJson(true);
  }, [formValues, fileData, pages, formData, validateForm, repeatableInstances]);

  const copyToClipboard = useCallback(() => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput).then(() => {
        alert('JSON copied to clipboard!');
      }).catch(() => {
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
      setFileData({});
      setRepeatableInstances({});
      setJsonOutput('');
      setShowJson(false);
      setValidationErrors({});
    }
  }, []);

  const renderQuestion = (question, fieldKey, pageIndex, sectionIndex, groupIndex, questionIndex) => {
    if (question.answer_type === 'display_text') {
      return (
        <div key={fieldKey} className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 font-medium whitespace-pre-wrap">{question.question}</p>
            </div>
          </div>
        </div>
      );
    }

    const value = formValues[fieldKey] || '';
    const hasError = validationErrors[fieldKey];
    const Icon = getQuestionIcon(question.answer_type);

    return (
      <div key={fieldKey} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span>{question.question}</span>
            {question.required && <span className="text-red-500">*</span>}
          </div>
        </label>

        {/* File Upload */}
        {question.answer_type === 'file' && (
          <div>
            <input
              type="file"
              id={fieldKey}
              onChange={(e) => handleFileChange(fieldKey, e.target.files)}
              className="hidden"
              accept={question.validation?.accept || '*'}
            />
            <label
              htmlFor={fieldKey}
              className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <UploadIcon className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                {fileData[fieldKey] ? fileData[fieldKey].name : 'Click to upload file'}
              </span>
            </label>
            
            {fileData[fieldKey] && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {fileData[fieldKey].type.startsWith('image/') && (
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{fileData[fieldKey].name}</p>
                      <p className="text-gray-500">{(fileData[fieldKey].size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newFileData = { ...fileData };
                      delete newFileData[fieldKey];
                      setFileData(newFileData);
                      setFormValues(prev => {
                        const newValues = { ...prev };
                        delete newValues[fieldKey];
                        return newValues;
                      });
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {fileData[fieldKey].type.startsWith('image/') && (
                  <img
                    src={fileData[fieldKey].data}
                    alt="Preview"
                    className="mt-2 max-w-full h-auto rounded-lg max-h-48"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Textarea */}
        {question.answer_type === 'textarea' && (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Enter your response..."
          />
        )}

        {/* Dropdown */}
        {question.answer_type === 'dropdown' && (
          <select
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
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

        {/* Radio Buttons */}
        {question.answer_type === 'radio' && (
          <div className="space-y-2">
            {(question.options || []).map((option, optIndex) => {
              const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
              const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
              const requiresInput = typeof option === 'object' && option.requires_input;
              const inputType = typeof option === 'object' ? option.input_type || 'text' : 'text';
              const conditionalKey = `${fieldKey}_conditional_${optIndex}`;
              
              return (
                <div key={optIndex}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${fieldKey}_${optIndex}`}
                      name={fieldKey}
                      value={optionValue}
                      checked={value === optionValue}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`${fieldKey}_${optIndex}`} className="text-sm text-gray-700 flex-1">
                      {optionLabel}
                    </label>
                  </div>
                  
                  {/* Conditional Input */}
                  {requiresInput && value === optionValue && (
                    <div className="ml-6 mt-2">
                      <input
                        type={inputType}
                        value={formValues[conditionalKey] || ''}
                        onChange={(e) => handleInputChange(conditionalKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${inputType}...`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Checkboxes */}
        {question.answer_type === 'checkbox' && (
          <div className="space-y-2">
            {(question.options || []).map((option, optIndex) => {
              const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
              const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
              const isChecked = Array.isArray(value) && value.includes(optionValue);
              const requiresInput = typeof option === 'object' && option.requires_input;
              const inputType = typeof option === 'object' ? option.input_type || 'text' : 'text';
              const conditionalKey = `${fieldKey}_conditional_${optIndex}`;
              
              return (
                <div key={optIndex}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${fieldKey}_${optIndex}`}
                      value={optionValue}
                      checked={isChecked}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value, true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`${fieldKey}_${optIndex}`} className="text-sm text-gray-700 flex-1">
                      {optionLabel}
                    </label>
                  </div>
                  
                  {/* Conditional Input */}
                  {requiresInput && isChecked && (
                    <div className="ml-6 mt-2">
                      <input
                        type={inputType}
                        value={formValues[conditionalKey] || ''}
                        onChange={(e) => handleInputChange(conditionalKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${inputType}...`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Standard Inputs */}
        {['text', 'email', 'tel', 'date', 'number'].includes(question.answer_type) && (
          <input
            type={question.answer_type === 'tel' ? 'tel' : question.answer_type}
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={`Enter ${question.answer_type === 'tel' ? 'phone number' : question.answer_type}...`}
            min={question.validation?.min}
            max={question.validation?.max}
            minLength={question.validation?.minLength}
            maxLength={question.validation?.maxLength}
            pattern={question.validation?.pattern}
          />
        )}

        {/* Error Message */}
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
    <div className="max-w-5xl mx-auto">
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
              {pages.length} page{pages.length !== 1 ? 's' : ''}
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
            <div className="flex justify-center space-x-2 flex-wrap gap-2">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPageIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    currentPageIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page.title || `Page ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {!currentPage?.sections || currentPage.sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No content on this page</p>
            </div>
          ) : (
            <div className="space-y-8">
              {currentPage.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="p-6 space-y-6">
                    {section.groups?.map((group, groupIndex) => {
                      const instances = getGroupInstances(currentPageIndex, sectionIndex, groupIndex);
                      
                      return (
                        <div key={groupIndex} className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
                          {/* Group Header */}
                          <div className="bg-blue-100 border-b border-blue-200 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FolderOpen className="w-4 h-4 text-blue-600" />
                                <h3 className="font-medium text-gray-900">{group.title}</h3>
                                {group.repeatable && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    Repeatable
                                  </span>
                                )}
                              </div>
                              {group.repeatable && (
                                <button
                                  onClick={() => addGroupInstance(currentPageIndex, sectionIndex, groupIndex)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Group Instances */}
                          <div className="p-4 space-y-6">
                            {Array.from({ length: instances }).map((_, instanceIndex) => (
                              <div key={instanceIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                {group.repeatable && instances > 1 && (
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-700">
                                      Instance {instanceIndex + 1}
                                    </span>
                                    <button
                                      onClick={() => removeGroupInstance(currentPageIndex, sectionIndex, groupIndex, instanceIndex)}
                                      className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                )}

                                {/* Questions */}
                                {group.questions?.map((question, questionIndex) => {
                                  const fieldKey = generateFieldKey(currentPageIndex, sectionIndex, groupIndex, questionIndex, instanceIndex);
                                  return renderQuestion(question, fieldKey, currentPageIndex, sectionIndex, groupIndex, questionIndex);
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
          <div className="flex justify-center space-x-3 mb-4 flex-wrap gap-2">
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
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
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

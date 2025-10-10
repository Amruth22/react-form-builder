import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ChevronDown, ChevronUp, AlertCircle, FileType, MapPin, Info, Link } from 'lucide-react';
import { getAllQuestionsWithIds, generateQuestionId } from '../utils/formUtils';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

const QuestionEditor = ({ question, onSave, onCancel, formData: allFormData, currentPath }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer_type: 'text',
    required: false,
    options: [],
    validation: {},
    auto_detected: null,
    parent_question_id: null,
    show_when: null,
    sub_questions: [],
    applies_to: []
  });

  const [showValidation, setShowValidation] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showSubQuestions, setShowSubQuestions] = useState(false);
  const [availableParentQuestions, setAvailableParentQuestions] = useState([]);
  const [parentQuestionOptions, setParentQuestionOptions] = useState([]);

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        answer_type: question.answer_type || 'text',
        required: question.required || false,
        options: question.options || [],
        validation: question.validation || {},
        auto_detected: question.auto_detected || null,
        parent_question_id: question.parent_question_id || null,
        show_when: question.show_when || null,
        sub_questions: question.sub_questions || [],
        applies_to: question.applies_to || []
      });
    }

    // Load available parent questions (questions that appear before this one)
    if (allFormData && currentPath) {
      const allQuestions = getAllQuestionsWithIds(allFormData);
      const currentQuestionId = generateQuestionId(
        currentPath.pageIndex,
        currentPath.sectionIndex,
        currentPath.groupIndex,
        currentPath.questionIndex
      );

      // Filter to only questions that appear before this one
      const eligibleParents = allQuestions.filter(q => {
        // Questions must have options to be parents (radio, checkbox, dropdown)
        const hasOptions = ['radio', 'checkbox', 'dropdown'].includes(q.question.answer_type);
        // Must not be the current question
        const notSelf = q.id !== currentQuestionId;
        // Must not create circular dependency
        const notChild = q.question.parent_question_id !== currentQuestionId;

        return hasOptions && notSelf && notChild;
      });

      setAvailableParentQuestions(eligibleParents);
    }
  }, [question, allFormData, currentPath]);

  // Update parent question options when parent is selected
  useEffect(() => {
    if (formData.parent_question_id && allFormData) {
      const parentQ = availableParentQuestions.find(q => q.id === formData.parent_question_id);
      if (parentQ && parentQ.question.options) {
        setParentQuestionOptions(parentQ.question.options);
      } else {
        setParentQuestionOptions([]);
      }
    } else {
      setParentQuestionOptions([]);
    }
  }, [formData.parent_question_id, availableParentQuestions, allFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (typeof newOptions[index] === 'string') {
      // Convert string to object
      newOptions[index] = { value: newOptions[index], label: newOptions[index] };
    }
    newOptions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { value: '', label: '' }]
    }));
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAutoDetectedChange = (value) => {
    if (value === 'province_state') {
      // Auto-populate with US states
      setFormData(prev => ({
        ...prev,
        auto_detected: 'province_state',
        answer_type: 'dropdown',
        options: US_STATES.map(state => ({ value: state.toLowerCase().replace(/\s+/g, '_'), label: state }))
      }));
    } else if (value === 'canadian_province') {
      // Auto-populate with Canadian provinces
      setFormData(prev => ({
        ...prev,
        auto_detected: 'canadian_province',
        answer_type: 'dropdown',
        options: CANADIAN_PROVINCES.map(prov => ({ value: prov.toLowerCase().replace(/\s+/g, '_'), label: prov }))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        auto_detected: null
      }));
    }
  };

  const handleValidationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Clean up empty options
    const cleanedOptions = formData.options
      .filter(option => {
        if (typeof option === 'string') return option.trim();
        return option.value || option.label;
      })
      .map(option => {
        if (typeof option === 'string') {
          return { value: option, label: option };
        }
        return option;
      });

    const updatedQuestion = {
      ...formData,
      options: cleanedOptions
    };

    // Remove empty validation
    if (Object.keys(updatedQuestion.validation).length === 0) {
      delete updatedQuestion.validation;
    }

    onSave(updatedQuestion);
  };

  const questionTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'radio_multi_person', label: 'Multi-Person Question' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'file', label: 'File Upload' },
    { value: 'display_text', label: 'Display Text' }
  ];

  const PERSON_OPTIONS = [
    'applicant', 'spouse', 'employee', 'dependent', 'member', 'primary',
    'secondary', 'insured', 'owner', 'beneficiary', 'child', 'parent'
  ];

  const needsOptions = ['dropdown', 'radio', 'checkbox', 'radio_multi_person'].includes(formData.answer_type);
  const supportsValidation = ['text', 'number', 'email', 'tel', 'textarea'].includes(formData.answer_type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Edit Question</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* PDF Metadata Info (Read-only) */}
          {question.pdf_metadata && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-3">PDF Source Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {question.pdf_metadata.field_name && (
                      <div className="bg-white rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileType className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-medium text-gray-600">PDF Field Name</span>
                        </div>
                        <p className="text-sm font-mono text-gray-900">{question.pdf_metadata.field_name}</p>
                      </div>
                    )}
                    {question.pdf_metadata.page && (
                      <div className="bg-white rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-medium text-gray-600">Source Page</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Page {question.pdf_metadata.page}</p>
                      </div>
                    )}
                    {question.pdf_metadata.original_type && (
                      <div className="bg-white rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">Original Type</span>
                        </div>
                        <p className="text-sm text-gray-900 capitalize">{question.pdf_metadata.original_type}</p>
                      </div>
                    )}
                    {question.pdf_metadata.detected_type && (
                      <div className="bg-white rounded-lg p-3 border border-green-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">Auto-Detected</span>
                        </div>
                        <p className="text-sm font-semibold text-green-700 capitalize">
                          ✓ {question.pdf_metadata.detected_type}
                        </p>
                      </div>
                    )}
                  </div>
                  {question.pdf_metadata.coordinates && (
                    <div className="mt-3 text-xs text-indigo-700">
                      <span className="font-medium">Position:</span> X: {question.pdf_metadata.coordinates.x}, Y: {question.pdf_metadata.coordinates.y}
                    </div>
                  )}
                  <p className="text-xs text-indigo-600 mt-3">
                    💡 This information is extracted from the PDF and cannot be edited.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
              placeholder="Enter your question..."
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={formData.answer_type}
              onChange={(e) => handleInputChange('answer_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Detection */}
          {formData.answer_type === 'dropdown' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Auto-Detect Common Fields
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auto_detect"
                    checked={formData.auto_detected === 'province_state'}
                    onChange={() => handleAutoDetectedChange('province_state')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">US States (auto-populate 50 states)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auto_detect"
                    checked={formData.auto_detected === 'canadian_province'}
                    onChange={() => handleAutoDetectedChange('canadian_province')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Canadian Provinces (auto-populate 13 provinces/territories)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auto_detect"
                    checked={!formData.auto_detected}
                    onChange={() => handleAutoDetectedChange(null)}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Custom options (manual entry)</span>
                </label>
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => handleInputChange('required', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
              Required field
            </label>
          </div>

          {/* Options (for dropdown, radio, checkbox) */}
          {needsOptions && !formData.auto_detected && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <button
                  onClick={handleAddOption}
                  className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => {
                  const optionValue = typeof option === 'string' ? option : option.value || '';
                  const optionLabel = typeof option === 'string' ? option : option.label || '';
                  const requiresInput = typeof option === 'object' ? option.requires_input : false;
                  const inputType = typeof option === 'object' ? option.input_type || 'text' : 'text';

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={optionLabel}
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={`Option ${index + 1} label`}
                        />
                        <input
                          type="text"
                          value={optionValue}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={`Option ${index + 1} value`}
                        />
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Conditional Input */}
                      <div className="flex items-center space-x-4 pl-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={requiresInput}
                            onChange={(e) => handleOptionChange(index, 'requires_input', e.target.checked)}
                            className="h-4 w-4 text-primary-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Requires additional input (e.g., "Other: ___")
                          </span>
                        </label>
                        {requiresInput && (
                          <select
                            value={inputType}
                            onChange={(e) => handleOptionChange(index, 'input_type', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {formData.options.length === 0 && (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm">No options added yet</p>
                    <button
                      onClick={handleAddOption}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Add your first option
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto-detected Options Preview */}
          {formData.auto_detected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">Auto-populated options</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {formData.options.length} options have been automatically added.
                    To customize, select "Custom options" above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {supportsValidation && (
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setShowValidation(!showValidation)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Validation Rules</span>
                {showValidation ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showValidation && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  {/* Min/Max Length for text */}
                  {['text', 'textarea', 'email', 'tel'].includes(formData.answer_type) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          value={formData.validation.minLength || ''}
                          onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value) || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Length
                        </label>
                        <input
                          type="number"
                          value={formData.validation.maxLength || ''}
                          onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value) || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="No maximum"
                        />
                      </div>
                    </>
                  )}

                  {/* Min/Max Value for number */}
                  {formData.answer_type === 'number' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Value
                        </label>
                        <input
                          type="number"
                          value={formData.validation.min || ''}
                          onChange={(e) => handleValidationChange('min', parseFloat(e.target.value) || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Value
                        </label>
                        <input
                          type="number"
                          value={formData.validation.max || ''}
                          onChange={(e) => handleValidationChange('max', parseFloat(e.target.value) || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="No maximum"
                        />
                      </div>
                    </>
                  )}

                  {/* Pattern/Regex */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pattern (Regular Expression)
                    </label>
                    <input
                      type="text"
                      value={formData.validation.pattern || ''}
                      onChange={(e) => handleValidationChange('pattern', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="e.g., ^[A-Z0-9]+$"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a regular expression for custom validation
                    </p>
                  </div>

                  {/* Custom Error Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Error Message
                    </label>
                    <input
                      type="text"
                      value={formData.validation.errorMessage || ''}
                      onChange={(e) => handleValidationChange('errorMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="This field is invalid"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload Settings */}
          {formData.answer_type === 'file' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-purple-900">File Upload Settings</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted File Types
                </label>
                <input
                  type="text"
                  value={formData.validation?.accept || ''}
                  onChange={(e) => handleValidationChange('accept', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., .pdf,.doc,.docx,image/*"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to accept all file types
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={formData.validation?.maxSize || ''}
                  onChange={(e) => handleValidationChange('maxSize', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          )}

          {/* Question Dependencies */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Link className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Question Dependencies</span>
              </div>
              {showDependencies ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showDependencies && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Make this question conditional - it will only show when the parent question has a specific answer.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Question
                  </label>
                  <select
                    value={formData.parent_question_id || ''}
                    onChange={(e) => handleInputChange('parent_question_id', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No parent (always visible)</option>
                    {availableParentQuestions.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.question.question} ({q.pageTitle} → {q.sectionTitle} → {q.groupTitle})
                      </option>
                    ))}
                  </select>
                  {availableParentQuestions.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No eligible parent questions found. Parent questions must have options (radio, checkbox, or dropdown).
                    </p>
                  )}
                </div>

                {formData.parent_question_id && parentQuestionOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Show this question when parent answer is:
                    </label>
                    <div className="space-y-2">
                      {parentQuestionOptions.map((option, index) => {
                        const optionValue = typeof option === 'string' ? option : option.value || option.label || '';
                        const optionLabel = typeof option === 'string' ? option : option.label || option.value || '';
                        const isSelected = Array.isArray(formData.show_when)
                          ? formData.show_when.includes(optionValue)
                          : formData.show_when === optionValue;

                        return (
                          <label key={index} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add to array
                                  const newShowWhen = Array.isArray(formData.show_when)
                                    ? [...formData.show_when, optionValue]
                                    : [optionValue];
                                  handleInputChange('show_when', newShowWhen);
                                } else {
                                  // Remove from array
                                  const newShowWhen = Array.isArray(formData.show_when)
                                    ? formData.show_when.filter(v => v !== optionValue)
                                    : [];
                                  handleInputChange('show_when', newShowWhen.length > 0 ? newShowWhen : null);
                                }
                              }}
                              className="h-4 w-4 text-primary-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{optionLabel}</span>
                          </label>
                        );
                      })}
                    </div>

          {/* Multi-Person Settings */}
          {formData.answer_type === 'radio_multi_person' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-indigo-900">Multi-Person Question Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Who should answer this question? (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSON_OPTIONS.map(person => (
                    <label key={person} className="flex items-center p-2 border border-gray-200 rounded hover:bg-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applies_to.includes(person)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              applies_to: [...prev.applies_to, person]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              applies_to: prev.applies_to.filter(p => p !== person)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{person}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {formData.applies_to.length > 0 && formData.options.length > 0 && (
                <div className="border-t border-indigo-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Preview:</h5>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <p className="font-medium text-gray-900">{formData.question || 'Your question here'}</p>
                    {formData.applies_to.map(person => (
                      <div key={person} className="flex items-center space-x-3 pl-4">
                        <span className="text-sm font-medium text-gray-700 capitalize min-w-[100px]">{person}:</span>
                        <div className="flex items-center space-x-4">
                          {formData.options.map((option, idx) => {
                            const label = typeof option === 'string' ? option : option.label || option.value;
                            return (
                              <label key={idx} className="flex items-center space-x-2">
                                <input type="radio" name={`preview_${person}`} className="h-4 w-4" disabled />
                                <span className="text-sm text-gray-600">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.applies_to.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">Please select at least one person who should answer this question.</p>
                </div>
              )}
            </div>
          )}

                    <p className="text-xs text-gray-500 mt-2">
                      Select one or more values. This question will show when the parent has any of the selected answers.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sub-Questions */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setShowSubQuestions(!showSubQuestions)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ChevronDown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Sub-Questions</span>
                {formData.sub_questions && formData.sub_questions.length > 0 && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {formData.sub_questions.length}
                  </span>
                )}
              </div>
              {showSubQuestions ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSubQuestions && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Add sub-questions that belong to this question (e.g., "Applicant Name" with sub-questions for "First Name", "Last Name").
                  </p>
                </div>

                {formData.sub_questions && formData.sub_questions.length > 0 && (
                  <div className="space-y-2">
                    {formData.sub_questions.map((subQ, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm text-gray-700">{subQ.question || 'Untitled'}</span>
                        <span className="text-xs text-gray-500">{subQ.answer_type}</span>
                        <button
                          onClick={() => {
                            const newSubQuestions = formData.sub_questions.filter((_, i) => i !== index);
                            handleInputChange('sub_questions', newSubQuestions);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    const newSubQuestion = {
                      question: 'New Sub-Question',
                      answer_type: 'text',
                      required: false
                    };
                    handleInputChange('sub_questions', [...(formData.sub_questions || []), newSubQuestion]);
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Add Sub-Question
                </button>

                <p className="text-xs text-gray-500">
                  Note: Sub-questions are simplified and will inherit some properties from the parent question.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
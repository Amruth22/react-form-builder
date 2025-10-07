import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

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

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer_type: 'text',
    required: false,
    options: [],
    validation: {},
    auto_detected: null,
    applies_to: []
  });

  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        answer_type: question.answer_type || 'text',
        required: question.required || false,
        options: question.options || [],
        validation: question.validation || {},
        auto_detected: question.auto_detected || null,
        applies_to: question.applies_to || []
      });
    }
  }, [question]);

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
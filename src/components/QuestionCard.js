import React from 'react';
import {
  GripVertical,
  Edit3,
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
  FileType,
  ChevronRight,
  Users,
  MoveRight
} from 'lucide-react';

const QuestionCard = ({
  question,
  index,
  isDragging,
  dragHandleProps,
  sectionTitle,
  groupTitle,
  isRepeatable,
  onEdit,
  onDelete,
  onMove,
  allSections
}) => {
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
      radio_multi_person: Users,
      textarea: FileText,
      display_text: MessageSquare,
    };
    
    return iconMap[answerType] || Type;
  };

  const getQuestionTypeLabel = (answerType) => {
    const labelMap = {
      text: 'Text Input',
      email: 'Email',
      tel: 'Phone',
      date: 'Date',
      number: 'Number',
      dropdown: 'Dropdown',
      checkbox: 'Checkboxes',
      radio: 'Radio Buttons',
      radio_multi_person: 'Multi-Person Question',
      textarea: 'Long Text',
      display_text: 'Display Text',
    };
    
    return labelMap[answerType] || 'Text Input';
  };

  const Icon = getQuestionIcon(question.answer_type);

  return (
    <div className={`question-card group ${isDragging ? 'dragging' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="drag-handle flex-shrink-0 p-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Question Header */}
              <div className="flex items-center space-x-2 mb-2 flex-wrap">
                {/* Question Tag - Show Claude's field_name or PDF metadata field_name ONLY */}
                {(question.field_name || question.pdf_metadata?.field_name) && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono border-2 bg-indigo-600 text-white border-indigo-700">
                    {question.pdf_metadata?.field_name || question.field_name}
                  </span>
                )}
                {/* Question Label */}
                {question.question_label && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-300">
                    {question.question_label}
                  </span>
                )}
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-600">
                    {getQuestionTypeLabel(question.answer_type)}
                  </span>
                </div>
                {question.required && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
                {isRepeatable && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Repeatable
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-medium text-gray-900 mb-2 leading-tight">
                {question.question || 'Untitled Question'}
              </h3>

              {/* Multi-Person Applies To Badge */}
              {question.answer_type === 'radio_multi_person' && question.applies_to && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Applies to:</p>
                  <div className="flex flex-wrap gap-1">
                    {question.applies_to.map((person, personIndex) => (
                      <span
                        key={personIndex}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700"
                      >
                        {person.charAt(0).toUpperCase() + person.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Options Preview */}
              {question.options && question.options.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    {question.answer_type === 'radio_multi_person' ? 'Choices (for each person):' : 'Options:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {question.options.slice(0, 3).map((option, optIndex) => {
                      const optionLabel = typeof option === 'string' 
                        ? option 
                        : option.label || option.value || option;
                      
                      return (
                        <span
                          key={optIndex}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {optionLabel}
                        </span>
                      );
                    })}
                    {question.options.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                        +{question.options.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Metadata Tags */}
              {question.pdf_metadata && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {question.pdf_metadata.field_name && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <FileType className="w-3 h-3 mr-1" />
                      PDF: {question.pdf_metadata.field_name}
                    </span>
                  )}
                  {question.pdf_metadata.detected_type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      ✓ Auto-detected: {question.pdf_metadata.detected_type}
                    </span>
                  )}
                </div>
              )}

              {/* Validation Info */}
              {question.validation && Object.keys(question.validation).length > 0 && (
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Validation:</span> {question.validation.type || 'Custom'}
                </div>
              )}

              {/* Sub-Questions */}
              {question.sub_questions && question.sub_questions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Sub-questions ({question.sub_questions.length}):
                  </p>
                  <div className="pl-4 border-l-2 border-green-300 space-y-1.5">
                    {question.sub_questions.map((subQ, subIdx) => (
                      <div key={subIdx} className="flex items-center space-x-2 flex-wrap">
                        <ChevronRight className="w-3 h-3 text-green-600 flex-shrink-0" />
                        {/* Sub-Question Tag - Show field_name ONLY if from PDF or Claude */}
                        {(subQ.field_name || subQ.pdf_metadata?.field_name) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono border bg-indigo-500 text-white border-indigo-600">
                            {subQ.pdf_metadata?.field_name || subQ.field_name}
                          </span>
                        )}
                        <span className="text-sm text-gray-800">{subQ.question || 'Untitled'}</span>
                        <span className="text-xs text-gray-500">({subQ.answer_type})</span>
                        {subQ.required && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Required
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onMove && allSections && allSections.length > 1 && (
                <button
                  onClick={onMove}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Move to another section"
                >
                  <MoveRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                title="Edit question"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Number */}
      <div className="absolute -left-2 -top-2 w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {index + 1}
      </div>
    </div>
  );
};

export default QuestionCard;
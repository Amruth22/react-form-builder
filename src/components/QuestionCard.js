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
  MoveRight,
  Link
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
              {/* Question Header - Premium Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {/* Question Tag - Premium Badge with Gradient */}
                {(question.field_name || question.pdf_metadata?.field_name) && (
                  <span className="badge-field-name">
                    {question.pdf_metadata?.field_name || question.field_name}
                  </span>
                )}
                {/* Question Label - Soft Badge */}
                {question.question_label && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all duration-200 hover:bg-indigo-100">
                    {question.question_label}
                  </span>
                )}
                {/* Question Type with Icon - Gradient Background */}
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-700">
                    {getQuestionTypeLabel(question.answer_type)}
                  </span>
                </div>
                {/* Required Badge - Gradient */}
                {question.required && (
                  <span className="badge-required">
                    Required
                  </span>
                )}
                {/* Repeatable Badge - Warning Gradient */}
                {isRepeatable && (
                  <span className="badge-warning">
                    Repeatable
                  </span>
                )}
              </div>

              {/* Question Text - Enhanced Typography */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-indigo-900 transition-colors duration-200">
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
                  <div className="flex flex-wrap gap-2">
                    {question.options.slice(0, 3).map((option, optIndex) => {
                      const optionLabel = typeof option === 'string'
                        ? option
                        : option.label || option.value || option;
                      const optionFieldName = typeof option === 'object' ? option.field_name : null;

                      return (
                        <div key={optIndex} className="inline-flex items-center gap-1">
                          {optionFieldName && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold font-mono bg-indigo-500 text-white border border-indigo-600">
                              {optionFieldName}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {optionLabel}
                          </span>
                        </div>
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

              {/* Parent Question Dependency */}
              {question.parent_question_id && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
                    title={question.parent_question_text ? `Depends on: ${question.parent_question_text}` : 'Has parent question dependency'}
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Parent Question
                  </span>
                  {question.parent_question_tag && (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-bold font-mono bg-indigo-600 text-white border border-indigo-700"
                      title={question.parent_question_text || 'Parent question tag'}
                    >
                      {question.parent_question_tag}
                    </span>
                  )}
                </div>
              )}

              {/* Length and Validation Info */}
              {(question.length || (question.validation && Object.keys(question.validation).length > 0)) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {question.length && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Length: {question.length} chars
                    </span>
                  )}
                  {question.validation?.minLength && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Min Length: {question.validation.minLength}
                    </span>
                  )}
                  {question.validation?.maxLength && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Max Length: {question.validation.maxLength}
                    </span>
                  )}
                  {question.validation?.min && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Min Value: {question.validation.min}
                    </span>
                  )}
                  {question.validation?.max && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Max Value: {question.validation.max}
                    </span>
                  )}
                  {question.validation?.pattern && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Pattern: {question.validation.pattern}
                    </span>
                  )}
                  {question.validation?.accept && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      File Types: {question.validation.accept}
                    </span>
                  )}
                  {question.validation?.maxSize && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Max Size: {question.validation.maxSize}MB
                    </span>
                  )}
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

            {/* Actions - Premium Icon Buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
              {onMove && allSections && allSections.length > 1 && (
                <button
                  onClick={onMove}
                  className="btn-icon btn-icon-move"
                  title="Move to another section"
                >
                  <MoveRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="btn-icon btn-icon-edit"
                title="Edit question"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="btn-icon btn-icon-delete"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Number - Premium Badge with Gradient */}
      <div className="absolute -left-3 -top-3 w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        {index + 1}
      </div>
    </div>
  );
};

export default QuestionCard;
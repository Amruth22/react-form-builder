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
  allSections,
  formData
}) => {

  // Helper function to find parent question by ID
  const findParentQuestion = (parentId) => {
    if (!formData || !formData.pages || !parentId) return null;

    // Search through all sections and groups to find the parent question
    // Note: After section merging, all pages are in pages[0] but question_ids still reference original page numbers
    for (const page of formData.pages) {
      for (const section of page.sections || []) {
        for (const group of section.groups || []) {
          for (const q of group.questions || []) {
            if (q.question_id === parentId) {
              return {
                question: q.question,
                fieldName: q.pdf_metadata?.field_name || q.field_name,
                questionId: q.question_id
              };
            }
          }
        }
      }
    }

    return null;
  };

  // Get parent question info if this question has a parent
  const parentInfo = question.parent_question_id ? findParentQuestion(question.parent_question_id) : null;
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
                {/* Question Tag - ONLY show question's OWN field_name, never steal from options */}
                {(() => {
                  const questionFieldName = question.pdf_metadata?.field_name || question.field_name;

                  return questionFieldName && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono border-2 bg-indigo-600 text-white border-indigo-700">
                      {questionFieldName}
                    </span>
                  );
                })()}
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

              {/* Options Preview - Show ALL options (including single option) with field_names */}
              {question.options && question.options.length > 0 && (
                <div className="mb-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
                  <p className="text-sm font-bold text-gray-800 mb-2">
                    {question.answer_type === 'radio_multi_person' ? 'Choices (for each person):' : 'Options:'} ({question.options.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option, optIndex) => {
                      const optionLabel = typeof option === 'string'
                        ? option
                        : option.label || option.value || option;
                      const optionFieldName = typeof option === 'object' ? option.field_name : null;

                      return (
                        <div key={optIndex} className="inline-flex items-center gap-2 bg-white border-2 border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                          {optionFieldName ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-600 text-white">
                              {optionFieldName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-300 text-orange-800">
                              NO TAG
                            </span>
                          )}
                          <span className="text-sm font-semibold text-gray-900">
                            {optionLabel}
                          </span>
                        </div>
                      );
                    })}
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
                    title={parentInfo ? `Depends on: ${parentInfo.question}` : 'Has parent question dependency'}
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Parent Question
                  </span>
                  {parentInfo ? (
                    parentInfo.fieldName ? (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-bold font-mono bg-indigo-600 text-white border border-indigo-700"
                        title={`Parent: ${parentInfo.question}`}
                      >
                        {parentInfo.fieldName}
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300"
                        title={`Parent question: ${parentInfo.question}`}
                      >
                        {parentInfo.questionId}
                      </span>
                    )
                  ) : (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300"
                      title="Parent question not found in form"
                    >
                      ⚠ Parent not found
                    </span>
                  )}
                  {question.show_when && (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-300"
                      title="Shows when parent value is"
                    >
                      Show when: {Array.isArray(question.show_when) ? question.show_when.join(' or ') : question.show_when}
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

              {/* Sub-Questions - ALWAYS show field_name tags */}
              {question.sub_questions && question.sub_questions.length > 0 && (
                <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-lg p-3">
                  <p className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 text-green-600 mr-1" />
                    Sub-questions ({question.sub_questions.length})
                  </p>
                  <div className="space-y-2">
                    {question.sub_questions.map((subQ, subIdx) => {
                      const subFieldName = subQ.pdf_metadata?.field_name || subQ.field_name;
                      return (
                        <div key={subIdx} className="flex items-center gap-2 flex-wrap bg-white rounded-lg px-3 py-2 border border-green-200">
                          {/* ALWAYS show sub-question tag if available */}
                          {subFieldName ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-600 text-white">
                              {subFieldName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-300 text-gray-600">
                              NO TAG
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">{subQ.question || 'Untitled'}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">({subQ.answer_type})</span>
                          {subQ.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Required
                            </span>
                          )}
                        </div>
                      );
                    })}
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
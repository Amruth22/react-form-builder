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
  Users
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
  onDelete
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
              <div className="flex items-center space-x-3 mb-2 flex-wrap">
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
                {sectionTitle && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {sectionTitle}
                  </span>
                )}
                {groupTitle && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {groupTitle}
                  </span>
                )}
                {isRepeatable && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    In Repeatable Group
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

              {/* Validation Info */}
              {question.validation && Object.keys(question.validation).length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Validation:</span> {question.validation.type || 'Custom'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
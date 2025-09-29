import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Download, Plus, Trash2, Edit3, GripVertical } from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionEditor from './QuestionEditor';
import HtmlExporter from '../utils/HtmlExporter';

const FormBuilder = ({ formData, onFormDataChange, onExportHtml }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const currentPage = formData?.pages?.[selectedPageIndex];
  const questions = currentPage?.form_elements || [];

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Reorder questions
    const newQuestions = Array.from(questions);
    const [removed] = newQuestions.splice(sourceIndex, 1);
    newQuestions.splice(destinationIndex, 0, removed);

    // Update form data
    const newFormData = {
      ...formData,
      pages: formData.pages.map((page, index) => 
        index === selectedPageIndex 
          ? { ...page, form_elements: newQuestions }
          : page
      )
    };

    onFormDataChange(newFormData);
  }, [questions, formData, selectedPageIndex, onFormDataChange]);

  const handleQuestionUpdate = useCallback((questionIndex, updatedQuestion) => {
    const newQuestions = questions.map((q, index) => 
      index === questionIndex ? updatedQuestion : q
    );

    const newFormData = {
      ...formData,
      pages: formData.pages.map((page, index) => 
        index === selectedPageIndex 
          ? { ...page, form_elements: newQuestions }
          : page
      )
    };

    onFormDataChange(newFormData);
    setEditingQuestion(null);
  }, [questions, formData, selectedPageIndex, onFormDataChange]);

  const handleQuestionDelete = useCallback((questionIndex) => {
    const newQuestions = questions.filter((_, index) => index !== questionIndex);

    const newFormData = {
      ...formData,
      pages: formData.pages.map((page, index) => 
        index === selectedPageIndex 
          ? { ...page, form_elements: newQuestions }
          : page
      )
    };

    onFormDataChange(newFormData);
  }, [questions, formData, selectedPageIndex, onFormDataChange]);

  const handleAddQuestion = useCallback(() => {
    const newQuestion = {
      question: 'New Question',
      answer_type: 'text',
      required: false,
      options: []
    };

    const newQuestions = [...questions, newQuestion];

    const newFormData = {
      ...formData,
      pages: formData.pages.map((page, index) => 
        index === selectedPageIndex 
          ? { ...page, form_elements: newQuestions }
          : page
      )
    };

    onFormDataChange(newFormData);
  }, [questions, formData, selectedPageIndex, onFormDataChange]);

  const handleExport = useCallback(() => {
    const htmlContent = HtmlExporter.generateHtml(formData);
    onExportHtml(htmlContent);
  }, [formData, onExportHtml]);

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No form data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formData.document_info?.source_pdf || 'Form Builder'}
            </h1>
            <p className="text-gray-600 mt-1">
              {formData.document_info?.total_form_elements || 0} questions across {formData.pages?.length || 0} pages
            </p>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Pages */}
        {formData.pages && formData.pages.length > 1 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Pages</h3>
              <div className="space-y-2">
                {formData.pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPageIndex(index)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors duration-200
                      ${selectedPageIndex === index 
                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <div className="font-medium">Page {page.page_number}</div>
                    <div className="text-sm opacity-75">
                      {page.form_elements?.length || 0} questions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={formData.pages && formData.pages.length > 1 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Page Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Page {currentPage?.page_number || 1}
                </h2>
                <button
                  onClick={handleAddQuestion}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-4">Add your first question to get started</p>
                  <button
                    onClick={handleAddQuestion}
                    className="btn-primary"
                  >
                    Add Question
                  </button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-4' : ''}`}
                      >
                        {questions.map((question, index) => (
                          <Draggable
                            key={`question-${index}`}
                            draggableId={`question-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group ${snapshot.isDragging ? 'z-50' : ''}`}
                              >
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  isDragging={snapshot.isDragging}
                                  dragHandleProps={provided.dragHandleProps}
                                  onEdit={() => setEditingQuestion({ question, index })}
                                  onDelete={() => handleQuestionDelete(index)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion.question}
          onSave={(updatedQuestion) => handleQuestionUpdate(editingQuestion.index, updatedQuestion)}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

export default FormBuilder;
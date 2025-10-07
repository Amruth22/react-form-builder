import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Download, Plus, Trash2, Edit3, GripVertical,
  ChevronDown, ChevronRight, Layers, FolderOpen,
  FileText, Copy
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionEditor from './QuestionEditor';
import HtmlExporter from '../utils/HtmlExporter';
import { calculateTotalQuestions } from '../utils/formUtils';

const FormBuilder = ({ formData, onFormDataChange, onExportHtml }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const currentPage = formData?.pages?.[selectedPageIndex];

  const toggleSection = useCallback((sectionIndex) => {
    setCollapsedSections(prev => ({
      ...prev,
      [`${selectedPageIndex}-${sectionIndex}`]: !prev[`${selectedPageIndex}-${sectionIndex}`]
    }));
  }, [selectedPageIndex]);

  const toggleGroup = useCallback((sectionIndex, groupIndex) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [`${selectedPageIndex}-${sectionIndex}-${groupIndex}`]: !prev[`${selectedPageIndex}-${sectionIndex}-${groupIndex}`]
    }));
  }, [selectedPageIndex]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

    // Handle page reordering
    if (type === 'page') {
      const [movedPage] = newFormData.pages.splice(source.index, 1);
      newFormData.pages.splice(destination.index, 0, movedPage);
      
      // Update selected page index to follow the moved page
      if (selectedPageIndex === source.index) {
        setSelectedPageIndex(destination.index);
      } else if (selectedPageIndex > source.index && selectedPageIndex <= destination.index) {
        setSelectedPageIndex(selectedPageIndex - 1);
      } else if (selectedPageIndex < source.index && selectedPageIndex >= destination.index) {
        setSelectedPageIndex(selectedPageIndex + 1);
      }
      
      onFormDataChange(newFormData);
      return;
    }

    // Parse droppable IDs for other types
    const parseDroppableId = (id) => {
      const parts = id.split('-');
      return {
        pageIndex: parseInt(parts[1]),
        sectionIndex: parts[3] ? parseInt(parts[3]) : null,
        groupIndex: parts[5] ? parseInt(parts[5]) : null
      };
    };

    const sourcePath = parseDroppableId(source.droppableId);
    const destPath = parseDroppableId(destination.droppableId);

    if (type === 'question') {
      // Move question
      const sourceQuestion = newFormData.pages[sourcePath.pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[sourcePath.groupIndex]
        .questions[source.index];

      // Remove from source
      newFormData.pages[sourcePath.pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[sourcePath.groupIndex]
        .questions.splice(source.index, 1);

      // Add to destination
      newFormData.pages[destPath.pageIndex]
        .sections[destPath.sectionIndex]
        .groups[destPath.groupIndex]
        .questions.splice(destination.index, 0, sourceQuestion);

    } else if (type === 'group') {
      // Move group
      const sourceGroup = newFormData.pages[sourcePath.pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[source.index];

      // Remove from source
      newFormData.pages[sourcePath.pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups.splice(source.index, 1);

      // Add to destination
      newFormData.pages[destPath.pageIndex]
        .sections[destPath.sectionIndex]
        .groups.splice(destination.index, 0, sourceGroup);

    } else if (type === 'section') {
      // Move section
      const sourceSection = newFormData.pages[sourcePath.pageIndex]
        .sections[source.index];

      // Remove from source
      newFormData.pages[sourcePath.pageIndex]
        .sections.splice(source.index, 1);

      // Add to destination
      newFormData.pages[destPath.pageIndex]
        .sections.splice(destination.index, 0, sourceSection);
    }

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedPageIndex]);

  const handleQuestionUpdate = useCallback((path, updatedQuestion) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[path.pageIndex]
      .sections[path.sectionIndex]
      .groups[path.groupIndex]
      .questions[path.questionIndex] = updatedQuestion;

    onFormDataChange(newFormData);
    setEditingQuestion(null);
  }, [formData, onFormDataChange]);

  const handleQuestionDelete = useCallback((path) => {
    if (!window.confirm('Delete this question?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[path.pageIndex]
      .sections[path.sectionIndex]
      .groups[path.groupIndex]
      .questions.splice(path.questionIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedPageIndex]);

  const handleAddQuestion = useCallback((pageIndex, sectionIndex, groupIndex) => {
    const newQuestion = {
      question: 'New Question',
      answer_type: 'text',
      required: false,
      options: []
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[pageIndex]
      .sections[sectionIndex]
      .groups[groupIndex]
      .questions.push(newQuestion);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedPageIndex]);

  const handleAddSection = useCallback(() => {
    const newSection = {
      title: 'New Section',
      groups: [
        {
          title: 'New Group',
          repeatable: false,
          questions: []
        }
      ]
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[selectedPageIndex].sections.push(newSection);

    onFormDataChange(newFormData);
  }, [formData, selectedPageIndex, onFormDataChange]);

  const handleAddPage = useCallback(() => {
    const newPage = {
      title: `Page ${formData.pages.length + 1}`,
      page_number: formData.pages.length + 1,
      sections: [
        {
          title: 'New Section',
          groups: [
            {
              title: 'New Group',
              repeatable: false,
              questions: []
            }
          ]
        }
      ]
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages.push(newPage);

    onFormDataChange(newFormData);
    setSelectedPageIndex(newFormData.pages.length - 1);
  }, [formData, onFormDataChange]);

  const handleDeletePage = useCallback((pageIndex) => {
    if (formData.pages.length <= 1) {
      alert('Cannot delete the last page');
      return;
    }

    if (!window.confirm('Delete this page and all its content?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages.splice(pageIndex, 1);

    // Adjust selected page index
    if (selectedPageIndex >= newFormData.pages.length) {
      setSelectedPageIndex(newFormData.pages.length - 1);
    }

    onFormDataChange(newFormData);
  }, [formData, selectedPageIndex, onFormDataChange]);

  const handleAddGroup = useCallback((sectionIndex) => {
    const newGroup = {
      title: 'New Group',
      repeatable: false,
      questions: []
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[selectedPageIndex].sections[sectionIndex].groups.push(newGroup);

    onFormDataChange(newFormData);
  }, [formData, selectedPageIndex, onFormDataChange]);

  const handleGroupUpdate = useCallback((path, updatedGroup) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[path.pageIndex]
      .sections[path.sectionIndex]
      .groups[path.groupIndex] = {
        ...newFormData.pages[path.pageIndex].sections[path.sectionIndex].groups[path.groupIndex],
        ...updatedGroup
      };

    onFormDataChange(newFormData);
    setEditingGroup(null);
  }, [formData, onFormDataChange]);

  const handleSectionUpdate = useCallback((path, updatedSection) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[path.pageIndex].sections[path.sectionIndex] = {
      ...newFormData.pages[path.pageIndex].sections[path.sectionIndex],
      ...updatedSection
    };

    onFormDataChange(newFormData);
    setEditingSection(null);
  }, [formData, onFormDataChange]);

  const handleDeleteGroup = useCallback((pageIndex, sectionIndex, groupIndex) => {
    if (!window.confirm('Delete this group and all its questions?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[pageIndex].sections[sectionIndex].groups.splice(groupIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedPageIndex]);

  const handleDeleteSection = useCallback((pageIndex, sectionIndex) => {
    if (!window.confirm('Delete this section and all its groups/questions?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[pageIndex].sections.splice(sectionIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedPageIndex]);

  const handleExport = useCallback(() => {
    const htmlContent = HtmlExporter.generateHtml(formData);
    onExportHtml(htmlContent);
  }, [formData, onExportHtml]);

  const handleExportJson = useCallback(() => {
    // Create a formatted JSON string
    const jsonString = JSON.stringify(formData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData?.document_info?.source_pdf || 'form'}_structure.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData]);

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No form data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formData.document_info?.source_pdf || 'Form Builder'}
            </h1>
            <p className="text-gray-600 mt-1">
              {calculateTotalQuestions(formData)} questions across {formData.pages?.length || 0} pages
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddPage}
              className="btn-secondary flex items-center space-x-2"
              title="Add new page"
            >
              <Plus className="w-4 h-4" />
              <span>Add Page</span>
            </button>
            <button
              onClick={handleExportJson}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={handleExport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Pages */}
        {formData.pages && formData.pages.length >= 1 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Pages</h3>
                <button
                  onClick={handleAddPage}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Add new page"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pages-sidebar" type="page">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {formData.pages.map((page, index) => (
                        <Draggable
                          key={`page-${index}`}
                          draggableId={`page-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                group relative rounded-lg transition-all duration-200
                                ${snapshot.isDragging 
                                  ? 'shadow-lg scale-105 bg-primary-100 border-primary-300' 
                                  : selectedPageIndex === index
                                    ? 'bg-primary-100 border border-primary-200'
                                    : 'hover:bg-gray-100 border border-transparent'
                                }
                              `}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="px-2 py-3 cursor-grab active:cursor-grabbing"
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </div>
                                <button
                                  onClick={() => setSelectedPageIndex(index)}
                                  className="flex-1 text-left py-2 pr-3"
                                >
                                  <div className={`font-medium ${
                                    selectedPageIndex === index ? 'text-primary-700' : 'text-gray-700'
                                  }`}>
                                    {page.title || `Page ${page.page_number || index + 1}`}
                                  </div>
                                  <div className="text-sm opacity-75">
                                    {page.sections?.length || 0} sections
                                  </div>
                                </button>
                                {formData.pages.length > 1 && (
                                  <button
                                    onClick={() => handleDeletePage(index)}
                                    className="p-2 mr-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete page"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={formData.pages && formData.pages.length >= 1 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Page Header */}
            <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentPage?.title || `Page ${currentPage?.page_number || selectedPageIndex + 1}`}
                </h2>
                <button
                  onClick={handleAddSection}
                  className="btn-primary flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="p-6">
              {currentPage?.sections?.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600 mb-4">Add your first section to get started</p>
                  <button onClick={handleAddSection} className="btn-primary">
                    Add Section
                  </button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={`page-${selectedPageIndex}`} type="section">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-6"
                      >
                        {currentPage.sections.map((section, sectionIndex) => (
                          <Draggable
                            key={`section-${sectionIndex}`}
                            draggableId={`section-${sectionIndex}`}
                            index={sectionIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-2 rounded-lg ${snapshot.isDragging ? 'border-primary-400 shadow-lg' : 'border-gray-200'}`}
                              >
                                {/* Section Header */}
                                <div className="bg-gray-50 border-b border-gray-200 p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                      </div>
                                      <button
                                        onClick={() => toggleSection(sectionIndex)}
                                        className="text-gray-600 hover:text-gray-900"
                                      >
                                        {collapsedSections[`${selectedPageIndex}-${sectionIndex}`] ? (
                                          <ChevronRight className="w-5 h-5" />
                                        ) : (
                                          <ChevronDown className="w-5 h-5" />
                                        )}
                                      </button>
                                      <Layers className="w-5 h-5 text-primary-600" />
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {section.title}
                                      </h3>
                                      <span className="text-sm text-gray-500">
                                        ({section.groups?.length || 0} groups)
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setEditingSection({ section, path: { pageIndex: selectedPageIndex, sectionIndex } })}
                                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleAddGroup(sectionIndex)}
                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSection(selectedPageIndex, sectionIndex)}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Groups */}
                                {!collapsedSections[`${selectedPageIndex}-${sectionIndex}`] && (
                                  <div className="p-4">
                                    <Droppable droppableId={`page-${selectedPageIndex}-section-${sectionIndex}`} type="group">
                                      {(provided) => (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="space-y-4"
                                        >
                                          {section.groups?.map((group, groupIndex) => (
                                            <Draggable
                                              key={`group-${groupIndex}`}
                                              draggableId={`group-${sectionIndex}-${groupIndex}`}
                                              index={groupIndex}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className={`border rounded-lg ${snapshot.isDragging ? 'border-primary-400 shadow-md' : 'border-gray-200'}`}
                                                >
                                                  {/* Group Header */}
                                                  <div className="bg-blue-50 border-b border-blue-200 p-3">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center space-x-3 flex-1">
                                                        <div {...provided.dragHandleProps} className="cursor-grab">
                                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <button
                                                          onClick={() => toggleGroup(sectionIndex, groupIndex)}
                                                          className="text-gray-600 hover:text-gray-900"
                                                        >
                                                          {collapsedGroups[`${selectedPageIndex}-${sectionIndex}-${groupIndex}`] ? (
                                                            <ChevronRight className="w-4 h-4" />
                                                          ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                          )}
                                                        </button>
                                                        <FolderOpen className="w-4 h-4 text-blue-600" />
                                                        <span className="font-medium text-gray-900">
                                                          {group.title}
                                                        </span>
                                                        {group.repeatable && (
                                                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                            <Copy className="w-3 h-3 inline mr-1" />
                                                            Repeatable
                                                          </span>
                                                        )}
                                                        <span className="text-sm text-gray-500">
                                                          ({group.questions?.length || 0} questions)
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center space-x-2">
                                                        <button
                                                          onClick={() => setEditingGroup({ group, path: { pageIndex: selectedPageIndex, sectionIndex, groupIndex } })}
                                                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50"
                                                        >
                                                          <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleAddQuestion(selectedPageIndex, sectionIndex, groupIndex)}
                                                          className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                                                        >
                                                          <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteGroup(selectedPageIndex, sectionIndex, groupIndex)}
                                                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Questions */}
                                                  {!collapsedGroups[`${selectedPageIndex}-${sectionIndex}-${groupIndex}`] && (
                                                    <div className="p-3">
                                                      {group.questions?.length === 0 ? (
                                                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                          <p className="text-sm text-gray-500 mb-2">No questions yet</p>
                                                          <button
                                                            onClick={() => handleAddQuestion(selectedPageIndex, sectionIndex, groupIndex)}
                                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                          >
                                                            Add Question
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <Droppable
                                                          droppableId={`page-${selectedPageIndex}-section-${sectionIndex}-group-${groupIndex}`}
                                                          type="question"
                                                        >
                                                          {(provided) => (
                                                            <div
                                                              {...provided.droppableProps}
                                                              ref={provided.innerRef}
                                                              className="space-y-3"
                                                            >
                                                              {group.questions.map((question, questionIndex) => (
                                                                <Draggable
                                                                  key={`question-${questionIndex}`}
                                                                  draggableId={`question-${sectionIndex}-${groupIndex}-${questionIndex}`}
                                                                  index={questionIndex}
                                                                >
                                                                  {(provided, snapshot) => (
                                                                    <div
                                                                      ref={provided.innerRef}
                                                                      {...provided.draggableProps}
                                                                    >
                                                                      <QuestionCard
                                                                        question={question}
                                                                        index={questionIndex}
                                                                        isDragging={snapshot.isDragging}
                                                                        dragHandleProps={provided.dragHandleProps}
                                                                        sectionTitle={section.title}
                                                                        groupTitle={group.title}
                                                                        isRepeatable={group.repeatable}
                                                                        onEdit={() => setEditingQuestion({
                                                                          question,
                                                                          path: { pageIndex: selectedPageIndex, sectionIndex, groupIndex, questionIndex }
                                                                        })}
                                                                        onDelete={() => handleQuestionDelete({
                                                                          pageIndex: selectedPageIndex,
                                                                          sectionIndex,
                                                                          groupIndex,
                                                                          questionIndex
                                                                        })}
                                                                      />
                                                                    </div>
                                                                  )}
                                                                </Draggable>
                                                              ))}
                                                              {provided.placeholder}
                                                            </div>
                                                          )}
                                                        </Droppable>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </div>
                                )}
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
          formData={formData}
          currentPath={editingQuestion.path}
          onSave={(updatedQuestion) => handleQuestionUpdate(editingQuestion.path, updatedQuestion)}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      {/* Group Editor Modal */}
      {editingGroup && (
        <GroupEditor
          group={editingGroup.group}
          onSave={(updatedGroup) => handleGroupUpdate(editingGroup.path, updatedGroup)}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection.section}
          onSave={(updatedSection) => handleSectionUpdate(editingSection.path, updatedSection)}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};

// Group Editor Component
const GroupEditor = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: group.title || '',
    repeatable: group.repeatable || false
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Group</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="repeatable"
              checked={formData.repeatable}
              onChange={(e) => setFormData({ ...formData, repeatable: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded"
            />
            <label htmlFor="repeatable" className="ml-2 text-sm text-gray-700">
              Repeatable group (users can add multiple instances)
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Section Editor Component
const SectionEditor = ({ section, onSave, onCancel }) => {
  const [title, setTitle] = useState(section.title || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={() => onSave({ title })} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
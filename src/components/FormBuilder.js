import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Download, Plus, Trash2, Edit3, GripVertical,
  ChevronDown, ChevronRight, Layers, FolderOpen,
  FileText, Copy, FileSpreadsheet, Maximize2, Minimize2
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionEditor from './QuestionEditor';
import HtmlExporter from '../utils/HtmlExporter';
import ExcelExporter from '../utils/ExcelExporter';
import { calculateTotalQuestions } from '../utils/formUtils';

const FormBuilder = ({ formData, onFormDataChange, onExportHtml }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null); // null = show all sections
  const [collapsedSections, setCollapsedSections] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'single'

  // Always use first page (since we merged all sections into one page)
  const currentPage = formData?.pages?.[0];
  const allSections = currentPage?.sections || [];
  const currentSection = selectedSectionIndex !== null ? allSections[selectedSectionIndex] : null;

  // Initialize all sections and groups as collapsed
  React.useEffect(() => {
    if (formData && formData.pages && !isInitialized) {
      const newCollapsedSections = {};
      const newCollapsedGroups = {};

      // Since we merged all into one page, use page index 0
      const page = formData.pages[0];
      page?.sections?.forEach((section, sectionIndex) => {
        // Collapse all sections by default
        newCollapsedSections[`${sectionIndex}`] = true;

        // Collapse all groups
        section.groups?.forEach((group, groupIndex) => {
          newCollapsedGroups[`${sectionIndex}-${groupIndex}`] = true;
        });
      });

      setCollapsedSections(newCollapsedSections);
      setCollapsedGroups(newCollapsedGroups);
      setIsInitialized(true);
    }
  }, [formData, isInitialized]);

  const toggleSection = useCallback((sectionIndex) => {
    setCollapsedSections(prev => ({
      ...prev,
      [`${sectionIndex}`]: !prev[`${sectionIndex}`]
    }));
  }, []);

  const toggleGroup = useCallback((sectionIndex, groupIndex) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [`${sectionIndex}-${groupIndex}`]: !prev[`${sectionIndex}-${groupIndex}`]
    }));
  }, []);

  const expandAll = useCallback(() => {
    if (!currentPage) return;

    const newCollapsedSections = {};
    const newCollapsedGroups = {};

    currentPage.sections?.forEach((section, sectionIndex) => {
      newCollapsedSections[`${sectionIndex}`] = false;
      section.groups?.forEach((group, groupIndex) => {
        newCollapsedGroups[`${sectionIndex}-${groupIndex}`] = false;
      });
    });

    setCollapsedSections(prev => ({ ...prev, ...newCollapsedSections }));
    setCollapsedGroups(prev => ({ ...prev, ...newCollapsedGroups }));
  }, [currentPage]);

  const collapseAll = useCallback(() => {
    if (!currentPage) return;

    const newCollapsedSections = {};
    const newCollapsedGroups = {};

    currentPage.sections?.forEach((section, sectionIndex) => {
      newCollapsedSections[`${sectionIndex}`] = true;
      section.groups?.forEach((group, groupIndex) => {
        newCollapsedGroups[`${sectionIndex}-${groupIndex}`] = true;
      });
    });

    setCollapsedSections(prev => ({ ...prev, ...newCollapsedSections }));
    setCollapsedGroups(prev => ({ ...prev, ...newCollapsedGroups }));
  }, [currentPage]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
    const pageIndex = 0; // Always use first page (sections are merged)

    // Handle section reordering
    if (type === 'section') {
      const [movedSection] = newFormData.pages[pageIndex].sections.splice(source.index, 1);
      newFormData.pages[pageIndex].sections.splice(destination.index, 0, movedSection);

      // Update selected section index to follow the moved section
      if (selectedSectionIndex === source.index) {
        setSelectedSectionIndex(destination.index);
      } else if (selectedSectionIndex > source.index && selectedSectionIndex <= destination.index) {
        setSelectedSectionIndex(selectedSectionIndex - 1);
      } else if (selectedSectionIndex < source.index && selectedSectionIndex >= destination.index) {
        setSelectedSectionIndex(selectedSectionIndex + 1);
      }

      onFormDataChange(newFormData);
      return;
    }

    // Parse droppable IDs for other types (simplified - no pageIndex needed)
    const parseDroppableId = (id) => {
      const parts = id.split('-');
      return {
        sectionIndex: parts[1] ? parseInt(parts[1]) : null,
        groupIndex: parts[3] ? parseInt(parts[3]) : null
      };
    };

    const sourcePath = parseDroppableId(source.droppableId);
    const destPath = parseDroppableId(destination.droppableId);

    if (type === 'question') {
      // Move question between groups/sections
      const sourceQuestion = newFormData.pages[pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[sourcePath.groupIndex]
        .questions[source.index];

      // Remove from source
      newFormData.pages[pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[sourcePath.groupIndex]
        .questions.splice(source.index, 1);

      // Add to destination
      newFormData.pages[pageIndex]
        .sections[destPath.sectionIndex]
        .groups[destPath.groupIndex]
        .questions.splice(destination.index, 0, sourceQuestion);

    } else if (type === 'group') {
      // Move group between sections
      const sourceGroup = newFormData.pages[pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups[source.index];

      // Remove from source
      newFormData.pages[pageIndex]
        .sections[sourcePath.sectionIndex]
        .groups.splice(source.index, 1);

      // Add to destination
      newFormData.pages[pageIndex]
        .sections[destPath.sectionIndex]
        .groups.splice(destination.index, 0, sourceGroup);
    }

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange, selectedSectionIndex]);

  const handleQuestionUpdate = useCallback((path, updatedQuestion) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    // Always use pageIndex 0 since sections are merged
    newFormData.pages[0]
      .sections[path.sectionIndex]
      .groups[path.groupIndex]
      .questions[path.questionIndex] = updatedQuestion;

    onFormDataChange(newFormData);
    setEditingQuestion(null);
  }, [formData, onFormDataChange]);

  const handleQuestionDelete = useCallback((path) => {
    if (!window.confirm('Delete this question?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    // Always use pageIndex 0 since sections are merged
    newFormData.pages[0]
      .sections[path.sectionIndex]
      .groups[path.groupIndex]
      .questions.splice(path.questionIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

  const handleAddQuestion = useCallback((sectionIndex, groupIndex) => {
    const newQuestion = {
      question: 'New Question',
      answer_type: 'text',
      required: false,
      options: []
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0]
      .sections[sectionIndex]
      .groups[groupIndex]
      .questions.push(newQuestion);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

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
    newFormData.pages[0].sections.push(newSection);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

  // Removed handleAddPage - no longer needed with section-based navigation

  // Removed handleDeletePage - no longer needed with section-based navigation

  const handleAddGroup = useCallback((sectionIndex) => {
    const newGroup = {
      title: 'New Group',
      repeatable: false,
      questions: []
    };

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0].sections[sectionIndex].groups.push(newGroup);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

  const handleGroupUpdate = useCallback((path, updatedGroup) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0]
      .sections[path.sectionIndex]
      .groups[path.groupIndex] = {
        ...newFormData.pages[0].sections[path.sectionIndex].groups[path.groupIndex],
        ...updatedGroup
      };

    onFormDataChange(newFormData);
    setEditingGroup(null);
  }, [formData, onFormDataChange]);

  const handleSectionUpdate = useCallback((path, updatedSection) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0].sections[path.sectionIndex] = {
      ...newFormData.pages[0].sections[path.sectionIndex],
      ...updatedSection
    };

    onFormDataChange(newFormData);
    setEditingSection(null);
  }, [formData, onFormDataChange]);

  const handleDeleteGroup = useCallback((sectionIndex, groupIndex) => {
    if (!window.confirm('Delete this group and all its questions?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0].sections[sectionIndex].groups.splice(groupIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

  const handleDeleteSection = useCallback((sectionIndex) => {
    if (!window.confirm('Delete this section and all its groups/questions?')) return;

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.pages[0].sections.splice(sectionIndex, 1);

    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

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

  const handleExportExcel = useCallback(() => {
    ExcelExporter.exportToExcel(formData);
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formData.document_info?.source_pdf || 'Form Builder'}
            </h1>
            <p className="text-gray-600 mt-1">
              {calculateTotalQuestions(formData)} questions across {allSections.length} sections
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportJson}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-secondary flex items-center space-x-2"
              title="Export form structure to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
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
        {/* Sidebar - Sections */}
        {allSections.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sections</h3>
                <button
                  onClick={handleAddSection}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Add new section"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* View All Sections Button */}
              <button
                onClick={() => setSelectedSectionIndex(null)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-3 ${
                  selectedSectionIndex === null
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-400 shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>View All Sections</span>
                </div>
              </button>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections-sidebar" type="section">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {allSections.map((section, index) => (
                        <Draggable
                          key={`section-${index}`}
                          draggableId={`section-sidebar-${index}`}
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
                                  : selectedSectionIndex === index
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
                                  onClick={() => {
                                    setSelectedSectionIndex(index);
                                    toggleSection(index);
                                  }}
                                  className="flex-1 text-left py-2 pr-3"
                                >
                                  <div className={`font-medium ${
                                    selectedSectionIndex === index ? 'text-primary-700' : 'text-gray-700'
                                  }`}>
                                    {section.title}
                                  </div>
                                  <div className="text-sm opacity-75">
                                    {section.groups?.length || 0} groups
                                  </div>
                                </button>
                                {allSections.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteSection(index)}
                                    className="p-2 mr-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete section"
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
        <div className={allSections.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Section Header */}
            <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentSection ? currentSection.title : 'All Sections'}
                  </h2>
                  {currentSection && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentSection.groups?.length || 0} groups, {currentSection.groups?.reduce((total, g) => total + (g.questions?.length || 0), 0) || 0} questions
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={expandAll}
                    className="btn-secondary flex items-center space-x-1.5 text-sm"
                    title="Expand all sections and groups"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand All</span>
                  </button>
                  <button
                    onClick={collapseAll}
                    className="btn-secondary flex items-center space-x-1.5 text-sm"
                    title="Collapse all sections and groups"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Collapse All</span>
                  </button>
                  <button
                    onClick={handleAddSection}
                    className="btn-primary flex items-center space-x-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Section Only */}
            <div className="p-3">
              {currentPage?.sections?.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600 mb-4">Add your first section to get started</p>
                  <button onClick={handleAddSection} className="btn-primary">
                    Add Section
                  </button>
                </div>
              ) : selectedSectionIndex === null ? (
                /* All Sections View - Display all sections with drag-drop support */
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="space-y-4">
                    {allSections.map((section, sectionIndex) => (
                      <div key={`all-section-${sectionIndex}`} className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <button
                                onClick={() => toggleSection(sectionIndex)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                {collapsedSections[`${sectionIndex}`] ? (
                                  <ChevronRight className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                              <Layers className="w-5 h-5 text-indigo-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {section.title}
                              </h3>
                              <span className="text-sm text-gray-600">
                                ({section.groups?.length || 0} groups, {section.groups?.reduce((total, g) => total + (g.questions?.length || 0), 0) || 0} questions)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedSectionIndex(sectionIndex)}
                                className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-300"
                                title="View only this section"
                              >
                                Focus
                              </button>
                              <button
                                onClick={() => handleAddGroup(sectionIndex)}
                                className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                                title="Add group to this section"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              {allSections.length > 1 && (
                                <button
                                  onClick={() => handleDeleteSection(sectionIndex)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                  title="Delete section"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section Content - Groups */}
                        {!collapsedSections[`${sectionIndex}`] && (
                          <div className="p-3">
                            <Droppable droppableId={`section-0-section-${sectionIndex}`} type="group">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-3"
                                >
                                  {section.groups?.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                      <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                      <p className="text-sm text-gray-500 mb-2">No groups in this section</p>
                                      <button
                                        onClick={() => handleAddGroup(sectionIndex)}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                      >
                                        Add Group
                                      </button>
                                    </div>
                                  ) : (
                                    section.groups.map((group, groupIndex) => (
                                      <Draggable
                                        key={`group-${sectionIndex}-${groupIndex}`}
                                        draggableId={`group-${sectionIndex}-${groupIndex}`}
                                        index={groupIndex}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`border rounded-lg ${snapshot.isDragging ? 'border-primary-400 shadow-lg scale-105' : 'border-gray-200'}`}
                                          >
                                            {/* Group Header */}
                                            <div className="bg-blue-50 border-b border-blue-200 p-2.5">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                  </div>
                                                  <button
                                                    onClick={() => toggleGroup(sectionIndex, groupIndex)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                  >
                                                    {collapsedGroups[`${sectionIndex}-${groupIndex}`] ? (
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
                                                    onClick={() => setEditingGroup({ group, path: { pageIndex: 0, sectionIndex, groupIndex } })}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50"
                                                  >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleAddQuestion(sectionIndex, groupIndex)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                                                  >
                                                    <Plus className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteGroup(sectionIndex, groupIndex)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Questions */}
                                            {!collapsedGroups[`${sectionIndex}-${groupIndex}`] && (
                                              <div className="p-2">
                                                {group.questions?.length === 0 ? (
                                                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 mb-2">No questions yet</p>
                                                    <button
                                                      onClick={() => handleAddQuestion(sectionIndex, groupIndex)}
                                                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                    >
                                                      Add Question
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <Droppable
                                                    droppableId={`section-0-section-${sectionIndex}-group-${groupIndex}`}
                                                    type="question"
                                                  >
                                                    {(provided) => (
                                                      <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="space-y-2"
                                                      >
                                                        {group.questions.map((question, questionIndex) => (
                                                          <Draggable
                                                            key={`question-${sectionIndex}-${groupIndex}-${questionIndex}`}
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
                                                                    path: { pageIndex: 0, sectionIndex, groupIndex, questionIndex }
                                                                  })}
                                                                  onDelete={() => handleQuestionDelete({
                                                                    pageIndex: 0,
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
                                    ))
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              ) : currentSection ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  {/* Show groups directly without section wrapper */}
                  <Droppable droppableId={`section-0-section-${selectedSectionIndex}`} type="group">
                                      {(provided) => (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="space-y-3"
                                        >
                                          {currentSection.groups?.map((group, groupIndex) => (
                                            <Draggable
                                              key={`group-${groupIndex}`}
                                              draggableId={`group-${selectedSectionIndex}-${groupIndex}`}
                                              index={groupIndex}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className={`border rounded-lg ${snapshot.isDragging ? 'border-primary-400 shadow-md' : 'border-gray-200'}`}
                                                >
                                                  {/* Group Header */}
                                                  <div className="bg-blue-50 border-b border-blue-200 p-2.5">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center space-x-3 flex-1">
                                                        <div {...provided.dragHandleProps} className="cursor-grab">
                                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <button
                                                          onClick={() => toggleGroup(selectedSectionIndex, groupIndex)}
                                                          className="text-gray-600 hover:text-gray-900"
                                                        >
                                                          {collapsedGroups[`${selectedSectionIndex}-${groupIndex}`] ? (
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
                                                          onClick={() => setEditingGroup({ group, path: { pageIndex: 0, sectionIndex: selectedSectionIndex, groupIndex } })}
                                                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50"
                                                        >
                                                          <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleAddQuestion(selectedSectionIndex, groupIndex)}
                                                          className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                                                        >
                                                          <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteGroup(selectedSectionIndex, groupIndex)}
                                                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Questions */}
                                                  {!collapsedGroups[`${selectedSectionIndex}-${groupIndex}`] && (
                                                    <div className="p-2">
                                                      {group.questions?.length === 0 ? (
                                                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                          <p className="text-sm text-gray-500 mb-2">No questions yet</p>
                                                          <button
                                                            onClick={() => handleAddQuestion(selectedSectionIndex, groupIndex)}
                                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                          >
                                                            Add Question
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <Droppable
                                                          droppableId={`section-0-section-${selectedSectionIndex}-group-${groupIndex}`}
                                                          type="question"
                                                        >
                                                          {(provided) => (
                                                            <div
                                                              {...provided.droppableProps}
                                                              ref={provided.innerRef}
                                                              className="space-y-2"
                                                            >
                                                              {group.questions.map((question, questionIndex) => (
                                                                <Draggable
                                                                  key={`question-${questionIndex}`}
                                                                  draggableId={`question-${selectedSectionIndex}-${groupIndex}-${questionIndex}`}
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
                                                                        sectionTitle={currentSection.title}
                                                                        groupTitle={group.title}
                                                                        isRepeatable={group.repeatable}
                                                                        onEdit={() => setEditingQuestion({
                                                                          question,
                                                                          path: { pageIndex: 0, sectionIndex: selectedSectionIndex, groupIndex, questionIndex }
                                                                        })}
                                                                        onDelete={() => handleQuestionDelete({
                                                                          pageIndex: 0,
                                                                          sectionIndex: selectedSectionIndex,
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
                </DragDropContext>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a section from the sidebar to view its content.</p>
                </div>
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Group</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
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

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
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

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
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
import React, { useState, useCallback } from 'react';
import FormBuilder from './components/FormBuilder';
// import FormPreview from './components/FormPreview'; // Hidden for now
import PdfUploadZone from './components/PdfUploadZone';
import Header from './components/Header';
import { ensureQuestionIds, generateQuestionTags } from './utils/formUtils';

function App() {
  const [formData, setFormData] = useState(null);
  const [currentView, setCurrentView] = useState('import'); // 'import', 'builder', 'preview'

  const handleJsonImport = useCallback((jsonData) => {
    console.log('Imported JSON:', jsonData);

    // Normalize JSON structure - support both old and new formats
    let normalizedData = normalizeFormData(jsonData);

    // Ensure all questions have unique IDs
    normalizedData = ensureQuestionIds(normalizedData);

    // Auto-generate question labels only (not tags - we use PDF field names)
    normalizedData = generateQuestionTags(normalizedData, {
      prefix: '',
      forceRegenerate: false,
      generateLabels: true,
      usePdfFieldNames: false // Don't modify tags, just generate labels
    });

    setFormData(normalizedData);
    setCurrentView('builder');
  }, []);

  // Merge sections with the same name across pages
  const mergeSectionsAcrossPages = (data) => {
    if (!data || !data.pages || data.pages.length === 0) return data;

    const sectionMap = new Map(); // Map<sectionTitle, {groups: [], sourcePages: []}>

    // Collect all sections across all pages
    data.pages.forEach((page, pageIndex) => {
      page.sections?.forEach((section) => {
        if (!section) return; // Skip undefined sections

        const sectionTitle = section.title || `Section ${pageIndex + 1}`;

        if (!sectionMap.has(sectionTitle)) {
          sectionMap.set(sectionTitle, {
            title: sectionTitle,
            groups: [],
            sourcePages: []
          });
        }

        const mergedSection = sectionMap.get(sectionTitle);
        // Filter out undefined groups before merging
        const validGroups = (section.groups || []).filter(group => group != null);
        mergedSection.groups.push(...validGroups);
        mergedSection.sourcePages.push(pageIndex + 1);
      });
    });

    // Create a single page with all merged sections
    const mergedSections = Array.from(sectionMap.values());

    console.log('🔄 Section Merging:');
    console.log(`  - Original pages: ${data.pages.length}`);
    console.log(`  - Unique sections found: ${mergedSections.length}`);
    mergedSections.forEach(section => {
      console.log(`    • "${section.title}": ${section.groups.length} groups from pages [${section.sourcePages.join(', ')}]`);
    });

    return {
      ...data,
      pages: [
        {
          title: data.document_info?.source_pdf || 'Form',
          page_number: 1,
          sections: mergedSections
        }
      ],
      _originalPageCount: data.pages.length,
      _sectionsMerged: true
    };
  };

  // Normalize form data to support both flat and hierarchical structures
  const normalizeFormData = (data) => {
    if (!data || !data.pages) return data;

    // Check if already in new format (has sections)
    const hasNewFormat = data.pages.some(page => page.sections);

    let normalizedData;

    if (hasNewFormat) {
      // Already in new format
      normalizedData = data;
    } else {
      // Convert old format (form_elements) to new format (sections -> groups -> questions)
      const normalizedPages = data.pages.map((page, pageIndex) => {
        if (page.sections) {
          return page; // Already normalized
        }

        // Convert flat form_elements to hierarchical structure
        return {
          ...page,
          title: page.title || `Page ${page.page_number || pageIndex + 1}`,
          sections: [
            {
              title: 'Form Fields',
              groups: [
                {
                  title: 'Questions',
                  repeatable: false,
                  questions: page.form_elements || []
                }
              ]
            }
          ]
        };
      });

      normalizedData = {
        ...data,
        pages: normalizedPages
      };
    }

    // Merge sections with the same name across pages
    return mergeSectionsAcrossPages(normalizedData);
  };

  const handleExportHtml = useCallback((htmlContent) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData?.document_info?.source_pdf || 'form'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(null);
    setCurrentView('import');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onReset={handleReset}
        hasData={!!formData}
      />
      
      <main className="container mx-auto px-4">
        {currentView === 'import' && (
          <div className="max-w-2xl mx-auto">
            {/* PDF Upload Only */}
            <PdfUploadZone onJsonReceived={handleJsonImport} />
          </div>
        )}

        {currentView === 'builder' && formData && (
          <div className="py-6">
            <FormBuilder
              formData={formData}
              onFormDataChange={setFormData}
              onExportHtml={handleExportHtml}
            />
          </div>
        )}

        {/* Preview hidden for now */}
        {/* {currentView === 'preview' && formData && (
          <FormPreview 
            formData={formData}
            onExportHtml={handleExportHtml}
          />
        )} */}
      </main>
    </div>
  );
}

export default App;
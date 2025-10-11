import * as XLSX from 'xlsx';

class ExcelExporter {
  /**
   * Flatten hierarchical form data into a flat array for Excel export
   */
  static flattenFormData(formData) {
    const rows = [];

    if (!formData || !formData.pages) {
      return rows;
    }

    formData.pages.forEach((page, pageIndex) => {
      const pageTitle = page.title || `Page ${page.page_number || pageIndex + 1}`;

      if (!page.sections) {
        return;
      }

      page.sections.forEach((section, sectionIndex) => {
        const sectionTitle = section.title || `Section ${sectionIndex + 1}`;

        if (!section.groups) {
          return;
        }

        section.groups.forEach((group, groupIndex) => {
          const groupTitle = group.title || `Group ${groupIndex + 1}`;
          const isRepeatable = group.repeatable ? 'Yes' : 'No';

          if (!group.questions) {
            return;
          }

          group.questions.forEach((question, questionIndex) => {
            const row = {
              'Question Tag': question.question_tag || '',
              'Question Label': question.question_label || '',
              Page: pageTitle,
              Section: sectionTitle,
              Group: groupTitle,
              'Repeatable Group': isRepeatable,
              'Question ID': question.question_id || question.id || `q_${pageIndex}_${sectionIndex}_${groupIndex}_${questionIndex}`,
              Question: question.question || '',
              'Answer Type': question.answer_type || '',
              Required: question.required ? 'Yes' : 'No',
              Options: this.formatOptions(question),
              'Applies To': this.formatAppliesTo(question),
              'Parent Question ID': question.parent_question_id || '',
              'Parent Question': question.parent_question_text || '',
              'Show When': this.formatShowWhen(question),
              'Field Name': question.pdf_metadata?.field_name || '',
              'PDF Page': question.pdf_metadata?.page || '',
              'PDF Type': question.pdf_metadata?.detected_type || question.pdf_metadata?.original_type || '',
              'Validation': this.formatValidation(question),
              'Sub Questions': question.sub_questions?.length || 0,
              'PDF Metadata': question.pdf_metadata ? JSON.stringify(question.pdf_metadata) : ''
            };

            rows.push(row);
          });
        });
      });
    });

    return rows;
  }

  /**
   * Format options for Excel cell
   */
  static formatOptions(question) {
    if (!question.options || question.options.length === 0) {
      return '';
    }

    // Handle array of strings
    if (typeof question.options[0] === 'string') {
      return question.options.join(', ');
    }

    // Handle array of objects
    return question.options.map(opt => {
      if (typeof opt === 'string') {
        return opt;
      }

      const value = opt.value || opt.label || '';
      const label = opt.label || opt.value || '';
      const requiresInput = opt.requires_input ? ' [requires input]' : '';

      if (value === label) {
        return `${value}${requiresInput}`;
      }

      return `${value}: ${label}${requiresInput}`;
    }).join(' | ');
  }

  /**
   * Format applies_to field for radio_multi_person questions
   */
  static formatAppliesTo(question) {
    if (!question.applies_to || question.applies_to.length === 0) {
      return '';
    }

    return question.applies_to.map(person =>
      person.charAt(0).toUpperCase() + person.slice(1)
    ).join(', ');
  }

  /**
   * Format show_when condition
   */
  static formatShowWhen(question) {
    if (!question.show_when) {
      return '';
    }

    if (Array.isArray(question.show_when)) {
      return question.show_when.join(' OR ');
    }

    return question.show_when;
  }

  /**
   * Format validation rules
   */
  static formatValidation(question) {
    if (!question.validation || Object.keys(question.validation).length === 0) {
      return '';
    }

    const rules = [];
    const val = question.validation;

    if (val.minLength) rules.push(`Min Length: ${val.minLength}`);
    if (val.maxLength) rules.push(`Max Length: ${val.maxLength}`);
    if (val.min !== undefined) rules.push(`Min: ${val.min}`);
    if (val.max !== undefined) rules.push(`Max: ${val.max}`);
    if (val.pattern) rules.push(`Pattern: ${val.pattern}`);
    if (val.accept) rules.push(`Accept: ${val.accept}`);
    if (val.maxSize) rules.push(`Max Size: ${val.maxSize}MB`);
    if (val.errorMessage) rules.push(`Error: ${val.errorMessage}`);

    return rules.join(' | ');
  }

  /**
   * Generate and download Excel file
   */
  static exportToExcel(formData, filename = 'form_structure.xlsx') {
    try {
      // Flatten the data
      const flatData = this.flattenFormData(formData);

      if (flatData.length === 0) {
        alert('No data to export');
        return;
      }

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(flatData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Question Tag
        { wch: 30 }, // Question Label
        { wch: 30 }, // Page
        { wch: 30 }, // Section
        { wch: 25 }, // Group
        { wch: 15 }, // Repeatable Group
        { wch: 35 }, // Question ID
        { wch: 50 }, // Question
        { wch: 18 }, // Answer Type
        { wch: 10 }, // Required
        { wch: 60 }, // Options
        { wch: 20 }, // Applies To
        { wch: 30 }, // Parent Question ID
        { wch: 50 }, // Parent Question
        { wch: 20 }, // Show When
        { wch: 25 }, // Field Name
        { wch: 10 }, // PDF Page
        { wch: 15 }, // PDF Type
        { wch: 40 }, // Validation
        { wch: 12 }, // Sub Questions
        { wch: 50 }, // PDF Metadata
      ];
      worksheet['!cols'] = columnWidths;

      // Freeze the header row
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Structure');

      // Add metadata sheet
      const metadataSheet = this.createMetadataSheet(formData);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Document Info');

      // Generate file
      const sourcePdf = formData.document_info?.source_pdf || 'form';
      const finalFilename = filename.includes('.xlsx') ? filename : `${sourcePdf}_${filename}`;

      XLSX.writeFile(workbook, finalFilename);

      console.log(`Excel file exported: ${finalFilename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please check the console for details.');
    }
  }

  /**
   * Create metadata sheet with document information
   */
  static createMetadataSheet(formData) {
    const metadata = [];

    if (formData.document_info) {
      Object.entries(formData.document_info).forEach(([key, value]) => {
        metadata.push({
          Property: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          Value: value
        });
      });
    }

    // Add summary statistics
    const stats = this.getFormStatistics(formData);
    metadata.push({ Property: '', Value: '' }); // Empty row
    metadata.push({ Property: 'STATISTICS', Value: '' });

    Object.entries(stats).forEach(([key, value]) => {
      metadata.push({
        Property: key,
        Value: value
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(metadata);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 50 }];

    return worksheet;
  }

  /**
   * Calculate form statistics
   */
  static getFormStatistics(formData) {
    let totalQuestions = 0;
    let requiredQuestions = 0;
    let repeatableGroups = 0;
    let conditionalQuestions = 0;
    const questionTypes = {};

    if (formData && formData.pages) {
      formData.pages.forEach(page => {
        page.sections?.forEach(section => {
          section.groups?.forEach(group => {
            if (group.repeatable) {
              repeatableGroups++;
            }

            group.questions?.forEach(question => {
              totalQuestions++;

              if (question.required) {
                requiredQuestions++;
              }

              if (question.parent_question_id) {
                conditionalQuestions++;
              }

              const type = question.answer_type || 'unknown';
              questionTypes[type] = (questionTypes[type] || 0) + 1;
            });
          });
        });
      });
    }

    return {
      'Total Pages': formData?.pages?.length || 0,
      'Total Questions': totalQuestions,
      'Required Questions': requiredQuestions,
      'Repeatable Groups': repeatableGroups,
      'Conditional Questions': conditionalQuestions,
      'Question Types': Object.entries(questionTypes)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ')
    };
  }
}

export default ExcelExporter;

// Utility functions for form data manipulation

/**
 * Calculate total number of questions across all pages, sections, and groups
 */
export const calculateTotalQuestions = (formData) => {
  if (!formData || !formData.pages) return 0;

  return formData.pages.reduce((total, page) => {
    if (!page.sections) return total;

    const pageTotal = page.sections.reduce((sectionTotal, section) => {
      if (!section.groups) return sectionTotal;

      const sectionQuestionTotal = section.groups.reduce((groupTotal, group) => {
        return groupTotal + (group.questions?.length || 0);
      }, 0);

      return sectionTotal + sectionQuestionTotal;
    }, 0);

    return total + pageTotal;
  }, 0);
};

/**
 * Get all questions from a specific page
 */
export const getPageQuestions = (page) => {
  if (!page || !page.sections) return [];

  const questions = [];
  page.sections.forEach(section => {
    section.groups?.forEach(group => {
      group.questions?.forEach(question => {
        questions.push({
          ...question,
          sectionTitle: section.title,
          groupTitle: group.title,
          isRepeatable: group.repeatable
        });
      });
    });
  });

  return questions;
};

/**
 * Find question path (pageIndex, sectionIndex, groupIndex, questionIndex)
 */
export const findQuestionPath = (formData, searchFn) => {
  if (!formData || !formData.pages) return null;

  for (let pageIndex = 0; pageIndex < formData.pages.length; pageIndex++) {
    const page = formData.pages[pageIndex];
    if (!page.sections) continue;

    for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
      const section = page.sections[sectionIndex];
      if (!section.groups) continue;

      for (let groupIndex = 0; groupIndex < section.groups.length; groupIndex++) {
        const group = section.groups[groupIndex];
        if (!group.questions) continue;

        for (let questionIndex = 0; questionIndex < group.questions.length; questionIndex++) {
          const question = group.questions[questionIndex];
          if (searchFn(question, { pageIndex, sectionIndex, groupIndex, questionIndex })) {
            return { pageIndex, sectionIndex, groupIndex, questionIndex };
          }
        }
      }
    }
  }

  return null;
};

/**
 * Update question at specific path
 */
export const updateQuestionAtPath = (formData, path, updatedQuestion) => {
  const { pageIndex, sectionIndex, groupIndex, questionIndex } = path;

  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex].questions[questionIndex] = updatedQuestion;

  return newFormData;
};

/**
 * Delete question at specific path
 */
export const deleteQuestionAtPath = (formData, path) => {
  const { pageIndex, sectionIndex, groupIndex, questionIndex } = path;

  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex].questions.splice(questionIndex, 1);

  return newFormData;
};

/**
 * Add question to specific group
 */
export const addQuestionToGroup = (formData, pageIndex, sectionIndex, groupIndex, newQuestion) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  if (!newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex].questions) {
    newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex].questions = [];
  }

  newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex].questions.push(newQuestion);

  return newFormData;
};

/**
 * Move question between groups/sections/pages
 */
export const moveQuestion = (formData, sourcePath, destinationPath, destinationIndex) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  // Get source question
  const sourceQuestion = newFormData.pages[sourcePath.pageIndex]
    .sections[sourcePath.sectionIndex]
    .groups[sourcePath.groupIndex]
    .questions[sourcePath.questionIndex];

  // Remove from source
  newFormData.pages[sourcePath.pageIndex]
    .sections[sourcePath.sectionIndex]
    .groups[sourcePath.groupIndex]
    .questions.splice(sourcePath.questionIndex, 1);

  // Add to destination
  const destQuestions = newFormData.pages[destinationPath.pageIndex]
    .sections[destinationPath.sectionIndex]
    .groups[destinationPath.groupIndex]
    .questions;

  destQuestions.splice(destinationIndex, 0, sourceQuestion);

  return newFormData;
};

/**
 * Move group between sections/pages
 */
export const moveGroup = (formData, sourcePath, destinationPath, destinationIndex) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  // Get source group
  const sourceGroup = newFormData.pages[sourcePath.pageIndex]
    .sections[sourcePath.sectionIndex]
    .groups[sourcePath.groupIndex];

  // Remove from source
  newFormData.pages[sourcePath.pageIndex]
    .sections[sourcePath.sectionIndex]
    .groups.splice(sourcePath.groupIndex, 1);

  // Add to destination
  const destGroups = newFormData.pages[destinationPath.pageIndex]
    .sections[destinationPath.sectionIndex]
    .groups;

  destGroups.splice(destinationIndex, 0, sourceGroup);

  return newFormData;
};

/**
 * Move section between pages
 */
export const moveSection = (formData, sourcePath, destinationPath, destinationIndex) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  // Get source section
  const sourceSection = newFormData.pages[sourcePath.pageIndex]
    .sections[sourcePath.sectionIndex];

  // Remove from source
  newFormData.pages[sourcePath.pageIndex]
    .sections.splice(sourcePath.sectionIndex, 1);

  // Add to destination
  const destSections = newFormData.pages[destinationPath.pageIndex].sections;

  destSections.splice(destinationIndex, 0, sourceSection);

  return newFormData;
};

/**
 * Update group properties
 */
export const updateGroup = (formData, pageIndex, sectionIndex, groupIndex, updatedGroup) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex] = {
    ...newFormData.pages[pageIndex].sections[sectionIndex].groups[groupIndex],
    ...updatedGroup
  };

  return newFormData;
};

/**
 * Update section properties
 */
export const updateSection = (formData, pageIndex, sectionIndex, updatedSection) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections[sectionIndex] = {
    ...newFormData.pages[pageIndex].sections[sectionIndex],
    ...updatedSection
  };

  return newFormData;
};

/**
 * Add new section to page
 */
export const addSection = (formData, pageIndex, newSection) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  if (!newFormData.pages[pageIndex].sections) {
    newFormData.pages[pageIndex].sections = [];
  }

  newFormData.pages[pageIndex].sections.push(newSection);

  return newFormData;
};

/**
 * Add new group to section
 */
export const addGroup = (formData, pageIndex, sectionIndex, newGroup) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  if (!newFormData.pages[pageIndex].sections[sectionIndex].groups) {
    newFormData.pages[pageIndex].sections[sectionIndex].groups = [];
  }

  newFormData.pages[pageIndex].sections[sectionIndex].groups.push(newGroup);

  return newFormData;
};

/**
 * Delete section
 */
export const deleteSection = (formData, pageIndex, sectionIndex) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections.splice(sectionIndex, 1);

  return newFormData;
};

/**
 * Delete group
 */
export const deleteGroup = (formData, pageIndex, sectionIndex, groupIndex) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  newFormData.pages[pageIndex].sections[sectionIndex].groups.splice(groupIndex, 1);

  return newFormData;
};

/**
 * Generate unique question ID
 */
export const generateQuestionId = (pageIndex, sectionIndex, groupIndex, questionIndex) => {
  return `q_${pageIndex}_${sectionIndex}_${groupIndex}_${questionIndex}`;
};

/**
 * Parse question ID to get path
 */
export const parseQuestionId = (questionId) => {
  const parts = questionId.split('_');
  if (parts.length !== 5 || parts[0] !== 'q') return null;

  return {
    pageIndex: parseInt(parts[1]),
    sectionIndex: parseInt(parts[2]),
    groupIndex: parseInt(parts[3]),
    questionIndex: parseInt(parts[4])
  };
};

/**
 * Get question by ID
 */
export const getQuestionById = (formData, questionId) => {
  const path = parseQuestionId(questionId);
  if (!path) return null;

  try {
    return formData.pages[path.pageIndex]
      .sections[path.sectionIndex]
      .groups[path.groupIndex]
      .questions[path.questionIndex];
  } catch (e) {
    return null;
  }
};

/**
 * Get all questions with their IDs and paths
 */
export const getAllQuestionsWithIds = (formData) => {
  if (!formData || !formData.pages) return [];

  const questions = [];

  formData.pages.forEach((page, pageIndex) => {
    page.sections?.forEach((section, sectionIndex) => {
      section.groups?.forEach((group, groupIndex) => {
        group.questions?.forEach((question, questionIndex) => {
          questions.push({
            id: generateQuestionId(pageIndex, sectionIndex, groupIndex, questionIndex),
            question: question,
            path: { pageIndex, sectionIndex, groupIndex, questionIndex },
            sectionTitle: section.title,
            groupTitle: group.title,
            pageTitle: page.title || `Page ${page.page_number || pageIndex + 1}`
          });
        });
      });
    });
  });

  return questions;
};

/**
 * Get child questions of a parent question
 */
export const getChildQuestions = (formData, parentQuestionId) => {
  const allQuestions = getAllQuestionsWithIds(formData);
  return allQuestions.filter(q => q.question.parent_question_id === parentQuestionId);
};

/**
 * Check if a question should be visible based on parent question answer
 */
export const shouldQuestionBeVisible = (question, parentAnswer, formValues) => {
  // If no parent, always visible
  if (!question.parent_question_id) return true;

  // If no show_when condition, always visible when parent has any value
  if (!question.show_when) return !!parentAnswer;

  // Check if parent answer matches show_when condition
  if (Array.isArray(question.show_when)) {
    // Multiple valid values
    if (Array.isArray(parentAnswer)) {
      // Parent answer is array (checkbox)
      return question.show_when.some(val => parentAnswer.includes(val));
    } else {
      // Parent answer is single value (radio, dropdown, text)
      return question.show_when.includes(parentAnswer);
    }
  } else {
    // Single valid value
    if (Array.isArray(parentAnswer)) {
      return parentAnswer.includes(question.show_when);
    } else {
      return parentAnswer === question.show_when;
    }
  }
};


/**
 * Generate a smart label from question text
 * Extracts key information and formats it nicely
 */
export const generateLabelFromQuestion = (questionText) => {
  if (!questionText || typeof questionText !== 'string') {
    return 'Untitled Question';
  }

  // Remove common prefixes and clean up
  let label = questionText
    .replace(/^(Please\s+)?(enter|provide|select|choose|indicate|specify)\s+/i, '')
    .replace(/[:?]+$/, '') // Remove trailing colons and question marks
    .replace(/\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Take first 50 characters
  if (label.length > 50) {
    label = label.substring(0, 50).trim();
    // Try to end at a word boundary
    const lastSpace = label.lastIndexOf(' ');
    if (lastSpace > 30) {
      label = label.substring(0, lastSpace);
    }
  }

  // Title case the label
  label = label
    .split(' ')
    .map(word => {
      // Keep acronyms uppercase
      if (word === word.toUpperCase() && word.length > 1) {
        return word;
      }
      // Title case normal words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return label || 'Untitled Question';
};

/**
 * Clean PDF field name to use as question tag
 * Removes trailing numbers and special characters
 */
export const cleanPdfFieldName = (fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') {
    return null;
  }

  // Remove trailing numbers (e.g., "field_name 5" → "field_name")
  let cleaned = fieldName.replace(/\s+\d+$/, '');
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Replace spaces with underscores
  cleaned = cleaned.replace(/\s+/g, '_');
  
  // Remove any remaining special characters except underscores
  cleaned = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  
  return cleaned || null;
};

/**
 * Generate question tag based on hierarchical position
 * Format: P{page}_S{section}_G{group}_Q{question}
 */
export const generateQuestionTag = (pageIndex, sectionIndex, groupIndex, questionIndex, prefix = '') => {
  const tag = `P${pageIndex + 1}_S${sectionIndex + 1}_G${groupIndex + 1}_Q${questionIndex + 1}`;
  return prefix ? `${prefix}_${tag}` : tag;
};

/**
 * Generate tags and labels for all questions in the form
 * Priority: 1) PDF field name, 2) Existing tag, 3) Auto-generated tag
 */
export const generateQuestionTags = (formData, options = {}) => {
  const {
    prefix = '', // Optional prefix for all tags (e.g., 'APP')
    forceRegenerate = false, // If true, regenerate even if tags exist
    generateLabels = true, // If true, also generate labels
    usePdfFieldNames = true // If true, prioritize PDF field names
  } = options;

  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  let tagsGenerated = 0;
  let labelsGenerated = 0;
  let pdfFieldNamesUsed = 0;
  let autoGeneratedTags = 0;

  newFormData.pages?.forEach((page, pageIndex) => {
    page.sections?.forEach((section, sectionIndex) => {
      section.groups?.forEach((group, groupIndex) => {
        group.questions?.forEach((question, questionIndex) => {
          // Generate tag if not present or force regenerate
          if (!question.question_tag || forceRegenerate) {
            let newTag = null;

            // Priority 1: Use PDF field name if available
            if (usePdfFieldNames && question.pdf_metadata?.field_name) {
              const cleanedFieldName = cleanPdfFieldName(question.pdf_metadata.field_name);
              if (cleanedFieldName) {
                newTag = prefix ? `${prefix}_${cleanedFieldName}` : cleanedFieldName;
                pdfFieldNamesUsed++;
              }
            }

            // Priority 2: Auto-generate if no PDF field name
            if (!newTag) {
              newTag = generateQuestionTag(
                pageIndex,
                sectionIndex,
                groupIndex,
                questionIndex,
                prefix
              );
              autoGeneratedTags++;
            }

            question.question_tag = newTag;
            tagsGenerated++;
          }

          // Generate label if not present and generateLabels is true
          if (generateLabels && (!question.question_label || forceRegenerate)) {
            question.question_label = generateLabelFromQuestion(question.question);
            labelsGenerated++;
          }

          // Process sub-questions if they exist
          if (question.sub_questions && Array.isArray(question.sub_questions)) {
            question.sub_questions.forEach((subQuestion, subIndex) => {
              // Generate tag for sub-question if not present
              if (!subQuestion.question_tag || forceRegenerate) {
                // Try to use PDF field name for sub-question
                if (usePdfFieldNames && subQuestion.pdf_metadata?.field_name) {
                  const cleanedFieldName = cleanPdfFieldName(subQuestion.pdf_metadata.field_name);
                  if (cleanedFieldName) {
                    subQuestion.question_tag = prefix ? `${prefix}_${cleanedFieldName}` : cleanedFieldName;
                    pdfFieldNamesUsed++;
                  }
                } else {
                  // Auto-generate sub-question tag
                  const parentTag = question.question_tag;
                  subQuestion.question_tag = `${parentTag}_SUB${subIndex + 1}`;
                  autoGeneratedTags++;
                }
                tagsGenerated++;
              }

              // Generate label for sub-question
              if (generateLabels && (!subQuestion.question_label || forceRegenerate)) {
                subQuestion.question_label = generateLabelFromQuestion(subQuestion.question);
                labelsGenerated++;
              }
            });
          }
        });
      });
    });
  });

  // Add metadata about tag generation
  if (!newFormData.document_info) {
    newFormData.document_info = {};
  }
  
  newFormData.document_info.tags_auto_generated = true;
  newFormData.document_info.tags_generated_at = new Date().toISOString();
  newFormData.document_info.tag_prefix = prefix || 'none';
  newFormData.document_info.pdf_field_names_used = pdfFieldNamesUsed;
  newFormData.document_info.auto_generated_tags = autoGeneratedTags;

  console.log(`Auto-generated ${tagsGenerated} question tags and ${labelsGenerated} labels`);
  console.log(`  - ${pdfFieldNamesUsed} from PDF field names`);
  console.log(`  - ${autoGeneratedTags} auto-generated`);

  return newFormData;
};

/**
 * Regenerate all question tags (useful after reorganizing form structure)
 */
export const regenerateAllTags = (formData, prefix = '') => {
  return generateQuestionTags(formData, {
    prefix,
    forceRegenerate: true,
    generateLabels: false // Don't regenerate labels, only tags
  });
};

/**
 * Validate that all questions have tags and labels
 * Returns an object with validation results
 */
export const validateQuestionTags = (formData) => {
  const results = {
    valid: true,
    missingTags: [],
    missingLabels: [],
    duplicateTags: [],
    totalQuestions: 0
  };

  const tagMap = new Map();

  formData.pages?.forEach((page, pageIndex) => {
    page.sections?.forEach((section, sectionIndex) => {
      section.groups?.forEach((group, groupIndex) => {
        group.questions?.forEach((question, questionIndex) => {
          results.totalQuestions++;

          const path = `P${pageIndex + 1}_S${sectionIndex + 1}_G${groupIndex + 1}_Q${questionIndex + 1}`;

          // Check for missing tag
          if (!question.question_tag) {
            results.valid = false;
            results.missingTags.push({
              path,
              question: question.question?.substring(0, 50) || 'Untitled'
            });
          } else {
            // Check for duplicate tags
            if (tagMap.has(question.question_tag)) {
              results.valid = false;
              results.duplicateTags.push({
                tag: question.question_tag,
                paths: [tagMap.get(question.question_tag), path]
              });
            } else {
              tagMap.set(question.question_tag, path);
            }
          }

          // Check for missing label
          if (!question.question_label) {
            results.missingLabels.push({
              path,
              tag: question.question_tag || 'N/A',
              question: question.question?.substring(0, 50) || 'Untitled'
            });
          }
        });
      });
    });
  });

  return results;
};

/**
 * Ensure all questions have unique IDs
 */
export const ensureQuestionIds = (formData) => {
  const newFormData = JSON.parse(JSON.stringify(formData)); // Deep clone

  newFormData.pages?.forEach((page, pageIndex) => {
    page.sections?.forEach((section, sectionIndex) => {
      section.groups?.forEach((group, groupIndex) => {
        group.questions?.forEach((question, questionIndex) => {
          // Generate ID if not present
          if (!question.id) {
            question.id = generateQuestionId(pageIndex, sectionIndex, groupIndex, questionIndex);
          }
        });
      });
    });
  });

  return newFormData;
};
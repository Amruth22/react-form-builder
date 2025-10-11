/**
 * Smart PDF Field Type Detection Utility
 * 
 * Intelligently determines whether a field should be radio or checkbox
 * based on PDF symbols and text context
 */

/**
 * Detect if text contains "select all" or similar phrases
 */
const detectMultiSelectText = (text) => {
  if (!text) return false;
  
  const multiSelectPhrases = [
    'select all',
    'check all',
    'choose all',
    'mark all',
    'all that apply',
    'multiple selections',
    'multiple choices',
    'more than one',
    'select multiple',
    'check multiple'
  ];
  
  const lowerText = text.toLowerCase();
  return multiSelectPhrases.some(phrase => lowerText.includes(phrase));
};

/**
 * Detect field type based on checkbox symbol
 * 
 * Rules:
 * - Dot (•) or Circle (○) → Radio button
 * - Checkmark (✓) or X (✗) or Square (☐) → Checkbox
 */
const detectSymbolType = (symbol) => {
  if (!symbol) return null;
  
  // Radio button symbols
  const radioSymbols = [
    '•', '●', '○', '◦', '⚫', '⚪',  // Dots and circles
    '()', '( )', 'o', 'O'            // Text representations
  ];
  
  // Checkbox symbols
  const checkboxSymbols = [
    '✓', '✔', '✗', '✘', '☐', '☑', '☒',  // Check marks and boxes
    '□', '■', '[x]', '[ ]', 'x', 'X'     // Text representations
  ];
  
  const symbolStr = symbol.toString().trim();
  
  if (radioSymbols.some(s => symbolStr.includes(s))) {
    return 'radio';
  }
  
  if (checkboxSymbols.some(s => symbolStr.includes(s))) {
    return 'checkbox';
  }
  
  return null;
};
/**
 * Main function to determine field type
 * 
 * Priority:
 * 1. Check for "select all" text → checkbox
 * 2. Check symbol type → radio or checkbox
 * 3. Default → radio (as per client requirement)
 */
export const determineFieldType = (fieldData) => {
  const {
    question = '',
    options = [],
    symbol = null
  } = fieldData;
  
  // Rule 1: Check for "select all" text in question
  if (detectMultiSelectText(question)) {
    return 'checkbox';
  }
  
  // Rule 2: Check for "select all" in any option text
  const hasMultiSelectInOptions = options.some(opt => {
    const optText = typeof opt === 'string' ? opt : opt.label || opt.value || '';
    return detectMultiSelectText(optText);
  });
  
  if (hasMultiSelectInOptions) {
    return 'checkbox';
  }
  
  // Rule 3: Check symbol type
  const symbolType = detectSymbolType(symbol);
  if (symbolType) {
    return symbolType;
  }
  
  // Rule 4: Default to radio button (client requirement)
  return 'radio';
};
  return 'radio';
};

/**
 * Process entire form data and apply smart detection
 */
export const applySmartFieldDetection = (formData) => {
  if (!formData || !formData.pages) return formData;
  
  const processedData = JSON.parse(JSON.stringify(formData)); // Deep clone
  
  processedData.pages.forEach((page, pageIndex) => {
    if (!page.sections) return;
    
    page.sections.forEach(section => {
      if (!section.groups) return;
      
      section.groups.forEach(group => {
        if (!group.questions) return;
        
        group.questions.forEach(question => {
          // Initialize PDF metadata if not present
          if (!question.pdf_metadata) {
            question.pdf_metadata = {};
          }
          
          // Add page number if not present
          if (!question.pdf_metadata.page) {
            question.pdf_metadata.page = page.page_number || pageIndex + 1;
          }
          
          // Only process checkbox/radio type questions for detection
          if (question.answer_type === 'checkbox' || question.answer_type === 'radio') {
            const originalType = question.answer_type;
            
            const detectedType = determineFieldType({
              question: question.question,
              options: question.options,
              symbol: question.pdf_metadata?.symbol,
              originalType: originalType
            });
            
            // Update answer type
            question.answer_type = detectedType;
            
            // Add detection metadata
            question.pdf_metadata.original_type = originalType;
            question.pdf_metadata.detected_type = detectedType;
            question.pdf_metadata.detection_applied = true;
          }
        });
      });
    });
  });
  
  return processedData;
};

/**
 * Analyze field and provide detection reasoning
 * (Useful for debugging)
 */
export const analyzeFieldDetection = (fieldData) => {
  const {
    question = '',
    options = [],
    symbol = null
  } = fieldData;
  
  const analysis = {
    detectedType: null,
    reasons: [],
    confidence: 'low'
  };
  
  // Check for multi-select text
  if (detectMultiSelectText(question)) {
    analysis.reasons.push('Question contains "select all" or similar phrase');
    analysis.detectedType = 'checkbox';
    analysis.confidence = 'high';
    return analysis;
  }
  
  // Check options
  const hasMultiSelectInOptions = options.some(opt => {
    const optText = typeof opt === 'string' ? opt : opt.label || opt.value || '';
    return detectMultiSelectText(optText);
  });
  
  if (hasMultiSelectInOptions) {
    analysis.reasons.push('Options contain "select all" or similar phrase');
    analysis.detectedType = 'checkbox';
    analysis.confidence = 'high';
    return analysis;
  }
  
  // Check symbol
  const symbolType = detectSymbolType(symbol);
  if (symbolType) {
    analysis.reasons.push(`Symbol "${symbol}" indicates ${symbolType}`);
    analysis.detectedType = symbolType;
    analysis.confidence = 'medium';
    return analysis;
  }
  
  // Default
  analysis.reasons.push('No specific indicators found, using default (radio)');
  analysis.detectedType = 'radio';
  analysis.confidence = 'low';
  
  return analysis;
};

/**
 * Add PDF metadata to questions from raw PDF extraction data
 * Call this before applySmartFieldDetection
 */
export const enrichWithPdfMetadata = (formData, pdfExtractionData) => {
  if (!formData || !formData.pages) return formData;
  
  const enrichedData = JSON.parse(JSON.stringify(formData)); // Deep clone
  
  enrichedData.pages.forEach((page, pageIndex) => {
    if (!page.sections) return;
    
    page.sections.forEach(section => {
      if (!section.groups) return;
      
      section.groups.forEach(group => {
        if (!group.questions) return;
        
        group.questions.forEach((question, qIndex) => {
          // Initialize metadata
          if (!question.pdf_metadata) {
            question.pdf_metadata = {};
          }
          
          // Add basic metadata
          question.pdf_metadata.page = page.page_number || pageIndex + 1;
          
          // Generate field name if not present
          if (!question.pdf_metadata.field_name) {
            const fieldName = question.question
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '_')
              .substring(0, 50);
            question.pdf_metadata.field_name = fieldName || `field_${pageIndex}_${qIndex}`;
          }
          
          // Add extraction timestamp
          if (!question.pdf_metadata.extracted_at) {
            question.pdf_metadata.extracted_at = new Date().toISOString();
          }
        });
      });
    });
  });
  
  return enrichedData;
};

const pdfFieldDetectionUtils = {
  determineFieldType,
  applySmartFieldDetection,
  analyzeFieldDetection,
  enrichWithPdfMetadata
};

export default pdfFieldDetectionUtils;

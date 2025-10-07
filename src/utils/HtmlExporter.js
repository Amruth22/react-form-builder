class HtmlExporter {
  static generateHtml(formData) {
    const title = formData.document_info?.source_pdf || 'Interactive Form';
    const pages = formData.pages || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 30px;
        }
        
        .page {
            display: none;
        }
        
        .page.active {
            display: block;
        }
        
        .page-nav {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .page-btn {
            padding: 10px 20px;
            border: 2px solid #3b82f6;
            background: white;
            color: #3b82f6;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .page-btn.active {
            background: #3b82f6;
            color: white;
        }
        
        .page-btn:hover {
            background: #3b82f6;
            color: white;
        }
        
        .section {
            margin-bottom: 30px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .section-header {
            background: #f3f4f6;
            padding: 15px 20px;
            border-bottom: 2px solid #e5e7eb;
            font-weight: 600;
            font-size: 1.1rem;
            color: #1f2937;
        }
        
        .section-content {
            padding: 20px;
        }
        
        .group {
            margin-bottom: 25px;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            background: #eff6ff;
            overflow: hidden;
        }
        
        .group-header {
            background: #dbeafe;
            padding: 12px 15px;
            border-bottom: 1px solid #bfdbfe;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .group-title {
            font-weight: 600;
            color: #1e40af;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .repeatable-badge {
            background: #a855f7;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .add-instance-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background 0.2s;
        }
        
        .add-instance-btn:hover {
            background: #2563eb;
        }
        
        .group-instance {
            background: white;
            padding: 20px;
            margin: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            position: relative;
        }
        
        .instance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .instance-number {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .remove-instance-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .remove-instance-btn:hover {
            background: #dc2626;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .required {
            color: #e74c3c;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        .form-control.error {
            border-color: #ef4444;
            background: #fef2f2;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        .radio-group, .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .option {
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        
        .option input[type="radio"], .option input[type="checkbox"] {
            width: auto;
            margin-top: 3px;
        }
        
        .conditional-input {
            margin-left: 30px;
            margin-top: 8px;
        }
        
        .display-text {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px 15px;
            color: #1e40af;
            margin-bottom: 20px;
        }
        
        .file-upload-wrapper {
            position: relative;
        }
        
        .file-upload-label {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            background: #f8fafc;
        }
        
        .file-upload-label:hover {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        
        .file-info {
            margin-top: 10px;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 6px;
            font-size: 0.875rem;
        }
        
        .actions {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        
        .btn {
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .btn-primary {
            background: #3b82f6;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2563eb;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .json-output {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .json-textarea {
            width: 100%;
            height: 200px;
            font-family: monospace;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
            background: #1f2937;
            color: #10b981;
        }
        
        .validation-summary {
            margin-top: 15px;
            padding: 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #991b1b;
        }
        
        .success-message {
            margin-top: 15px;
            padding: 12px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            color: #166534;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
            }
            .content {
                padding: 20px;
            }
            .page-nav {
                flex-direction: column;
            }
            .btn {
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>Fill out all fields and export your data as JSON</p>
        </div>
        
        <div class="content">
            <form id="mainForm">
                ${this.generatePageNavigation(pages)}
                ${this.generatePages(pages)}
            </form>
        </div>
        
        <div class="actions">
            <button type="button" class="btn btn-primary" onclick="exportToJSON()">📤 Export to JSON</button>
            <button type="button" class="btn btn-secondary" onclick="copyJSON()">📋 Copy JSON</button>
            <button type="button" class="btn btn-secondary" onclick="clearForm()">🗑️ Clear Form</button>
            
            <div class="json-output">
                <h3>JSON Output</h3>
                <textarea id="jsonOutput" class="json-textarea" readonly placeholder="Form data will appear here..."></textarea>
            </div>
            
            <div id="validationSummary" style="display: none;"></div>
            <div id="successMessage" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        ${this.generateJavaScript(pages)}
    </script>
</body>
</html>`;
  }

  static generatePageNavigation(pages) {
    if (pages.length <= 1) return '';

    return `
      <div class="page-nav">
        ${pages.map((page, index) => `
          <button type="button" class="page-btn ${index === 0 ? 'active' : ''}" onclick="showPage(${index})">
            ${page.title || `Page ${index + 1}`}
          </button>
        `).join('')}
      </div>
    `;
  }

  static generatePages(pages) {
    return pages.map((page, pageIndex) => `
      <div class="page ${pageIndex === 0 ? 'active' : ''}" id="page${pageIndex}">
        ${this.generateSections(page.sections || [], pageIndex)}
      </div>
    `).join('');
  }

  static generateSections(sections, pageIndex) {
    if (sections.length === 0) {
      return '<p style="text-align: center; color: #6b7280; padding: 40px;">No content on this page</p>';
    }

    return sections.map((section, sectionIndex) => `
      <div class="section">
        <div class="section-header">
          📋 ${section.title || `Section ${sectionIndex + 1}`}
        </div>
        <div class="section-content">
          ${this.generateGroups(section.groups || [], pageIndex, sectionIndex)}
        </div>
      </div>
    `).join('');
  }

  static generateGroups(groups, pageIndex, sectionIndex) {
    return groups.map((group, groupIndex) => {
      const groupId = `group_${pageIndex}_${sectionIndex}_${groupIndex}`;
      
      return `
        <div class="group" id="${groupId}">
          <div class="group-header">
            <div class="group-title">
              📁 ${group.title || `Group ${groupIndex + 1}`}
              ${group.repeatable ? '<span class="repeatable-badge">Repeatable</span>' : ''}
            </div>
            ${group.repeatable ? `
              <button type="button" class="add-instance-btn" onclick="addGroupInstance('${groupId}', ${pageIndex}, ${sectionIndex}, ${groupIndex})">
                ➕ Add
              </button>
            ` : ''}
          </div>
          <div id="${groupId}_instances">
            ${this.generateGroupInstance(group, pageIndex, sectionIndex, groupIndex, 0, group.repeatable)}
          </div>
        </div>
      `;
    }).join('');
  }

  static generateGroupInstance(group, pageIndex, sectionIndex, groupIndex, instanceIndex, isRepeatable) {
    const instanceId = `instance_${pageIndex}_${sectionIndex}_${groupIndex}_${instanceIndex}`;
    
    return `
      <div class="group-instance" id="${instanceId}">
        ${isRepeatable && instanceIndex > 0 ? `
          <div class="instance-header">
            <span class="instance-number">Instance ${instanceIndex + 1}</span>
            <button type="button" class="remove-instance-btn" onclick="removeGroupInstance('${instanceId}')">
              ❌ Remove
            </button>
          </div>
        ` : ''}
        ${this.generateQuestions(group.questions || [], pageIndex, sectionIndex, groupIndex, instanceIndex)}
      </div>
    `;
  }

  static generateQuestions(questions, pageIndex, sectionIndex, groupIndex, instanceIndex) {
    return questions.map((question, questionIndex) => {
      const fieldId = `field_${pageIndex}_${sectionIndex}_${groupIndex}_${questionIndex}_${instanceIndex}`;
      const questionId = question.id || `q_${pageIndex}_${sectionIndex}_${groupIndex}_${questionIndex}`;

      // Build conditional visibility attributes
      const conditionalAttrs = question.parent_question_id
        ? `data-parent="${question.parent_question_id}" data-show-when='${JSON.stringify(question.show_when || null)}' style="display: none;"`
        : '';

      if (question.answer_type === 'display_text') {
        return `
          <div class="display-text" ${conditionalAttrs}>
            ${question.question}
          </div>
        `;
      }

      const required = question.required ? 'required' : '';
      const requiredIndicator = question.required ? ' <span class="required">*</span>' : '';
      const validation = question.validation || {};

      let inputHtml = '';

      switch (question.answer_type) {
        case 'textarea':
          inputHtml = `
            <textarea 
              id="${fieldId}" 
              name="${fieldId}" 
              class="form-control" 
              rows="4" 
              ${required}
              ${validation.minLength ? `minlength="${validation.minLength}"` : ''}
              ${validation.maxLength ? `maxlength="${validation.maxLength}"` : ''}
              oninput="validateField('${fieldId}')"
            ></textarea>
          `;
          break;

        case 'dropdown':
          inputHtml = `
            <select 
              id="${fieldId}" 
              name="${fieldId}" 
              class="form-control" 
              ${required}
              onchange="validateField('${fieldId}')"
            >
              <option value="">Select an option...</option>
              ${(question.options || []).map(option => {
                const value = typeof option === 'string' ? option : option.value || option.label || '';
                const label = typeof option === 'string' ? option : option.label || option.value || '';
                return `<option value="${this.escapeHtml(value)}">${this.escapeHtml(label)}</option>`;
              }).join('')}
            </select>
          `;
          break;

        case 'radio':
          inputHtml = `
            <div class="radio-group">
              ${(question.options || []).map((option, optIndex) => {
                const value = typeof option === 'string' ? option : option.value || option.label || '';
                const label = typeof option === 'string' ? option : option.label || option.value || '';
                const requiresInput = typeof option === 'object' && option.requires_input;
                const inputType = typeof option === 'object' ? option.input_type || 'text' : 'text';
                const conditionalId = `${fieldId}_conditional_${optIndex}`;
                
                return `
                  <div class="option">
                    <input 
                      type="radio" 
                      id="${fieldId}_${optIndex}" 
                      name="${fieldId}" 
                      value="${this.escapeHtml(value)}" 
                      ${required}
                      onchange="handleRadioChange('${fieldId}', '${fieldId}_${optIndex}', ${requiresInput})"
                    >
                    <label for="${fieldId}_${optIndex}">${this.escapeHtml(label)}</label>
                  </div>
                  ${requiresInput ? `
                    <div class="conditional-input" id="${conditionalId}_wrapper" style="display: none;">
                      <input 
                        type="${inputType}" 
                        id="${conditionalId}" 
                        name="${conditionalId}" 
                        class="form-control" 
                        placeholder="Enter ${inputType}..."
                      >
                    </div>
                  ` : ''}
                `;
              }).join('')}
            </div>
          `;
          break;

        case 'checkbox':
          inputHtml = `
            <div class="checkbox-group">
              ${(question.options || []).map((option, optIndex) => {
                const value = typeof option === 'string' ? option : option.value || option.label || '';
                const label = typeof option === 'string' ? option : option.label || option.value || '';
                const requiresInput = typeof option === 'object' && option.requires_input;
                const inputType = typeof option === 'object' ? option.input_type || 'text' : 'text';
                const conditionalId = `${fieldId}_conditional_${optIndex}`;
                
                return `
                  <div class="option">
                    <input 
                      type="checkbox" 
                      id="${fieldId}_${optIndex}" 
                      name="${fieldId}" 
                      value="${this.escapeHtml(value)}"
                      onchange="handleCheckboxChange('${fieldId}_${optIndex}', ${requiresInput})"
                    >
                    <label for="${fieldId}_${optIndex}">${this.escapeHtml(label)}</label>
                  </div>
                  ${requiresInput ? `
                    <div class="conditional-input" id="${conditionalId}_wrapper" style="display: none;">
                      <input 
                        type="${inputType}" 
                        id="${conditionalId}" 
                        name="${conditionalId}" 
                        class="form-control" 
                        placeholder="Enter ${inputType}..."
                      >
                    </div>
                  ` : ''}
                `;
              }).join('')}
            </div>
          `;
          break;

        case 'file':
          inputHtml = `
            <div class="file-upload-wrapper">
              <input 
                type="file" 
                id="${fieldId}" 
                name="${fieldId}" 
                style="display: none;"
                ${validation.accept ? `accept="${validation.accept}"` : ''}
                onchange="handleFileUpload('${fieldId}')"
                ${required}
              >
              <label for="${fieldId}" class="file-upload-label">
                📎 Click to upload file
              </label>
              <div id="${fieldId}_info" class="file-info" style="display: none;"></div>
            </div>
          `;
          break;

        default:
          const inputType = ['email', 'tel', 'date', 'number'].includes(question.answer_type) 
            ? question.answer_type 
            : 'text';
          inputHtml = `
            <input 
              type="${inputType}" 
              id="${fieldId}" 
              name="${fieldId}" 
              class="form-control" 
              ${required}
              ${validation.min !== undefined ? `min="${validation.min}"` : ''}
              ${validation.max !== undefined ? `max="${validation.max}"` : ''}
              ${validation.minLength ? `minlength="${validation.minLength}"` : ''}
              ${validation.maxLength ? `maxlength="${validation.maxLength}"` : ''}
              ${validation.pattern ? `pattern="${validation.pattern}"` : ''}
              oninput="validateField('${fieldId}')"
            >
          `;
      }

      // Generate sub-questions HTML if they exist
      let subQuestionsHtml = '';
      if (question.sub_questions && question.sub_questions.length > 0) {
        subQuestionsHtml = `
          <div class="sub-questions" style="margin-left: 24px; padding-left: 16px; border-left: 2px solid #e5e7eb; margin-top: 16px;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Sub-questions:</div>
            ${question.sub_questions.map((subQ, subIndex) => {
              const subFieldId = `${fieldId}_sub_${subIndex}`;
              const subRequired = subQ.required ? 'required' : '';
              const subRequiredIndicator = subQ.required ? ' <span class="required">*</span>' : '';

              return `
                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" for="${subFieldId}" style="color: #6b7280;">
                    ${this.escapeHtml(subQ.question)}${subRequiredIndicator}
                  </label>
                  ${subQ.answer_type === 'textarea' ? `
                    <textarea
                      id="${subFieldId}"
                      name="${subFieldId}"
                      class="form-control"
                      rows="3"
                      ${subRequired}
                    ></textarea>
                  ` : `
                    <input
                      type="${['email', 'tel', 'date', 'number'].includes(subQ.answer_type) ? subQ.answer_type : 'text'}"
                      id="${subFieldId}"
                      name="${subFieldId}"
                      class="form-control"
                      ${subRequired}
                    >
                  `}
                  <div id="${subFieldId}_error" class="error-message" style="display: none;"></div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      return `
        <div class="form-group" id="question_${questionId}" ${conditionalAttrs}>
          <label class="form-label" for="${fieldId}">
            ${this.escapeHtml(question.question)}${requiredIndicator}
          </label>
          ${inputHtml}
          <div id="${fieldId}_error" class="error-message" style="display: none;"></div>
          ${subQuestionsHtml}
        </div>
      `;
    }).join('');
  }

  static generateJavaScript(pages) {
    return `
      let groupInstanceCounters = {};

      function showPage(pageIndex) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById('page' + pageIndex).classList.add('active');
        document.querySelectorAll('.page-btn')[pageIndex].classList.add('active');
      }

      // Conditional question visibility
      function checkQuestionVisibility(parentQuestionId, value) {
        // Find all questions that depend on this parent
        const dependentQuestions = document.querySelectorAll('[data-parent="' + parentQuestionId + '"]');

        dependentQuestions.forEach(questionDiv => {
          const showWhenStr = questionDiv.getAttribute('data-show-when');
          const showWhen = showWhenStr ? JSON.parse(showWhenStr) : null;

          let shouldShow = false;

          if (!showWhen) {
            // No condition specified, show if parent has any value
            shouldShow = value && value !== '';
          } else if (Array.isArray(showWhen)) {
            // Multiple valid values
            if (Array.isArray(value)) {
              // Parent is checkbox (multiple values)
              shouldShow = showWhen.some(val => value.includes(val));
            } else {
              // Parent is single value
              shouldShow = showWhen.includes(value);
            }
          } else {
            // Single valid value
            if (Array.isArray(value)) {
              shouldShow = value.includes(showWhen);
            } else {
              shouldShow = value === showWhen;
            }
          }

          questionDiv.style.display = shouldShow ? 'block' : 'none';
        });
      }

      // Add event listeners for all questions that have dependents
      function initConditionalQuestions() {
        const allQuestions = document.querySelectorAll('[data-parent]');
        const parentIds = new Set();

        allQuestions.forEach(q => {
          const parentId = q.getAttribute('data-parent');
          if (parentId) parentIds.add(parentId);
        });

        parentIds.forEach(parentId => {
          // Find the parent question input element
          const parentElement = document.querySelector('#question_' + parentId);
          if (!parentElement) return;

          // Add listeners based on input type
          const radios = parentElement.querySelectorAll('input[type="radio"]');
          const checkboxes = parentElement.querySelectorAll('input[type="checkbox"]');
          const selects = parentElement.querySelectorAll('select');
          const inputs = parentElement.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');

          if (radios.length > 0) {
            radios.forEach(radio => {
              radio.addEventListener('change', function() {
                if (this.checked) {
                  checkQuestionVisibility(parentId, this.value);
                }
              });
            });
          }

          if (checkboxes.length > 0) {
            checkboxes.forEach(checkbox => {
              checkbox.addEventListener('change', function() {
                const checkedValues = Array.from(checkboxes)
                  .filter(cb => cb.checked)
                  .map(cb => cb.value);
                checkQuestionVisibility(parentId, checkedValues);
              });
            });
          }

          if (selects.length > 0) {
            selects.forEach(select => {
              select.addEventListener('change', function() {
                checkQuestionVisibility(parentId, this.value);
              });
            });
          }

          if (inputs.length > 0) {
            inputs.forEach(input => {
              input.addEventListener('blur', function() {
                checkQuestionVisibility(parentId, this.value);
              });
            });
          }
        });
      }

      // Initialize on page load
      document.addEventListener('DOMContentLoaded', initConditionalQuestions);
      
      function addGroupInstance(groupId, pageIndex, sectionIndex, groupIndex) {
        if (!groupInstanceCounters[groupId]) {
          groupInstanceCounters[groupId] = 1;
        }
        groupInstanceCounters[groupId]++;
        
        const instanceIndex = groupInstanceCounters[groupId] - 1;
        const instancesContainer = document.getElementById(groupId + '_instances');
        
        // Get the group data from the page structure
        const group = ${JSON.stringify(pages)}.pages[pageIndex].sections[sectionIndex].groups[groupIndex];
        
        const instanceHtml = createGroupInstance(group, pageIndex, sectionIndex, groupIndex, instanceIndex, true);
        instancesContainer.insertAdjacentHTML('beforeend', instanceHtml);
      }
      
      function createGroupInstance(group, pageIndex, sectionIndex, groupIndex, instanceIndex, isRepeatable) {
        const instanceId = 'instance_' + pageIndex + '_' + sectionIndex + '_' + groupIndex + '_' + instanceIndex;
        
        let html = '<div class="group-instance" id="' + instanceId + '">';
        
        if (isRepeatable && instanceIndex > 0) {
          html += '<div class="instance-header">';
          html += '<span class="instance-number">Instance ' + (instanceIndex + 1) + '</span>';
          html += '<button type="button" class="remove-instance-btn" onclick="removeGroupInstance(\\'' + instanceId + '\\')">❌ Remove</button>';
          html += '</div>';
        }
        
        // Generate questions (simplified - you'd need to replicate the full logic)
        group.questions.forEach((question, qIndex) => {
          const fieldId = 'field_' + pageIndex + '_' + sectionIndex + '_' + groupIndex + '_' + qIndex + '_' + instanceIndex;
          
          if (question.answer_type !== 'display_text') {
            html += '<div class="form-group">';
            html += '<label class="form-label">' + question.question + '</label>';
            html += '<input type="text" id="' + fieldId + '" name="' + fieldId + '" class="form-control">';
            html += '</div>';
          }
        });
        
        html += '</div>';
        return html;
      }
      
      function removeGroupInstance(instanceId) {
        const instance = document.getElementById(instanceId);
        if (instance) {
          instance.remove();
        }
      }
      
      function handleRadioChange(fieldId, optionId, requiresInput) {
        // Hide all conditional inputs for this field
        const allConditionals = document.querySelectorAll('[id^="' + fieldId + '_conditional_"]');
        allConditionals.forEach(input => {
          const wrapper = input.parentElement;
          if (wrapper) wrapper.style.display = 'none';
        });
        
        // Show conditional input if required
        if (requiresInput) {
          const optionIndex = optionId.split('_').pop();
          const conditionalWrapper = document.getElementById(fieldId + '_conditional_' + optionIndex + '_wrapper');
          if (conditionalWrapper) {
            conditionalWrapper.style.display = 'block';
          }
        }
        
        validateField(fieldId);
      }
      
      function handleCheckboxChange(optionId, requiresInput) {
        if (requiresInput) {
          const checkbox = document.getElementById(optionId);
          const fieldId = optionId.substring(0, optionId.lastIndexOf('_'));
          const optionIndex = optionId.split('_').pop();
          const conditionalWrapper = document.getElementById(fieldId + '_conditional_' + optionIndex + '_wrapper');
          
          if (conditionalWrapper) {
            conditionalWrapper.style.display = checkbox.checked ? 'block' : 'none';
          }
        }
      }
      
      function handleFileUpload(fieldId) {
        const input = document.getElementById(fieldId);
        const infoDiv = document.getElementById(fieldId + '_info');
        
        if (input.files && input.files[0]) {
          const file = input.files[0];
          infoDiv.innerHTML = '📄 ' + file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)';
          infoDiv.style.display = 'block';
        }
        
        validateField(fieldId);
      }
      
      function validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + '_error');
        
        if (!field || !errorDiv) return true;
        
        field.classList.remove('error');
        errorDiv.style.display = 'none';
        
        // Required validation
        if (field.hasAttribute('required')) {
          if (!field.value || field.value.trim() === '') {
            field.classList.add('error');
            errorDiv.textContent = 'This field is required';
            errorDiv.style.display = 'block';
            return false;
          }
        }
        
        // Pattern validation
        if (field.hasAttribute('pattern') && field.value) {
          const pattern = new RegExp(field.getAttribute('pattern'));
          if (!pattern.test(field.value)) {
            field.classList.add('error');
            errorDiv.textContent = 'Invalid format';
            errorDiv.style.display = 'block';
            return false;
          }
        }
        
        return true;
      }
      
      function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Validate all visible fields
        document.querySelectorAll('.form-control').forEach(field => {
          if (field.offsetParent !== null) { // Check if visible
            if (!validateField(field.id)) {
              isValid = false;
              errors.push(field.id);
            }
          }
        });
        
        const validationSummary = document.getElementById('validationSummary');
        const successMessage = document.getElementById('successMessage');
        
        if (!isValid) {
          validationSummary.className = 'validation-summary';
          validationSummary.innerHTML = '⚠️ Please fill in ' + errors.length + ' required field(s)';
          validationSummary.style.display = 'block';
          successMessage.style.display = 'none';
        } else {
          validationSummary.style.display = 'none';
        }
        
        return isValid;
      }
      
      function exportToJSON() {
        if (!validateForm()) {
          alert('Please fill in all required fields before exporting.');
          return;
        }
        
        const form = document.getElementById('mainForm');
        const formData = new FormData(form);
        const jsonData = { 
          formData: {}, 
          metadata: { 
            exportedAt: new Date().toISOString(),
            totalPages: ${pages.length}
          } 
        };
        
        // Organize data hierarchically
        for (let [key, value] of formData.entries()) {
          // Parse field key to extract structure
          const parts = key.split('_');
          if (parts[0] === 'field') {
            const pageIndex = parts[1];
            const sectionIndex = parts[2];
            const groupIndex = parts[3];
            const questionIndex = parts[4];
            const instanceIndex = parts[5];
            
            const pageKey = 'page_' + pageIndex;
            if (!jsonData.formData[pageKey]) {
              jsonData.formData[pageKey] = { sections: {} };
            }
            
            const sectionKey = 'section_' + sectionIndex;
            if (!jsonData.formData[pageKey].sections[sectionKey]) {
              jsonData.formData[pageKey].sections[sectionKey] = { groups: {} };
            }
            
            const groupKey = 'group_' + groupIndex;
            if (!jsonData.formData[pageKey].sections[sectionKey].groups[groupKey]) {
              jsonData.formData[pageKey].sections[sectionKey].groups[groupKey] = { instances: {} };
            }
            
            const instanceKey = 'instance_' + instanceIndex;
            if (!jsonData.formData[pageKey].sections[sectionKey].groups[groupKey].instances[instanceKey]) {
              jsonData.formData[pageKey].sections[sectionKey].groups[groupKey].instances[instanceKey] = {};
            }
            
            jsonData.formData[pageKey].sections[sectionKey].groups[groupKey].instances[instanceKey]['question_' + questionIndex] = value;
          }
        }
        
        document.getElementById('jsonOutput').value = JSON.stringify(jsonData, null, 2);
        
        const successMessage = document.getElementById('successMessage');
        successMessage.className = 'success-message';
        successMessage.innerHTML = '✅ Form completed successfully!';
        successMessage.style.display = 'block';
      }
      
      function copyJSON() {
        const jsonOutput = document.getElementById('jsonOutput');
        if (jsonOutput.value) {
          jsonOutput.select();
          document.execCommand('copy');
          alert('JSON copied to clipboard!');
        } else {
          alert('Please export the form data first');
        }
      }
      
      function clearForm() {
        if (confirm('Clear all form data?')) {
          document.getElementById('mainForm').reset();
          document.getElementById('jsonOutput').value = '';
          document.getElementById('validationSummary').style.display = 'none';
          document.getElementById('successMessage').style.display = 'none';
          
          // Reset all error states
          document.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('error');
          });
          document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
          });
          
          // Reset file upload displays
          document.querySelectorAll('.file-info').forEach(info => {
            info.style.display = 'none';
          });
          
          // Reset conditional inputs
          document.querySelectorAll('.conditional-input').forEach(input => {
            input.style.display = 'none';
          });
        }
      }
    `;
  }

  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

export default HtmlExporter;

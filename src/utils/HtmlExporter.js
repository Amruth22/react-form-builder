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
            max-width: 800px;
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
            border-radius: 25px;
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
        
        .form-group {
            margin-bottom: 25px;
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
        
        .radio-group, .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .option {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .option input[type="radio"], .option input[type="checkbox"] {
            width: auto;
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
            Page ${page.page_number || index + 1}
          </button>
        `).join('')}
      </div>
    `;
  }

  static generatePages(pages) {
    return pages.map((page, pageIndex) => `
      <div class="page ${pageIndex === 0 ? 'active' : ''}" id="page${pageIndex}">
        ${this.generateQuestions(page.form_elements || [])}
      </div>
    `).join('');
  }

  static generateQuestions(questions) {
    return questions.map((question, index) => {
      if (question.answer_type === 'display_text') {
        return `
          <div class="form-group">
            <p><strong>${question.question}</strong></p>
          </div>
        `;
      }

      const questionId = `question_${index}`;
      const required = question.required ? 'required' : '';
      const requiredIndicator = question.required ? ' <span class="required">*</span>' : '';

      let inputHtml = '';

      switch (question.answer_type) {
        case 'textarea':
          inputHtml = `<textarea id="${questionId}" name="${questionId}" class="form-control" rows="4" ${required}></textarea>`;
          break;

        case 'dropdown':
          inputHtml = `
            <select id="${questionId}" name="${questionId}" class="form-control" ${required}>
              <option value="">Select an option...</option>
              ${(question.options || []).map(option => {
                const value = typeof option === 'string' ? option : option.value || option.label || '';
                const label = typeof option === 'string' ? option : option.label || option.value || '';
                return `<option value="${value}">${label}</option>`;
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
                return `
                  <div class="option">
                    <input type="radio" id="${questionId}_${optIndex}" name="${questionId}" value="${value}" ${required}>
                    <label for="${questionId}_${optIndex}">${label}</label>
                  </div>
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
                return `
                  <div class="option">
                    <input type="checkbox" id="${questionId}_${optIndex}" name="${questionId}" value="${value}">
                    <label for="${questionId}_${optIndex}">${label}</label>
                  </div>
                `;
              }).join('')}
            </div>
          `;
          break;

        default:
          const inputType = ['email', 'tel', 'date', 'number'].includes(question.answer_type) 
            ? question.answer_type 
            : 'text';
          inputHtml = `<input type="${inputType}" id="${questionId}" name="${questionId}" class="form-control" ${required}>`;
      }

      return `
        <div class="form-group">
          <label class="form-label" for="${questionId}">
            ${question.question}${requiredIndicator}
          </label>
          ${inputHtml}
        </div>
      `;
    }).join('');
  }

  static generateJavaScript(pages) {
    return `
      function showPage(pageIndex) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));
        
        document.getElementById('page' + pageIndex).classList.add('active');
        document.querySelectorAll('.page-btn')[pageIndex].classList.add('active');
      }
      
      function exportToJSON() {
        const form = document.getElementById('mainForm');
        const formData = new FormData(form);
        const jsonData = { 
          formData: {}, 
          metadata: { 
            exportedAt: new Date().toISOString(),
            totalPages: ${pages.length}
          } 
        };
        
        for (let [key, value] of formData.entries()) {
          if (jsonData.formData[key]) {
            if (Array.isArray(jsonData.formData[key])) {
              jsonData.formData[key].push(value);
            } else {
              jsonData.formData[key] = [jsonData.formData[key], value];
            }
          } else {
            jsonData.formData[key] = value;
          }
        }
        
        document.getElementById('jsonOutput').value = JSON.stringify(jsonData, null, 2);
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
        }
      }
    `;
  }
}

export default HtmlExporter;
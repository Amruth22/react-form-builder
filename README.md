# 🎨 React Form Builder

A simple, intuitive drag & drop form builder for JSON-extracted PDF forms. Import JSON files from PDF processing, organize questions visually, and export beautiful HTML forms.

## ✨ Features

### 🎯 **Core Functionality**
- **🆕 Direct PDF Upload** - Upload PDF files and automatically extract form fields with AI
- **Drag & Drop JSON Import** - Simply drop your JSON file to get started
- **Hierarchical Structure** - Full support for Pages → Sections → Groups → Questions
- **Visual Form Builder** - Organize questions with intuitive drag & drop at all levels
- **Repeatable Groups** - Dynamic form sections that users can add/remove instances
- **Live Form Preview** - See exactly how your form will look and function
- **Interactive Testing** - Fill out the form and test all functionality including repeatable groups
- **Live Editing** - Click to edit questions, groups, and sections inline
- **Multi-page Support** - Handle complex forms with multiple pages
- **Conditional Inputs** - Options that require additional user input
- **File Upload Support** - Handle file uploads with preview for images
- **Advanced Validation** - Min/max length, pattern matching, custom error messages
- **JSON Export** - Export filled form data as structured hierarchical JSON
- **Excel Export** - Export form structure to Excel spreadsheet (.xlsx) for analysis and documentation
- **HTML Export** - Generate clean, responsive HTML forms with all features

### 🎨 **User Experience**
- **Clean, Modern UI** - Built with Tailwind CSS
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished interactions and transitions
- **Intuitive Navigation** - Easy-to-use interface for all skill levels

### 🔧 **Technical Features**
- **React 18** - Modern React with hooks
- **TypeScript Ready** - Easy to convert to TypeScript
- **Component Architecture** - Modular, reusable components
- **No Backend Required** - Pure frontend application

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- **Flask PDF Extractor API** (for PDF upload feature) - [Get it here](https://github.com/Amruth22/pdf-form-extractor)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amruth22/react-form-builder.git
   cd react-form-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Backend (Optional - for PDF upload)**
   ```bash
   # Copy environment template to create local .env file
   cp .env.example .env

   # Edit .env and set your backend API URL
   # For local development (default):
   REACT_APP_API_BASE_URL=

   # For production or remote backend:
   REACT_APP_API_BASE_URL=https://your-api-domain.com

   # Optional: Add API key if your backend requires authentication
   REACT_APP_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

   The app will:
   - Use `REACT_APP_API_BASE_URL` from `.env` if set
   - Default to `http://localhost:5000` if `.env` is empty
   - Allow offline use for JSON/form building

### With PDF Upload Feature

To use the PDF upload feature, you need the Flask API running:

```bash
# Terminal 1: Start Flask API
cd pdf-form-extractor
python flask_api.py

# Terminal 2: Start React App
cd react-form-builder
npm start
```

See [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) for detailed setup.

## 📖 How to Use

### 1. **Import Form Data**

**Option A: Upload PDF (Recommended)**
- Click "Upload PDF" button
- Drag & drop your PDF file or click to browse
- AI will automatically extract all form fields (2-5 minutes)
- Form builder loads automatically with extracted data

**Option B: Upload JSON**
- Click "Upload JSON" button
- Drag & drop your JSON file (from PDF processing)
- Or click to browse and select your file
- The app will automatically parse and load your form structure

### 2. **Build Your Form**
- **Drag questions** up and down to reorder
- **Click edit** to modify question text, type, and options
- **Add new questions** with the "Add Question" button
- **Delete questions** you don't need
- **Switch between pages** if your form has multiple pages

### 3. **Preview Your Form**
- Click "Preview" to see exactly how your form will look
- **Test all functionality** - fill out fields, select options
- **Validate required fields** - see real-time validation
- **Export test data** as JSON to verify structure
- **Multi-page navigation** works exactly like the final form

### 4. **Export Your Form**
- **Export HTML** - Generate a standalone HTML form file with all functionality
- **Export Excel** - Export the form structure to Excel (.xlsx) for documentation and analysis
  - Includes all questions with their properties, validation rules, and metadata
  - Separate sheet with document info and statistics
  - Perfect for sharing with stakeholders or creating documentation
- **Download JSON** - Export the raw JSON structure for backup or version control

## 🎯 Supported Question Types

| Type | Description | Features |
|------|-------------|----------|
| **Text Input** | Single line text | Validation, Min/Max length |
| **Email** | Email validation | Pattern validation |
| **Phone** | Phone number input | Pattern validation |
| **Date** | Date picker | Min/Max date |
| **Number** | Numeric input | Min/Max value |
| **Long Text** | Multi-line textarea | Min/Max length |
| **Dropdown** | Select from options | Auto-detect states/provinces |
| **Radio Buttons** | Single choice | Conditional inputs |
| **Checkboxes** | Multiple choice | Conditional inputs |
| **File Upload** | File attachment | Type restrictions, size limits, image preview |
| **Display Text** | Information only | Rich text display |

## 📁 Project Structure

```
react-form-builder/
├── public/
│   └── index.html                      # HTML template
├── src/
│   ├── components/
│   │   ├── Header.js                   # Navigation header with view switching
│   │   ├── PdfUploadZone.js            # PDF/JSON file upload component
│   │   ├── FormBuilder.js              # Main form builder interface
│   │   ├── QuestionCard.js             # Individual question display card
│   │   └── QuestionEditor.js           # Question editing modal
│   ├── config/
│   │   └── api.js                      # API configuration with environment variables
│   ├── utils/
│   │   ├── formUtils.js                # Form data manipulation utilities
│   │   ├── HtmlExporter.js             # HTML generation and form export
│   │   ├── ExcelExporter.js            # Excel (.xlsx) structure export
│   │   └── pdfFieldDetection.js        # PDF field type detection
│   ├── App.js                          # Main application component
│   ├── index.js                        # React entry point
│   └── index.css                       # Global styles with Tailwind
├── .env                                # Local environment configuration (not committed)
├── .env.example                        # Environment template for developers
├── .gitignore                          # Git ignore rules
├── package.json                        # Dependencies and scripts
├── tailwind.config.js                  # Tailwind CSS configuration
├── README.md                           # This file
└── LICENSE                             # MIT License
```

### Key Component Descriptions

| Component | Purpose |
|-----------|---------|
| **FormBuilder.js** | Main interface - manages pages, sections, groups, and questions with drag & drop |
| **QuestionEditor.js** | Modal for editing individual questions with comprehensive options |
| **QuestionCard.js** | Displays each question with metadata, validation, and parent dependencies |
| **PdfUploadZone.js** | File upload component supporting PDF and JSON imports |
| **Header.js** | Navigation and view switching between import and builder modes |
| **HtmlExporter.js** | Converts form structure to standalone HTML with full functionality |
| **ExcelExporter.js** | Exports form structure to Excel spreadsheet with metadata |
| **formUtils.js** | Utilities for form data normalization, ID generation, and manipulation |
| **pdfFieldDetection.js** | Smart detection of PDF field types and properties |
| **api.js** | Centralized API configuration with environment variable support |

## ⚙️ Environment Configuration

The application uses environment variables for flexible backend configuration. This allows different setups for local development and production deployment.

### Configuration Files

**`.env`** (Local only - NOT committed to git)
```bash
# Set your backend API URL for this environment
REACT_APP_API_BASE_URL=https://your-production-backend.com

# Optional: API key if your backend requires authentication
REACT_APP_API_KEY=your_secret_api_key
```

**`.env.example`** (Template - committed to git)
- Contains all available environment variables
- Developers copy this to `.env` and fill in values
- Provides documentation for each variable

### Default Behavior

| Scenario | Configuration | Result |
|----------|---------------|--------|
| **Local Development** | `.env` is empty | Uses `http://localhost:5000` |
| **Production** | Set `REACT_APP_API_BASE_URL` | Uses specified URL |
| **API Key Required** | Set `REACT_APP_API_KEY` | Sent with each API request |
| **No Backend** | Both empty | Offline mode for JSON building |

### Usage Examples

**Local Development (Default)**
```bash
# Leave .env empty or don't create it
# Application will use http://localhost:5000
npm start
```

**Production with API**
```bash
# Edit .env file
REACT_APP_API_BASE_URL=https://api.production.com
REACT_APP_API_KEY=sk_live_abc123xyz789

# Build and deploy
npm run build
```

**Docker/Container Deployment**
```bash
# .env file
REACT_APP_API_BASE_URL=http://backend-service:5000
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

### Key Dependencies

- **React 18** - UI framework
- **@hello-pangea/dnd** - Drag and drop functionality
- **Lucide React** - Beautiful icons
- **Tailwind CSS** - Utility-first CSS framework
- **xlsx** - Excel file generation for export feature

## 🆕 New Features Explained

### **Hierarchical Structure**
The form builder now supports a complete hierarchical organization:
- **Pages**: Top-level containers for multi-page forms
- **Sections**: Logical groupings within pages (e.g., "Personal Information", "Medical History")
- **Groups**: Sub-groupings within sections that can be repeatable
- **Questions**: Individual form fields

### **Repeatable Groups**
Groups can be marked as `repeatable: true`, allowing users to:
- Add multiple instances of the same group (e.g., multiple beneficiaries, dependents)
- Remove instances they don't need
- Each instance maintains its own set of answers

### **Conditional Inputs**
Options in radio buttons and checkboxes can require additional input:
```json
{
  "value": "other",
  "label": "Other (please specify)",
  "requires_input": true,
  "input_type": "text"
}
```

### **Auto-Detection**
Dropdown fields can auto-populate with common data:
- US States (50 states)
- Canadian Provinces (13 provinces/territories)
- Set `"auto_detected": "province_state"` in your JSON

### **Multi-Person Questions**
Special question type for forms requiring multiple respondents:
- Target question to specific people: applicant, spouse, employee, dependent, etc.
- Each person answers the same question independently
- Useful for insurance forms, family information, team surveys
- Set `"answer_type": "radio_multi_person"` with `"applies_to": ["spouse", "child"]`

### **Sub-Questions**
Nest related questions under a parent question:
- Create hierarchical question relationships (e.g., Name → First Name, Last Name)
- Maintains parent-child structure in exported forms
- Each sub-question has independent settings and validation
- Perfect for breaking down complex fields into simpler inputs

### **Advanced Validation**
Questions support comprehensive validation rules:
- `minLength` / `maxLength` - Character limits
- `min` / `max` - Numeric ranges
- `pattern` - Regular expression validation
- `errorMessage` - Custom error messages
- `accept` - File type restrictions (for file uploads)
- `maxSize` - File size limits in MB

### **File Uploads**
Full support for file attachments:
- Image preview for uploaded images
- File name and size display
- Type and size restrictions
- Base64 encoding in JSON export

## 📊 JSON File Format

The app supports both old (flat) and new (hierarchical) formats.

### **New Hierarchical Format** (Recommended):

```json
{
  "document_info": {
    "source_pdf": "application_form",
    "total_pages": 2,
    "extraction_method": "Enhanced Claude Vision",
    "version": "4.0"
  },
  "pages": [
    {
      "title": "Page 1: Personal Information",
      "sections": [
        {
          "title": "Basic Information",
          "groups": [
            {
              "title": "Applicant Details",
              "repeatable": false,
              "questions": [
                {
                  "question": "Full Name",
                  "answer_type": "text",
                  "required": true,
                  "validation": {
                    "minLength": 2,
                    "maxLength": 100,
                    "errorMessage": "Name must be between 2-100 characters"
                  }
                },
                {
                  "question": "State",
                  "answer_type": "dropdown",
                  "options": ["Alabama", "Alaska", "..."],
                  "auto_detected": "province_state",
                  "required": true
                }
              ]
            }
          ]
        },
        {
          "title": "Beneficiaries",
          "groups": [
            {
              "title": "Beneficiary Information",
              "repeatable": true,
              "questions": [
                {
                  "question": "Beneficiary Name",
                  "answer_type": "text",
                  "required": true
                },
                {
                  "question": "Relationship",
                  "answer_type": "radio",
                  "options": [
                    {"value": "spouse", "label": "Spouse"},
                    {"value": "child", "label": "Child"},
                    {
                      "value": "other",
                      "label": "Other (specify)",
                      "requires_input": true,
                      "input_type": "text"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### **Old Flat Format** (Still Supported):
```json
{
  "document_info": {
    "source_pdf": "document_name",
    "total_pages": 1
  },
  "pages": [
    {
      "page_number": 1,
      "form_elements": [
        {
          "question": "Full Name:",
          "answer_type": "text",
          "required": true
        }
      ]
    }
  ]
}
```
*Note: Old format is automatically converted to hierarchical structure on import.*

## ✨ Recent Improvements

### Code Quality & Performance
- ✅ **Zero ESLint Warnings** - All React hooks dependencies properly configured
- ✅ **Accessibility Improvements** - HTML labels properly linked to form inputs (WCAG compliance)
- ✅ **Code Refactoring** - Complex ternary operators extracted into readable helper functions
- ✅ **Removed Unused Code** - Cleaned up unused components (FormPreview.js, JsonDropZone.js)
- ✅ **Optimized Bundle** - Reduced bundle size by ~400 bytes
- ✅ **Best Practices** - Pure utility functions moved outside components

### Architecture
- 📦 **Modular Design** - Clear separation of concerns (components, utils, config)
- 🔧 **Configuration Management** - Centralized API configuration with environment variables
- 🎯 **Form Data Processing** - Robust normalization supporting both old and new JSON formats
- 📊 **Export Capabilities** - HTML, Excel, and JSON export with complete form structure

### Testing & Validation
- ✓ Production build compiles successfully
- ✓ All API endpoints properly configured
- ✓ Environment variables properly resolved
- ✓ File uploads and exports fully functional

## 📤 Export Features

### **HTML Export**
Generate a complete, standalone HTML form that works offline:
- ✓ All form functionality included (validation, dropdowns, file uploads)
- ✓ Responsive design with Tailwind CSS
- ✓ Repeatable groups with dynamic add/remove
- ✓ Conditional question display
- ✓ File preview for images
- ✓ JSON export button in the HTML form itself
- **Usage**: Single-file deployment, email distribution, embedded in other sites

### **Excel Export**
Export form structure to `.xlsx` spreadsheet for analysis and documentation:
- ✓ All questions listed with full metadata
- ✓ Columns for validation rules, options, parent dependencies
- ✓ Separate "Document Info" sheet with statistics
- ✓ Section merging with summary statistics
- ✓ Frozen header row for easy reading
- **Usage**: Share with stakeholders, create documentation, analyze form structure

### **JSON Export**
Download the complete form data in JSON format:
- ✓ Full hierarchical structure preserved
- ✓ All metadata and validation rules included
- ✓ Backup and version control friendly
- **Usage**: Backup, reimport into other tools, API integration

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Component styles use Tailwind utility classes

### Adding Question Types
1. Update `QuestionCard.js` icon mapping
2. Add handling in `QuestionEditor.js`
3. Implement in `HtmlExporter.js`

### Custom Validation
- Extend the `validation` object in question data
- Add validation logic in `HtmlExporter.js`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify** - Drag & drop the `build` folder
- **Vercel** - Connect your GitHub repository
- **GitHub Pages** - Use `gh-pages` package
- **Any Static Host** - Upload the `build` folder contents

## 🤝 Integration

### With PDF Processing App
1. **Export JSON** from your PDF processing app
2. **Import JSON** into this form builder
3. **Customize** the form as needed
4. **Export HTML** for final use

### Workflow
```
PDF → PDF Processing App → JSON → Form Builder → HTML Form / Excel Export
```

See [EXCEL_EXPORT_GUIDE.md](EXCEL_EXPORT_GUIDE.md) for detailed documentation on the Excel export feature.

## 🐛 Troubleshooting

### Common Issues

**PDF Upload Returns Error**
- Ensure Flask API is running on the configured URL
- Check `.env` file has correct `REACT_APP_API_BASE_URL`
- For local development, Flask should run on `http://localhost:5000`
- Check browser console for detailed error messages
- Verify PDF file is not corrupted

**API Connection Fails**
- Verify backend service is running and accessible
- Check `.env` file for correct API URL
- Try `http://localhost:5000/api/health` in browser to test connectivity
- Look for CORS issues in browser console
- Check API key if `REACT_APP_API_KEY` is set

**JSON file not recognized**
- Ensure the file has the correct structure (hierarchical or flat)
- Verify it's a valid JSON file (use JSON validator)
- Check that it contains `pages` and either `form_elements` or `sections`
- Old flat format will be auto-converted to hierarchical

**Environment Variables Not Loading**
- Ensure `.env` file is in the root directory (not in `src/`)
- Variables must start with `REACT_APP_` prefix
- You must restart `npm start` after creating/modifying `.env`
- Clear browser cache and restart the dev server

**Drag & drop not working**
- Make sure you're dragging by the grip handle (⋮⋮)
- Check browser compatibility (works in Chrome, Firefox, Safari, Edge)
- Try refreshing the page
- Ensure JavaScript is enabled

**Export not working**
- Check browser's download settings
- Ensure popup blockers aren't interfering
- Try a different browser
- Check browser console for errors
- Verify sufficient disk space for downloads

**Build Fails**
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then reinstall
- Clear npm cache: `npm cache clean --force`
- Check Node.js version is 16+: `node --version`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons
- **@hello-pangea/dnd** - For drag and drop functionality

---

<div align="center">

**🎨 React Form Builder**  
*Simple, intuitive form building for everyone*

[🐛 Report Bug](https://github.com/Amruth22/react-form-builder/issues) | [💡 Request Feature](https://github.com/Amruth22/react-form-builder/issues) | [⭐ Star this repo](https://github.com/Amruth22/react-form-builder)

</div>
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

3. **Start development server**
   ```bash
   npm start
   ```

4. **Configure API (Optional - for PDF upload)**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env and set API URL
   REACT_APP_API_URL=http://localhost:5000
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

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
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Header.js           # Navigation header
│   │   ├── JsonDropZone.js     # File upload component
│   │   ├── FormBuilder.js      # Main form builder
│   │   ├── FormPreview.js      # Live form preview with testing
│   │   ├── QuestionCard.js     # Individual question display
│   │   └── QuestionEditor.js   # Question editing modal
│   ├── utils/
│   │   └── HtmlExporter.js     # HTML generation utility
│   ├── App.js                  # Main application component
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

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

**JSON file not recognized**
- Ensure the file has the correct structure
- Check that it's a valid JSON file
- Verify it contains `pages` and `form_elements`

**Drag & drop not working**
- Make sure you're dragging by the grip handle
- Check browser compatibility
- Try refreshing the page

**Export not working**
- Check browser's download settings
- Ensure popup blockers aren't interfering
- Try a different browser

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
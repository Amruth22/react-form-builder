# 🎨 React Form Builder

A simple, intuitive drag & drop form builder for JSON-extracted PDF forms. Import JSON files from PDF processing, organize questions visually, and export beautiful HTML forms.

## ✨ Features

### 🎯 **Core Functionality**
- **Drag & Drop JSON Import** - Simply drop your JSON file to get started
- **Visual Form Builder** - Organize questions with intuitive drag & drop
- **Live Form Preview** - See exactly how your form will look and function
- **Interactive Testing** - Fill out the form and test all functionality
- **Live Editing** - Click to edit questions inline
- **Multi-page Support** - Handle complex forms with multiple pages
- **JSON Export** - Export filled form data as structured JSON
- **HTML Export** - Generate clean, responsive HTML forms

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

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📖 How to Use

### 1. **Import JSON File**
- Drag & drop your JSON file (from PDF processing) onto the upload zone
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

### 4. **Export HTML Form**
- Click "Export HTML" to generate your final form
- The HTML file will be downloaded automatically
- Open the HTML file in any browser to use your form

## 🎯 Supported Question Types

| Type | Description | Options |
|------|-------------|---------|
| **Text Input** | Single line text | - |
| **Email** | Email validation | - |
| **Phone** | Phone number input | - |
| **Date** | Date picker | - |
| **Number** | Numeric input | - |
| **Long Text** | Multi-line textarea | - |
| **Dropdown** | Select from options | ✅ |
| **Radio Buttons** | Single choice | ✅ |
| **Checkboxes** | Multiple choice | ✅ |
| **Display Text** | Information only | - |

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

## 📊 JSON File Format

The app expects JSON files with this structure (from PDF processing):

```json
{
  "document_info": {
    "source_pdf": "document_name",
    "total_pages": 2,
    "total_form_elements": 10
  },
  "pages": [
    {
      "page_number": 1,
      "form_elements": [
        {
          "question": "Full Name:",
          "answer_type": "text",
          "required": true
        },
        {
          "question": "Country:",
          "answer_type": "dropdown",
          "options": ["USA", "Canada", "UK"],
          "required": false
        }
      ]
    }
  ]
}
```

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
PDF → PDF Processing App → JSON → Form Builder → HTML Form
```

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
# 🚀 Quick Start Guide - React Form Builder

## 📥 Installation

```bash
# Clone the repository
git clone https://github.com/Amruth22/react-form-builder.git
cd react-form-builder

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

---

## 🎯 5-Minute Tutorial

### **Step 1: Import Your JSON** (30 seconds)

1. Drag and drop your JSON file onto the upload zone
2. Or click to browse and select your file
3. The app automatically loads your form

**Supported Formats**:
- ✅ New hierarchical format (Pages → Sections → Groups → Questions)
- ✅ Old flat format (automatically converted)

---

### **Step 2: Build Your Form** (2 minutes)

**Navigate**:
- Click page buttons to switch between pages
- Sections are displayed as collapsible panels
- Groups are nested within sections

**Edit**:
- Click the ✏️ edit icon on any question
- Click the ✏️ edit icon on group headers
- Click the ✏️ edit icon on section headers

**Organize**:
- Drag questions by the grip handle (⋮⋮)
- Drag groups between sections
- Drag sections between pages

**Add/Remove**:
- Click ➕ "Add Question" to add questions
- Click ➕ "Add Group" to add groups
- Click ➕ "Add Section" to add sections
- Click 🗑️ to delete items

---

### **Step 3: Preview Your Form** (1 minute)

1. Click "Preview" in the header
2. Fill out the form as an end-user would
3. Test repeatable groups (click ➕ Add)
4. Test conditional inputs (select options that require input)
5. Upload files (if your form has file fields)
6. Click "Export to JSON" to see the data

---

### **Step 4: Export HTML** (30 seconds)

1. Click "Export HTML" button
2. HTML file downloads automatically
3. Open the HTML file in any browser
4. Your form is ready to use!

---

## 🎨 Key Features

### **Repeatable Groups**

If a group has a purple "Repeatable" badge:
- Users can add multiple instances
- Each instance has its own set of questions
- Perfect for: beneficiaries, dependents, addresses, etc.

**Example**: Add multiple beneficiaries to a life insurance form

---

### **Conditional Inputs**

Some options require additional input:
- Select "Other (specify)" → text field appears
- Select "Level Term II for ___ years" → number field appears

**In Editor**: Toggle "Requires additional input" checkbox

---

### **Auto-Detection**

Dropdown fields can auto-populate:
- **US States**: All 50 states
- **Canadian Provinces**: All 13 provinces/territories

**In Editor**: Check "Auto-detect common fields" and select type

---

### **Validation Rules**

Add validation to any question:
- **Text**: Min/max length, pattern matching
- **Number**: Min/max value
- **Email**: Email format validation
- **Custom**: Regular expressions

**In Editor**: Expand "Validation Rules" section

---

### **File Uploads**

Add file upload fields:
- Set accepted file types (e.g., `.pdf,.doc,.jpg`)
- Set maximum file size (in MB)
- Images show preview in FormPreview

**In Editor**: Select "File Upload" as question type

---

## 📋 Common Tasks

### **How to Create a Multi-Page Form**

Your JSON should have multiple pages:
```json
{
  "pages": [
    {"title": "Page 1: Personal Info", "sections": [...]},
    {"title": "Page 2: Medical History", "sections": [...]},
    {"title": "Page 3: Payment", "sections": [...]}
  ]
}
```

---

### **How to Make a Repeatable Section**

Set `repeatable: true` on a group:
```json
{
  "title": "Beneficiary Information",
  "repeatable": true,
  "questions": [...]
}
```

---

### **How to Add Conditional Inputs**

Add `requires_input` to an option:
```json
{
  "value": "other",
  "label": "Other (please specify)",
  "requires_input": true,
  "input_type": "text"
}
```

---

### **How to Add Validation**

Add a `validation` object to a question:
```json
{
  "question": "Age",
  "answer_type": "number",
  "validation": {
    "min": 18,
    "max": 100,
    "errorMessage": "Age must be between 18 and 100"
  }
}
```

---

### **How to Auto-Populate States**

Add `auto_detected` to a dropdown:
```json
{
  "question": "State",
  "answer_type": "dropdown",
  "auto_detected": "province_state",
  "options": []
}
```

---

## 🎯 Best Practices

### **Organizing Your Form**

1. **Pages**: Use for major sections (e.g., Personal Info, Medical, Payment)
2. **Sections**: Use for logical groupings (e.g., Basic Info, Address, Contact)
3. **Groups**: Use for repeatable items (e.g., Beneficiaries, Dependents)
4. **Questions**: Individual form fields

### **Naming Conventions**

- **Pages**: "Page 1: Title" or just "Title"
- **Sections**: Descriptive titles (e.g., "Personal Information")
- **Groups**: Specific purpose (e.g., "Primary Beneficiary")
- **Questions**: Clear, concise (e.g., "Full Name" not "Please enter your full name")

### **Required Fields**

- Mark critical fields as `required: true`
- Add validation for important fields
- Use custom error messages for clarity

### **Repeatable Groups**

- Use for items that can have multiple instances
- Keep questions within repeatable groups focused
- Don't nest repeatable groups (not supported)

---

## 🐛 Troubleshooting

### **JSON File Not Loading**

✅ **Check**:
- File is valid JSON (use JSONLint.com)
- File has `pages` array
- File size is under 10MB

### **Preview Shows Empty Form**

✅ **Check**:
- JSON has `sections` array in pages
- Sections have `groups` array
- Groups have `questions` array

### **HTML Export is Empty**

✅ **Check**:
- Form has questions (not just display text)
- Browser allows downloads
- No popup blockers interfering

### **Drag & Drop Not Working**

✅ **Check**:
- Dragging by the grip handle (⋮⋮)
- Browser supports drag & drop
- Try refreshing the page

---

## 📚 JSON Format Reference

### **Minimal Valid JSON**

```json
{
  "document_info": {
    "source_pdf": "my_form"
  },
  "pages": [
    {
      "title": "Page 1",
      "sections": [
        {
          "title": "Section 1",
          "groups": [
            {
              "title": "Group 1",
              "repeatable": false,
              "questions": [
                {
                  "question": "Your Name",
                  "answer_type": "text",
                  "required": true
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

### **Complete Example**

See `IMPLEMENTATION_SUMMARY.md` for a comprehensive example with all features.

---

## 🎓 Learning Resources

### **Question Types**

| Type | Use For | Example |
|------|---------|---------|
| `text` | Short text | Name, Address |
| `textarea` | Long text | Comments, Description |
| `email` | Email addresses | user@example.com |
| `tel` | Phone numbers | (555) 123-4567 |
| `date` | Dates | Birth date, Start date |
| `number` | Numbers | Age, Quantity |
| `dropdown` | Select one | Country, State |
| `radio` | Choose one | Yes/No, Gender |
| `checkbox` | Choose multiple | Services, Interests |
| `file` | File upload | Documents, Images |
| `display_text` | Information | Instructions, Notes |

### **Validation Options**

| Rule | Applies To | Example |
|------|-----------|---------|
| `minLength` | text, textarea, email | Minimum 2 characters |
| `maxLength` | text, textarea, email | Maximum 100 characters |
| `min` | number, date | Minimum value 18 |
| `max` | number, date | Maximum value 100 |
| `pattern` | text, email, tel | Regex: `^[A-Z0-9]+$` |
| `errorMessage` | all | "Invalid format" |
| `accept` | file | `.pdf,.doc,.jpg` |
| `maxSize` | file | 10 (MB) |

---

## 💡 Tips & Tricks

### **Keyboard Shortcuts**

- **Ctrl/Cmd + S**: Save (browser default)
- **Esc**: Close modals
- **Tab**: Navigate between fields

### **Efficiency Tips**

1. **Duplicate Questions**: Copy JSON and modify
2. **Batch Edit**: Edit JSON directly for bulk changes
3. **Templates**: Save common structures as JSON templates
4. **Testing**: Use Preview mode frequently

### **Advanced Features**

1. **Custom Styling**: Modify `tailwind.config.js`
2. **Custom Validation**: Add regex patterns
3. **Custom Question Types**: Extend QuestionEditor
4. **Backend Integration**: Add API calls to export functions

---

## 🚀 Next Steps

1. ✅ Import your JSON file
2. ✅ Customize your form
3. ✅ Test in Preview mode
4. ✅ Export HTML
5. ✅ Deploy your form

**Need Help?**
- 📖 Read the full README.md
- 📋 Check IMPLEMENTATION_SUMMARY.md
- 🐛 Report issues on GitHub
- ⭐ Star the repo if you find it useful!

---

**Happy Form Building!** 🎉

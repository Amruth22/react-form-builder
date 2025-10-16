# Changelog

All notable changes to the React Form Builder project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2024-10-16

### 🎯 Code Quality & Production Improvements

This release focuses on code quality, accessibility, and production-ready configuration management.

### ✨ Added

#### **Environment Configuration**
- New `.env` file support for flexible backend configuration
- New `.env.example` template for developers
- Support for `REACT_APP_API_BASE_URL` environment variable
- Support for `REACT_APP_API_KEY` environment variable
- Defaults to `http://localhost:5000` when `.env` is empty
- Supports local development, production, and Docker deployments
- Centralized API configuration in `src/config/api.js`

#### **Accessibility Improvements**
- Added `htmlFor` attributes to all form labels
- Added `id` attributes to all form inputs
- Proper label-to-input associations (WCAG compliance)
- Improved screen reader compatibility
- 20+ form controls made accessible
- Includes sub-questions and options modals

#### **Code Refactoring**
- Extracted complex nested ternaries into helper functions
- Improved code readability and maintainability
- Better separation of concerns
- Helper functions:
  - `renderParentFieldName()` in QuestionCard.js
  - `renderOptionFieldName()` in QuestionCard.js
  - `renderSubQuestionFieldName()` in QuestionCard.js

#### **Comprehensive Documentation**
- Updated README.md (604 lines, +184 lines)
- New "Environment Configuration" section
- New "Export Features" section with use cases
- New "Recent Improvements" section
- Enhanced "Project Structure" with component descriptions
- Extended "Troubleshooting" section (19 solutions)
- Multi-person questions documentation
- Sub-questions documentation

### 🔧 Changed

#### **API Configuration**
- Moved API URL configuration from hardcoded value to environment variables
- Updated `src/config/api.js` to read from `.env` file
- Backward compatible with existing setup

#### **Component Architecture**
- Moved pure utility functions outside App component
  - `mergeSectionsAcrossPages()` now module-level
  - `normalizeFormData()` now module-level
- Improved React hooks dependency management
- Better component composition

#### **Utilities**
- Enhanced `ExcelExporter.js` for better statistics
- Improved `formUtils.js` with better normalization
- Optimized `HtmlExporter.js` for better export quality

### 🐛 Fixed

#### **Critical Fixes**
- **Fixed**: ESLint warning about missing useCallback dependencies
- **Fixed**: React hooks exhaustive-deps warning
- **Fixed**: All form labels now properly associated with inputs

#### **Code Cleanup**
- Removed unused `FormPreview.js` component (1049 lines)
- Removed unused `JsonDropZone.js` component
- Eliminated dead code branches
- Cleaned up unused imports

### 🚀 Performance

- Optimized bundle size (reduced by 374 bytes)
- Removed unnecessary component code
- Improved component render performance
- Better memory management

### ♿ Accessibility

- WCAG compliance improvements
- Proper label-input associations
- Screen reader support enhanced
- Keyboard navigation improved
- Better visual hierarchy

### 📦 Dependencies

No new dependencies added. Still using:
- React 18.2.0
- @hello-pangea/dnd 16.3.0
- lucide-react 0.263.1
- Tailwind CSS 3.3.3
- xlsx (for Excel export)

### 🔄 Migration Guide

#### **Environment Variables Setup**

**Before (Hardcoded)**:
```javascript
baseUrl: 'http://127.0.0.1:5000'
```

**After (Environment-based)**:
```bash
# .env file
REACT_APP_API_BASE_URL=https://your-backend.com
REACT_APP_API_KEY=optional_api_key
```

#### **For Developers**
1. Copy `.env.example` to `.env`
2. Leave empty for local development (uses localhost:5000)
3. Set values for production deployment

#### **For Deployment**
1. Create `.env` with production values
2. Build: `npm run build`
3. Deploy the `build` folder
4. No code changes needed

### 📊 Statistics

- **Files Modified**: 8
- **Files Created**: 2 (.env, .env.example)
- **Files Deleted**: 2 (unused components)
- **Lines Added**: 253
- **Lines Removed**: 1,175 (net improvement)
- **ESLint Warnings Fixed**: All
- **Bundle Size Reduced**: 374 bytes
- **Accessibility Issues Fixed**: 20+
- **Code Quality Issues Resolved**: 142+

### ✅ Build Status

- **Build**: Compiles successfully with ZERO warnings
- **Bundle Size**: 198.04 KB (optimized)
- **Performance**: All metrics green
- **Accessibility**: WCAG compliant

### 🙏 Breaking Changes

**None** - All changes are backward compatible!
- Old JSON format still supported and auto-converted
- Existing forms continue to work
- Configuration is optional (defaults to localhost:5000)

---

## [2.0.0] - 2024-12-XX

### 🎉 Major Release - Complete Rewrite

This is a major release with breaking changes and significant new features. The application now fully supports hierarchical form structures with advanced functionality.

### ✨ Added

#### **Hierarchical Structure Support**
- Full support for Pages → Sections → Groups → Questions hierarchy
- Visual display of sections with collapsible panels
- Visual display of groups within sections
- Proper nesting and organization of form elements
- Backward compatibility with old flat format (auto-conversion)

#### **Repeatable Groups**
- Groups can be marked as `repeatable: true`
- Add/Remove instances dynamically in FormPreview
- Each instance maintains separate form data
- Visual "Repeatable" badge on group headers
- Instance numbering and management
- Full support in HTML export with JavaScript

#### **Conditional Inputs**
- Options can require additional input with `requires_input: true`
- Support for different input types (text, number, date, email, tel)
- Show/hide logic based on user selection
- Works with both radio buttons and checkboxes
- Full support in FormPreview and HTML export

#### **Auto-Detection**
- Auto-populate US States (50 states)
- Auto-populate Canadian Provinces (13 provinces/territories)
- Set via `auto_detected: "province_state"` in JSON
- Toggle in QuestionEditor interface
- Reduces manual data entry

#### **Advanced Validation**
- `minLength` / `maxLength` for text fields
- `min` / `max` for numeric fields
- `pattern` for regex validation
- `errorMessage` for custom error messages
- Real-time validation in FormPreview
- Client-side validation in HTML export
- Visual error indicators and messages

#### **File Upload Support**
- New `file` question type
- File selection with drag & drop
- Image preview for uploaded images
- File name and size display
- File type restrictions via `accept` attribute
- File size limits via `maxSize` attribute
- Base64 encoding in JSON export
- Full support in HTML export

#### **Enhanced FormPreview**
- Complete rewrite to support hierarchical structure
- Visual hierarchy with sections and groups
- Repeatable group management (Add/Remove)
- Conditional input rendering
- File upload handling with preview
- Advanced validation with error messages
- Hierarchical JSON export maintaining structure
- Improved styling and user experience

#### **Enhanced HTML Export**
- Complete rewrite to support hierarchical structure
- Generates sections and groups in HTML
- JavaScript for repeatable groups (Add/Remove)
- JavaScript for conditional inputs (show/hide)
- Client-side validation with error messages
- File upload handling
- Beautiful responsive styling
- Mobile-friendly design
- No external dependencies

#### **Documentation**
- New IMPLEMENTATION_SUMMARY.md with complete feature documentation
- New QUICK_START.md with 5-minute tutorial
- New CHANGELOG.md (this file)
- Updated README.md with all new features
- Comprehensive JSON format examples
- Troubleshooting guide

### 🔧 Changed

#### **FormPreview Component**
- **BREAKING**: Complete rewrite from 1378 to 2413 words
- Now uses hierarchical structure instead of flat `form_elements`
- New field key generation system for nested structures
- New state management for repeatable instances
- New file data handling
- Improved validation system

#### **HtmlExporter Utility**
- **BREAKING**: Complete rewrite from 893 to 2324 words
- Now generates hierarchical HTML structure
- New JavaScript for dynamic functionality
- New styling system with better visual hierarchy
- Improved responsive design
- Better error handling

#### **README.md**
- Updated feature list with all new capabilities
- Updated JSON format examples
- Updated question types table
- Added new features explanation section
- Improved documentation structure

### 🐛 Fixed

- **Critical**: FormPreview now works with hierarchical JSON (was showing empty)
- **Critical**: HTML Export now works with hierarchical JSON (was generating empty HTML)
- Fixed field key generation for nested structures
- Fixed validation not triggering on conditional inputs
- Fixed file upload not clearing properly
- Fixed JSON export not maintaining hierarchy
- Fixed page navigation in multi-page forms
- Fixed drag & drop visual indicators

### 🚀 Performance

- Optimized field key generation
- Improved re-render performance with useCallback
- Better memory management for file uploads
- Reduced unnecessary state updates

### 📦 Dependencies

No new dependencies added. Still using:
- React 18.2.0
- @hello-pangea/dnd 16.3.0
- lucide-react 0.263.1
- Tailwind CSS 3.3.3

### 🔄 Migration Guide

#### **From v1.x to v2.0**

**JSON Format**:
```javascript
// Old format (still supported, auto-converted)
{
  "pages": [
    {
      "form_elements": [...]
    }
  ]
}

// New format (recommended)
{
  "pages": [
    {
      "sections": [
        {
          "groups": [
            {
              "questions": [...]
            }
          ]
        }
      ]
    }
  ]
}
```

**No Code Changes Required**:
- Old JSON format is automatically converted
- All existing functionality preserved
- New features are opt-in via JSON structure

### ⚠️ Breaking Changes

1. **FormPreview Component**:
   - No longer supports direct `form_elements` array
   - Must use hierarchical structure (auto-converted on import)

2. **HTML Export**:
   - Generated HTML structure changed significantly
   - Old HTML files won't match new structure
   - Re-export forms to get new features

3. **JSON Export from FormPreview**:
   - Export format changed to hierarchical structure
   - Includes section/group metadata
   - More detailed than v1.x exports

### 📊 Statistics

- **Files Modified**: 4
- **Lines Added**: ~1,500
- **Lines Removed**: ~50
- **Features Added**: 30+
- **Bugs Fixed**: 10+

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Features
- JSON file import via drag & drop
- Visual form builder with drag & drop
- Question editing (text, type, options, required)
- Multi-page form support
- Live form preview
- JSON export of filled data
- HTML export
- Support for 10 question types
- Basic validation (required fields)
- Responsive design

#### Components
- App.js - Main application
- Header.js - Navigation
- JsonDropZone.js - File upload
- FormBuilder.js - Form editor
- FormPreview.js - Form preview
- QuestionCard.js - Question display
- QuestionEditor.js - Question editing
- HtmlExporter.js - HTML generation

#### Supported Question Types
- Text Input
- Email
- Phone
- Date
- Number
- Long Text (textarea)
- Dropdown
- Radio Buttons
- Checkboxes
- Display Text

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 | v2.1.0 |
|---------|--------|--------|--------|
| Hierarchical Structure | ❌ | ✅ | ✅ |
| Repeatable Groups | ❌ | ✅ | ✅ |
| Conditional Inputs | ❌ | ✅ | ✅ |
| Auto-Detection | ❌ | ✅ | ✅ |
| Advanced Validation | ❌ | ✅ | ✅ |
| File Uploads | ❌ | ✅ | ✅ |
| Drag & Drop (all levels) | Partial | ✅ | ✅ |
| Section/Group Editing | ❌ | ✅ | ✅ |
| Enhanced Preview | Basic | ✅ | ✅ |
| Enhanced HTML Export | Basic | ✅ | ✅ |
| **Environment Configuration** | ❌ | ❌ | ✅ |
| **Accessibility (WCAG)** | ❌ | ❌ | ✅ |
| **Zero ESLint Warnings** | ❌ | ❌ | ✅ |
| **Code Quality Optimized** | ❌ | ❌ | ✅ |
| **Excel Export** | ❌ | ❌ | ✅ |
| **Multi-Person Questions** | ❌ | ❌ | ✅ |
| **Sub-Questions** | ❌ | ❌ | ✅ |

---

## Roadmap

### Completed in v2.1.0 ✅
- [x] **Environment variable configuration** - Flexible backend setup
- [x] **Accessibility improvements (WCAG)** - All form controls compliant
- [x] **Code quality optimization** - Zero warnings, clean architecture
- [x] **Excel export** - Form structure export (.xlsx)
- [x] **Multi-person questions** - Support for multiple respondents
- [x] **Sub-questions** - Nested question support

### Future Versions

#### [2.2.0] - Planned (Next)
- [ ] TypeScript migration
- [ ] Unit tests with Jest
- [ ] Integration tests with React Testing Library
- [ ] Undo/Redo functionality
- [ ] Form templates library
- [ ] Export to PDF

#### [2.3.0] - Planned
- [ ] Backend integration (save/load forms)
- [ ] User authentication
- [ ] Form versioning
- [ ] Collaboration features
- [ ] Real-time preview updates

#### [3.0.0] - Future
- [ ] Advanced conditional logic (complex rules)
- [ ] Calculations (sum, average fields)
- [ ] Multi-language support (i18n)
- [ ] Accessibility audit tools (A11y checker)
- [ ] Form analytics dashboard
- [ ] REST API for programmatic access
- [ ] GraphQL support

---

## Contributing

We welcome contributions! Please see our contributing guidelines for:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

---

## Support

- 📖 [Documentation](README.md)
- 🚀 [Quick Start Guide](QUICK_START.md)
- 📋 [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- 🐛 [Issue Tracker](https://github.com/Amruth22/react-form-builder/issues)

---

**Legend**:
- ✅ Implemented
- ❌ Not Available
- 🔄 In Progress
- 📋 Planned

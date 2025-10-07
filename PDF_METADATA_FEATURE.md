# PDF Metadata Tags Feature

## 🎯 Overview

The PDF Metadata Tags feature provides **visual traceability** from form questions back to their original PDF source. This helps with debugging, validation, and understanding where each field came from.

---

## ✨ What's New

### 1. **Visual Badges in Question Cards**

Each question now displays metadata badges showing:
- 📄 **PDF Field Name** - The original field identifier
- 📍 **Page Number** - Which PDF page it came from
- ✓ **Auto-Detected Type** - If smart detection was applied

**Example:**
```
┌─────────────────────────────────────────┐
│ Full Name *                             │
│ [Text Input]                            │
│                                         │
│ [📄 PDF: applicant_name] [📍 Page 1]   │ ← Metadata badges
│ [✓ Auto-detected: text]                 │
└─────────────────────────────────────────┘
```

### 2. **Detailed Metadata in Editor**

When editing a question, a comprehensive metadata section appears at the top:

```
┌─────────────────────────────────────────┐
│ ℹ️ PDF Source Information               │
├─────────────────────────────────────────┤
│ PDF Field Name: applicant_full_name     │
│ Source Page: Page 1                     │
│ Original Type: checkbox                 │
│ Auto-Detected: ✓ radio                  │
│ Position: X: 100, Y: 200                │
│                                         │
│ 💡 This information is extracted from   │
│    the PDF and cannot be edited.        │
└─────────────────────────────────────────┘
```

### 3. **Auto-Generated Field Names**

If the PDF doesn't provide field names, they're automatically generated:
- Converts question text to snake_case
- Removes special characters
- Limits to 50 characters
- Fallback: `field_[page]_[index]`

**Examples:**
- "Full Name:" → `full_name`
- "Date of Birth?" → `date_of_birth`
- "SSN (###-##-####)" → `ssn`

---

## 🏗️ Technical Implementation

### Metadata Structure

```json
{
  "question": "Full Name",
  "answer_type": "text",
  "required": true,
  "pdf_metadata": {
    "field_name": "applicant_full_name",
    "page": 1,
    "original_type": "text",
    "detected_type": "text",
    "detection_applied": false,
    "extracted_at": "2024-01-15T10:30:00Z",
    "coordinates": {
      "x": 100,
      "y": 200
    }
  }
}
```

### Processing Flow

```
PDF Upload
    ↓
AI Extraction
    ↓
enrichWithPdfMetadata() ← Adds metadata
    ↓
applySmartFieldDetection() ← Detects types
    ↓
Form Builder (displays metadata)
```

### New Functions

#### `enrichWithPdfMetadata(formData, pdfExtractionData)`
**Purpose:** Add PDF metadata to all questions

**What it does:**
- Adds page numbers
- Generates field names
- Adds extraction timestamp
- Preserves coordinates if available

**Usage:**
```javascript
import { enrichWithPdfMetadata } from './utils/pdfFieldDetection';

const enrichedData = enrichWithPdfMetadata(jsonData, pdfApiResult);
```

---

## 🎨 UI Components

### QuestionCard Changes

**Added:**
- PDF metadata badges section
- Conditional rendering (only shows if metadata exists)
- Color-coded badges:
  - Indigo: PDF field info
  - Green: Auto-detection info

**Code:**
```jsx
{question.pdf_metadata && (
  <div className="mt-2 flex flex-wrap gap-2">
    {question.pdf_metadata.field_name && (
      <span className="badge-indigo">
        <FileType /> PDF: {question.pdf_metadata.field_name}
      </span>
    )}
    {question.pdf_metadata.page && (
      <span className="badge-indigo">
        <MapPin /> Page {question.pdf_metadata.page}
      </span>
    )}
    {question.pdf_metadata.detected_type && (
      <span className="badge-green">
        ✓ Auto-detected: {question.pdf_metadata.detected_type}
      </span>
    )}
  </div>
)}
```

### QuestionEditor Changes

**Added:**
- Full metadata section at top
- Grid layout for organized display
- Read-only information
- Info icon and helpful text

**Features:**
- Shows all available metadata
- Conditional rendering for each field
- Professional card-based layout
- Clear visual hierarchy

---

## 🔍 Use Cases

### 1. **Debugging PDF Extraction**
```
Problem: Field not extracting correctly
Solution: Check PDF metadata to see:
  - Original field name
  - Page location
  - Coordinates
  - What type was detected
```

### 2. **Form Validation**
```
Problem: Need to verify all fields from PDF page 3
Solution: Filter questions by page number in metadata
```

### 3. **Re-populating PDFs**
```
Problem: Need to fill PDF with form data
Solution: Use field_name to map back to PDF fields
```

### 4. **Understanding Auto-Detection**
```
Problem: Why is this a radio button?
Solution: Check metadata to see:
  - Original type: checkbox
  - Detected type: radio
  - Detection applied: true
```

---

## 📊 Metadata Fields Reference

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `field_name` | string | PDF field identifier | `"applicant_name"` |
| `page` | number | Source page number | `1` |
| `original_type` | string | Type before detection | `"checkbox"` |
| `detected_type` | string | Type after detection | `"radio"` |
| `detection_applied` | boolean | Was detection used? | `true` |
| `extracted_at` | string | ISO timestamp | `"2024-01-15T10:30:00Z"` |
| `coordinates` | object | PDF position | `{x: 100, y: 200}` |
| `symbol` | string | Checkbox symbol | `"○"` |

---

## 🎯 Benefits

### For Developers:
- ✅ Easy debugging of PDF extraction
- ✅ Traceability to source
- ✅ Understanding of auto-detection
- ✅ Field mapping for PDF re-population

### For Users:
- ✅ Visual confirmation of PDF source
- ✅ Transparency in auto-detection
- ✅ Confidence in form accuracy
- ✅ Easy identification of fields

### For QA/Testing:
- ✅ Verify extraction accuracy
- ✅ Check page mapping
- ✅ Validate field names
- ✅ Test detection logic

---

## 🔄 Backward Compatibility

### Existing Forms:
- ✅ Forms without metadata still work
- ✅ Metadata section only shows if present
- ✅ No breaking changes
- ✅ Graceful degradation

### JSON Import:
- ✅ Old JSON format supported
- ✅ Metadata optional
- ✅ Auto-generated if missing
- ✅ No errors if absent

---

## 🧪 Testing

### Visual Testing:
```
1. Upload PDF with form fields
2. Check QuestionCard for badges
3. Click edit on question
4. Verify metadata section appears
5. Check all fields display correctly
```

### Functional Testing:
```
1. Verify field names generated correctly
2. Check page numbers accurate
3. Confirm detection info shown
4. Test with/without coordinates
5. Verify read-only (cannot edit)
```

### Edge Cases:
```
1. Question without metadata → No badges shown
2. Missing field_name → Auto-generated
3. Missing page → Uses page index
4. No coordinates → Section hidden
5. Old JSON format → Works normally
```

---

## 💡 Future Enhancements

### Potential Additions:
1. **Editable Metadata** - Allow manual field name editing
2. **Metadata Export** - Include in HTML export
3. **Field Mapping Tool** - Visual PDF-to-form mapper
4. **Confidence Scores** - Show extraction confidence
5. **Metadata Search** - Filter by field name/page
6. **Bulk Operations** - Edit metadata for multiple fields
7. **PDF Preview** - Show original PDF location
8. **Metadata Validation** - Check for duplicates/conflicts

---

## 📝 Code Examples

### Accessing Metadata in Code:

```javascript
// Check if question has metadata
if (question.pdf_metadata) {
  console.log('Field name:', question.pdf_metadata.field_name);
  console.log('Page:', question.pdf_metadata.page);
  console.log('Detected:', question.pdf_metadata.detected_type);
}

// Filter questions by page
const page1Questions = questions.filter(q => 
  q.pdf_metadata?.page === 1
);

// Find question by field name
const question = questions.find(q => 
  q.pdf_metadata?.field_name === 'applicant_name'
);

// Check if detection was applied
const autoDetected = questions.filter(q => 
  q.pdf_metadata?.detection_applied === true
);
```

### Adding Custom Metadata:

```javascript
// Add custom metadata during processing
question.pdf_metadata = {
  ...question.pdf_metadata,
  custom_field: 'custom_value',
  validation_status: 'verified',
  last_modified: new Date().toISOString()
};
```

---

## 🎨 Styling Reference

### Badge Colors:
- **Indigo** (`bg-indigo-50 text-indigo-700 border-indigo-200`)
  - PDF field name
  - Page number
  
- **Green** (`bg-green-50 text-green-700 border-green-200`)
  - Auto-detected type
  - Success indicators

### Icons Used:
- `FileType` - PDF field name
- `MapPin` - Page location
- `Info` - Information section
- `✓` - Checkmark for detection

---

## 🔗 Related Files

- `src/components/QuestionCard.js` - Badge display
- `src/components/QuestionEditor.js` - Detailed view
- `src/utils/pdfFieldDetection.js` - Enrichment logic
- `src/components/PdfUploadZone.js` - Integration
- `NOTE.md` - Complete documentation

---

## ✅ Completion Checklist

- [x] Visual badges in QuestionCard
- [x] Detailed section in QuestionEditor
- [x] Auto-generation of field names
- [x] Page number tracking
- [x] Detection info display
- [x] Coordinates support
- [x] Read-only display
- [x] Backward compatibility
- [x] Documentation
- [x] Testing checklist

---

**Status:** ✅ Complete and Ready for Use

**Branch:** `feature/section-creation-smart-pdf-detection`

**Next Steps:** Test with real PDFs and verify all metadata displays correctly

# 🔌 API Integration Guide

## 🎯 Overview

The React Form Builder now integrates directly with the Flask PDF Extractor API! Upload PDFs and automatically get form fields extracted and loaded into the builder.

---

## 🚀 Quick Start

### **Step 1: Start the Flask API**

```bash
# In your pdf-form-extractor directory
cd pdf-form-extractor
python flask_api.py
```

Wait for:
```
✨ Ready to accept requests!
```

### **Step 2: Start the React App**

```bash
# In your react-form-builder directory
cd react-form-builder
npm start
```

### **Step 3: Upload PDF**

1. Open `http://localhost:3000`
2. Click "Upload PDF" button
3. Drag & drop your PDF file
4. Wait 2-5 minutes for processing
5. Form builder loads automatically!

---

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file in the React app root:

```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env
```

**Configuration:**
```bash
# Flask API URL
REACT_APP_API_URL=http://localhost:5000

# API Key (if required)
REACT_APP_API_KEY=your-api-key-here
```

### **API Configuration File**

Edit `src/config/api.js` if needed:

```javascript
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 300000, // 5 minutes
  apiKey: process.env.REACT_APP_API_KEY || null,
};
```

---

## 📊 How It Works

### **Complete Workflow**

```
1. User uploads PDF
   ↓
2. React sends PDF to Flask API (/api/upload)
   ↓
3. Flask processes PDF with Claude Vision
   ↓
4. Flask returns JSON with extracted fields
   ↓
5. React downloads JSON from Flask
   ↓
6. React loads JSON into Form Builder
   ↓
7. User edits and exports HTML
```

### **API Communication**

```javascript
// 1. Upload PDF
POST http://localhost:5000/api/upload
Content-Type: multipart/form-data
Body: { file: <PDF file> }

// 2. Response
{
  "success": true,
  "data": {
    "output_files": {
      "json": {
        "filename": "document_enhanced.json",
        "download_url": "/api/files/document_enhanced.json"
      }
    },
    "extraction_info": {
      "total_form_elements": 127
    }
  }
}

// 3. Download JSON
GET http://localhost:5000/api/files/document_enhanced.json

// 4. JSON loaded into Form Builder
```

---

## 🎨 User Interface

### **Upload Mode Selector**

Users can choose between two upload modes:

```
┌─────────────────────────────────────┐
│  [Upload PDF]  [Upload JSON]        │
└─────────────────────────────────────┘
```

**Upload PDF:**
- Direct PDF upload
- AI extraction
- Automatic form building

**Upload JSON:**
- Manual JSON upload
- For pre-processed files
- Faster (no API call)

### **Processing States**

#### **1. Upload State**
```
┌─────────────────────────────────────┐
│     📄 Upload PDF Form              │
│                                     │
│  Drag and drop your PDF file here  │
│  or click to browse                 │
│                                     │
│     [Select PDF File]               │
└─────────────────────────────────────┘
```

#### **2. Processing State**
```
┌─────────────────────────────────────┐
│     ⏳ Processing PDF...            │
│                                     │
│  Processing PDF with AI...          │
│                                     │
│  ████████████░░░░░░░░ 70%          │
│                                     │
│  This may take 2-5 minutes          │
└─────────────────────────────────────┘
```

#### **3. Success State**
```
┌─────────────────────────────────────┐
│     ✅ PDF Processed Successfully!  │
│                                     │
│  File: insurance_form.pdf           │
│  Pages: 5                           │
│  Form Elements: 127                 │
│  Sections: 12                       │
│                                     │
│  ⏳ Loading form builder...         │
└─────────────────────────────────────┘
```

#### **4. Error State**
```
┌─────────────────────────────────────┐
│     ❌ Processing Failed            │
│                                     │
│  Error: Connection refused          │
│                                     │
│     [Try Again]                     │
└─────────────────────────────────────┘
```

---

## 🔒 Security

### **CORS Configuration**

The Flask API must allow requests from React app:

**In Flask API (.env):**
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**For Production:**
```bash
CORS_ORIGINS=https://yourdomain.com
```

### **API Key Authentication**

**Enable in Flask API:**
```bash
REQUIRE_API_KEY=True
API_KEY=your-secret-key
```

**Configure in React:**
```bash
REACT_APP_API_KEY=your-secret-key
```

The React app will automatically include the API key in requests.

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. "Connection refused" Error**

**Problem:** Flask API is not running

**Solution:**
```bash
# Start Flask API
cd pdf-form-extractor
python flask_api.py
```

#### **2. "CORS Error"**

**Problem:** CORS not configured

**Solution:**
```bash
# In Flask API .env file
CORS_ORIGINS=http://localhost:3000
```

#### **3. "API Key Required"**

**Problem:** API key authentication enabled but not provided

**Solution:**
```bash
# In React .env file
REACT_APP_API_KEY=your-api-key
```

#### **4. "Timeout Error"**

**Problem:** PDF processing takes too long

**Solution:**
- This is normal for large PDFs
- Wait up to 5 minutes
- Check Flask API console for progress

#### **5. "Invalid PDF"**

**Problem:** File is not a valid PDF

**Solution:**
- Ensure file is actually a PDF
- Check file is not corrupted
- Try a different PDF

---

## 📊 Testing

### **Test with Sample PDF**

```bash
# 1. Start Flask API
cd pdf-form-extractor
python flask_api.py

# 2. Start React app (new terminal)
cd react-form-builder
npm start

# 3. Open browser
http://localhost:3000

# 4. Upload test PDF
# Use: C:\Users\Aamruth Venkatesh\Music\03_lifeinsuranceapplication-fillable.pdf
```

### **Expected Results**

For the life insurance PDF:
- **Processing Time:** 2-5 minutes
- **Pages:** 5
- **Form Elements:** ~127
- **Sections:** ~12
- **Groups:** ~28

---

## 🚀 Deployment

### **Development Setup**

```bash
# Terminal 1: Flask API
cd pdf-form-extractor
python flask_api.py

# Terminal 2: React App
cd react-form-builder
npm start
```

### **Production Setup**

#### **Option 1: Same Server**

```bash
# Build React app
cd react-form-builder
npm run build

# Serve with Flask
# Add to Flask API:
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(f'build/{path}'):
        return send_from_directory('build', path)
    return send_from_directory('build', 'index.html')
```

#### **Option 2: Separate Servers**

**Flask API:**
```bash
# Deploy to: https://api.yourdomain.com
gunicorn -w 4 -b 0.0.0.0:5000 flask_api:app
```

**React App:**
```bash
# Build
npm run build

# Deploy to: https://app.yourdomain.com
# Update .env:
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 🔄 Complete Integration Example

### **Full Workflow Test**

```javascript
// 1. User uploads PDF
const file = document.getElementById('pdfInput').files[0];

// 2. React sends to Flask API
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
});

// 3. Get response
const result = await response.json();
// {
//   "success": true,
//   "data": {
//     "output_files": {
//       "json": {
//         "filename": "document_enhanced.json"
//       }
//     }
//   }
// }

// 4. Download JSON
const jsonUrl = `http://localhost:5000/api/files/${result.data.output_files.json.filename}`;
const jsonResponse = await fetch(jsonUrl);
const jsonData = await jsonResponse.json();

// 5. Load into Form Builder
setFormData(jsonData);
setCurrentView('builder');
```

---

## 📈 Performance

### **Processing Times**

| PDF Size | Pages | Processing Time |
|----------|-------|-----------------|
| Small | 1-2 | 30-60 seconds |
| Medium | 3-5 | 2-3 minutes |
| Large | 6-10 | 3-5 minutes |

### **Optimization Tips**

1. **Use Caching** - Flask API caches processed files
2. **Process Once** - Save JSON for reuse
3. **Concurrent Processing** - API processes 5 pages at once
4. **Show Progress** - Keep users informed

---

## 🎯 Features

### **What Works**

✅ **PDF Upload** - Drag & drop or click to upload  
✅ **AI Extraction** - Claude Vision processes PDF  
✅ **Automatic Loading** - JSON loads into builder  
✅ **Progress Tracking** - Real-time status updates  
✅ **Error Handling** - Clear error messages  
✅ **Fallback Mode** - Can still upload JSON manually  
✅ **CORS Support** - Cross-origin requests work  
✅ **API Key Auth** - Optional security  

### **What's Extracted**

From your PDF:
- ✅ All form fields
- ✅ Field types (text, dropdown, radio, etc.)
- ✅ Hierarchical structure (pages → sections → groups)
- ✅ Repeatable groups
- ✅ Validation rules
- ✅ Required fields
- ✅ Options and choices

---

## 💡 Tips

### **Best Practices**

1. **Start Flask API First** - Always start API before React
2. **Check API Health** - Visit `http://localhost:5000/api/health`
3. **Use Environment Variables** - Don't hardcode URLs
4. **Test with Small PDFs** - Start with 1-2 page PDFs
5. **Monitor Console** - Check both Flask and React consoles
6. **Save JSON Files** - Keep extracted JSON for reuse

### **Development Workflow**

```bash
# 1. Start Flask API
cd pdf-form-extractor
python flask_api.py

# 2. Test API
curl http://localhost:5000/api/health

# 3. Start React
cd react-form-builder
npm start

# 4. Test upload
# Upload a small PDF first

# 5. Check logs
# Monitor both consoles for errors
```

---

## 📞 Support

### **If Something Goes Wrong**

1. **Check Flask API is running**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check CORS settings**
   ```bash
   # In Flask .env
   CORS_ORIGINS=http://localhost:3000
   ```

3. **Check API key**
   ```bash
   # If using authentication
   REACT_APP_API_KEY=your-key
   ```

4. **Check console logs**
   - Flask console for API errors
   - Browser console for React errors

5. **Try JSON upload**
   - Switch to "Upload JSON" mode
   - Test with pre-extracted JSON

---

## 🎉 Success!

When everything works:

1. ✅ Flask API running on port 5000
2. ✅ React app running on port 3000
3. ✅ Upload PDF → Processing → Form Builder
4. ✅ Edit form → Export HTML
5. ✅ Complete workflow in one interface!

---

<div align="center">

**🔌 API Integration Complete!**

*Upload PDF → AI Extraction → Form Builder*

**Seamless • Automatic • Powerful**

</div>

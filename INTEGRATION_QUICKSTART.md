# ⚡ Integration Quick Start

## 🎯 Get Started in 5 Minutes

Complete setup to upload PDFs and automatically build forms!

---

## 📋 Prerequisites

- ✅ Node.js 16+ installed
- ✅ Python 3.8+ installed
- ✅ Both repositories cloned

---

## 🚀 Step-by-Step Setup

### **Step 1: Setup Flask API** (2 minutes)

```bash
# Navigate to PDF extractor
cd pdf-form-extractor

# Checkout API branch
git checkout feature/flask-api

# Install dependencies (if not done)
pip install -r requirements.txt
pip install -r requirements_api.txt

# Create .env file
echo "ANTHROPIC_API_KEY=your-key-here" > .env

# Start API
python flask_api.py
```

**Expected output:**
```
✨ Ready to accept requests!
```

### **Step 2: Setup React App** (2 minutes)

```bash
# Open new terminal
cd react-form-builder

# Checkout integration branch
git checkout feature/api-integration

# Install dependencies (if not done)
npm install

# Create .env file
cp .env.example .env

# Start React app
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view react-form-builder in the browser.
  Local: http://localhost:3000
```

### **Step 3: Test It!** (1 minute)

1. Open browser: `http://localhost:3000`
2. Click "Upload PDF" button (should be selected by default)
3. Drag & drop your PDF file
4. Wait 2-5 minutes
5. Form builder loads automatically! 🎉

---

## 🎯 Quick Test

### **Using Your Life Insurance PDF**

```bash
# Your PDF location:
C:\Users\Aamruth Venkatesh\Music\03_lifeinsuranceapplication-fillable.pdf
```

**Steps:**
1. Open `http://localhost:3000`
2. Drag the PDF file onto the upload zone
3. Watch the progress:
   - "Uploading PDF..."
   - "Processing PDF with AI..."
   - "Downloading extracted data..."
   - "Complete! Loading form builder..."
4. Form builder opens with 5 pages, ~127 form elements!

---

## 🔧 Configuration

### **Minimal Setup**

**Flask API (.env):**
```bash
ANTHROPIC_API_KEY=your-key-here
```

**React App (.env):**
```bash
REACT_APP_API_URL=http://localhost:5000
```

That's it! No other configuration needed.

---

## 📊 What You'll See

### **1. Upload Screen**

```
┌─────────────────────────────────────────┐
│  React Form Builder                     │
│  Upload PDF or JSON to build forms      │
│                                         │
│  [Upload PDF]  [Upload JSON]            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     📄 Upload PDF Form            │  │
│  │                                   │  │
│  │  Drag and drop your PDF file      │  │
│  │  or click to browse               │  │
│  │                                   │  │
│  │     [Select PDF File]             │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### **2. Processing Screen**

```
┌─────────────────────────────────────────┐
│  ⏳ Processing PDF...                   │
│                                         │
│  Processing PDF with AI...              │
│                                         │
│  ████████████░░░░░░░░ 70%              │
│                                         │
│  This may take 2-5 minutes              │
└─────────────────────────────────────────┘
```

### **3. Success Screen**

```
┌─────────────────────────────────────────┐
│  ✅ PDF Processed Successfully!         │
│                                         │
│  File: insurance_form.pdf               │
│  Pages: 5                               │
│  Form Elements: 127                     │
│  Sections: 12                           │
│                                         │
│  ⏳ Loading form builder...             │
└─────────────────────────────────────────┘
```

### **4. Form Builder**

```
┌─────────────────────────────────────────┐
│  [Builder] [Preview] [Export HTML]      │
├─────────────────────────────────────────┤
│                                         │
│  📄 Page 1: Personal Information        │
│  📋 Section: Basic Details              │
│  📁 Group: Applicant Information        │
│     ❓ Full Name                        │
│     ❓ Date of Birth                    │
│     ❓ Social Security Number           │
│                                         │
│  [Edit] [Delete] [Add Question]         │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### **Problem: "Connection refused"**

**Solution:**
```bash
# Make sure Flask API is running
curl http://localhost:5000/api/health

# If not running, start it:
cd pdf-form-extractor
python flask_api.py
```

### **Problem: "CORS error"**

**Solution:**
```bash
# In Flask API .env file, add:
CORS_ORIGINS=http://localhost:3000

# Restart Flask API
```

### **Problem: "API key required"**

**Solution:**
```bash
# In Flask API .env file:
ANTHROPIC_API_KEY=your-key-here

# Restart Flask API
```

### **Problem: React app won't start**

**Solution:**
```bash
# Install dependencies
npm install

# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📁 Directory Structure

```
your-workspace/
├── pdf-form-extractor/          # Flask API
│   ├── flask_api.py
│   ├── .env                     # API keys
│   └── processed_files/         # Extracted JSON files
│
└── react-form-builder/          # React App
    ├── src/
    │   ├── components/
    │   │   └── PdfUploadZone.js # PDF upload component
    │   └── config/
    │       └── api.js           # API configuration
    ├── .env                     # API URL
    └── package.json
```

---

## ✅ Checklist

Before testing, make sure:

- [ ] Flask API is running on port 5000
- [ ] React app is running on port 3000
- [ ] ANTHROPIC_API_KEY is set in Flask .env
- [ ] REACT_APP_API_URL is set in React .env
- [ ] Both terminals show no errors
- [ ] Browser can access http://localhost:3000
- [ ] API health check works: http://localhost:5000/api/health

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Flask API shows: "✨ Ready to accept requests!"
2. ✅ React app opens in browser
3. ✅ "Upload PDF" button is visible
4. ✅ Drag & drop works
5. ✅ Processing shows progress
6. ✅ Form builder loads with your data

---

## 📊 Expected Results

For the life insurance PDF:

| Metric | Value |
|--------|-------|
| **Processing Time** | 2-5 minutes |
| **Pages** | 5 |
| **Form Elements** | ~127 |
| **Sections** | ~12 |
| **Groups** | ~28 |
| **File Size (JSON)** | ~45 KB |

---

## 🔄 Complete Workflow

```
1. Start Flask API (Terminal 1)
   ↓
2. Start React App (Terminal 2)
   ↓
3. Open http://localhost:3000
   ↓
4. Upload PDF
   ↓
5. Wait for processing (2-5 min)
   ↓
6. Form builder loads
   ↓
7. Edit form
   ↓
8. Export HTML
   ↓
9. Done! 🎉
```

---

## 💡 Pro Tips

1. **Start API First** - Always start Flask before React
2. **Check Health** - Visit `/api/health` to verify API
3. **Use Small PDFs** - Test with 1-2 pages first
4. **Save JSON** - Keep extracted JSON for reuse
5. **Monitor Logs** - Watch both consoles for errors

---

## 📞 Need Help?

### **Check These First:**

1. **API Health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **React Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors

3. **Flask Console:**
   - Check terminal running Flask API
   - Look for error messages

4. **Environment Files:**
   - Verify .env files exist
   - Check API keys are set

---

## 🚀 Next Steps

After successful setup:

1. **Test with your PDF** - Upload your life insurance form
2. **Explore Features** - Try editing, reordering, adding fields
3. **Preview Form** - See how it looks to users
4. **Export HTML** - Get your final form
5. **Deploy** - Put it in production!

---

<div align="center">

**⚡ Ready to Go!**

*PDF → AI Extraction → Form Builder*

**All in one seamless workflow!**

</div>

# How to Install Socretes

## For Students

### Step 1: Download the Extension

Download the file: **`socretes-0.0.1.vsix`**

### Step 2: Install in VS Code

1. **Open VS Code**
2. **Go to Extensions**
   - Press `Ctrl+Shift+X` (Windows/Linux)
   - Or press `Cmd+Shift+X` (Mac)
   - Or click the Extensions icon in the left sidebar
3. **Click the `...` menu** (three dots at the top-right of the Extensions panel)
4. **Select "Install from VSIX..."**
5. **Navigate to and select** the `socretes-0.0.1.vsix` file
6. **Wait for installation** (takes a few seconds)
7. **Restart VS Code** when prompted

### Step 3: Get an Anthropic API Key

1. Visit: https://console.anthropic.com/
2. Sign up for a free account (or log in if you have one)
3. Go to **API Keys** section
4. Click **"Create Key"**
5. **Copy your API key** (it starts with `sk-ant-...`)
6. **Keep it secret!** Don't share it with anyone

### Step 4: Configure the Extension

1. **Open Settings**
   - Press `Ctrl+,` (Windows/Linux)
   - Or press `Cmd+,` (Mac)
2. **Search for** "Socretes"
3. **Find "Socretes: Anthropic Api Key"**
4. **Paste your API key** into the field
5. **Close Settings**

### Step 5: Start Using Socretes!

1. **Look for the Socretes icon** in the left sidebar (Activity Bar)
2. **Click it** to open the Socretes panel
3. **Select some code** in your editor
4. **Type a question** in the Socretes panel
5. **Press Enter** to start the conversation!

---

## Quick Test

Try this to make sure it's working:

1. Create a new file: `test.py`
2. Add this code:
   ```python
   def factorial(n):
       if n == 0:
           return 1
       return n * factorial(n-1)
   ```
3. **Select the code**
4. **Click the Socretes icon** in the sidebar
5. **Type:** "What does this code do?"
6. **Press Enter**
7. **You should see:** Socretes asking you questions about the code!

---

## Troubleshooting

### "Extension doesn't appear in the sidebar"

**Fix:**
- Go to: View → Open View → Socretes
- Or: Right-click the Activity Bar → Check "Socretes"

### "API Key error"

**Check:**
- Did you paste the full API key (starts with `sk-ant-`)?
- Is there any extra space before/after the key?
- Did you save the settings?

### "Nothing happens when I type a question"

**Check:**
- Did you click the Socretes icon to open the panel?
- Did you select code first (not required, but helpful)?
- Did you press Enter after typing?
- Is your API key configured correctly?

### "Installation failed"

**Try:**
- Make sure you downloaded the complete .vsix file
- Make sure you're using VS Code (not Visual Studio or another editor)
- Close and reopen VS Code
- Try installing again

---

## For Professors: Setup for Your Class

If you're distributing this to students:

### Option 1: Include Assignment Settings

Create a folder structure:
```
assignment-1/
├── .vscode/
│   └── settings.json        ← Your locked teaching level
├── socretes-0.0.1.vsix      ← The extension
├── starter-code.py          ← Assignment code
└── README.md                ← Instructions
```

**Example `.vscode/settings.json`:**
```json
{
  "socretes.teachingLevel": "strict",
  "socretes.lockTeachingLevel": true,
  "socretes.instructorConstraints": "- No built-in sort functions\n- Implement algorithms from scratch"
}
```

### Option 2: Distribute via GitHub Classroom

1. Create repository with assignment + .vsix file
2. Students clone their repository
3. Follow installation steps above
4. Settings are automatically applied from `.vscode/settings.json`

### Option 3: Upload to LMS (Canvas/Blackboard)

1. Zip your assignment folder (including .vsix)
2. Upload to your course
3. Students download, extract, and install

**See [PROFESSOR_GUIDE.md](PROFESSOR_GUIDE.md) for complete details!**

---

## Need Help?

- **Setup Guide:** See [QUICKSTART.md](QUICKSTART.md)
- **Professor Controls:** See [PROFESSOR_GUIDE.md](PROFESSOR_GUIDE.md)
- **Complete Documentation:** See [README.md](README.md)

---

## What's Next?

After installation, try all 4 learning modes:

1. **Explain This Code** - Understand existing code
2. **Help Me Start** - Get started on a coding task
3. **Debug This** - Find and fix bugs
4. **Review My Code** - Get feedback on your solution

**Remember:** Socretes uses the Socratic method - it will ask you questions to help you learn, not just give you answers!

Happy learning! 🎓

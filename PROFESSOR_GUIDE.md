# Professor's Guide to Socretes

## Controlling Student Learning with Teaching Levels

Socretes allows professors to control how much guidance students receive through the **Teaching Level** setting.

### How to Configure Teaching Level

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Socretes"
3. Find **"Socretes: Teaching Level"**
4. Choose from three levels

---

## Teaching Level Options

### 🔴 Strict Socratic (Best for Advanced Students)

**Philosophy:** Maximum student discovery, minimum direct help

**Behavior:**
- NEVER provides direct answers or explanations
- Only asks guiding questions
- Even after 5+ frustration signals, provides only tiny hints (single words or concept names)
- Never writes code for students
- Never reveals solutions directly

**Best For:**
- Advanced CS students
- Students preparing for technical interviews
- Self-motivated learners
- Upper-level courses where struggle is part of learning

**Example Interaction:**
```
Student: "What does this code do?"
Bot: "What do you notice about the loop condition?"
Student: "I don't know"
Bot: "Let's start smaller - what does i represent?"
Student: "An index?"
Bot: "Good! Now what happens each time through the loop?"
[Never directly explains - student must discover]
```

---

### 🟡 Balanced (Default - Recommended for Most Courses)

**Philosophy:** Guided discovery with safety net

**Behavior:**
- Asks 3-4 Socratic questions before explaining
- Provides hints when student says "I don't know" 2+ times
- After sustained effort, gives partial explanations
- Can provide small code examples if student shows significant effort
- Balances challenge with support

**Best For:**
- Introductory CS courses (CS1, CS2)
- Most undergraduate courses
- Mixed-ability classrooms
- When you want rigor but also support

**Example Interaction:**
```
Student: "What does this code do?"
Bot: "What do you think it does? Look at the function name."
Student: "Something with sorting?"
Bot: "Good! What do you notice about how it compares elements?"
Student: "I don't know"
Bot: "Look at lines 4-5. They swap elements. Why might that happen?"
Student: "I don't know"
Bot: "Hint: It swaps when arr[j] > arr[j+1]. Let me explain..."
[Provides explanation after 2 "I don't know" signals]
```

---

### 🟢 Helpful (Best for Beginners or Struggling Students)

**Philosophy:** Reduce frustration, build confidence

**Behavior:**
- Asks 1-2 quick Socratic questions
- Then provides clear, direct explanations
- Gives hints and code examples readily
- Focuses on building confidence alongside understanding
- Won't let students struggle for long

**Best For:**
- Complete beginners (high school, intro courses)
- Students with learning differences
- When time is limited
- Helping students catch up
- Building confidence before increasing rigor

**Example Interaction:**
```
Student: "What does this code do?"
Bot: "What do you think happens in the loop?"
Student: "Not sure"
Bot: "No problem! This is a bubble sort algorithm. It works by repeatedly comparing adjacent elements and swapping them if they're in the wrong order. Here's how it works step by step..."
[Explains directly after brief questioning]
```

---

## 🔒 How to Lock the Teaching Level (Prevent Student Changes)

### Quick Setup (3 Steps):

**1. Create `.vscode/settings.json` in your assignment folder:**

```json
{
  "socretes.teachingLevel": "strict",
  "socretes.lockTeachingLevel": true
}
```

**2. Share the folder with students:**
- Via Git repository (GitHub Classroom recommended)
- Through your LMS as a downloadable folder
- On a shared network drive

**3. Done!**
- Students will use your teaching level
- If they try to change it, they'll see: *"Teaching level is locked to 'strict' by your instructor and cannot be changed."*

### What Gets Locked:
- ✅ Teaching level cannot be changed in user settings
- ✅ Workspace setting is always used
- ✅ Students get a clear warning message
- ✅ Works immediately, no restart needed

### Template File:

Use the provided [.vscode/settings.json.template](.vscode/settings.json.template) as a starting point:

```bash
# Copy template to your assignment folder
cp .vscode/settings.json.template my-assignment/.vscode/settings.json

# Edit the teaching level as needed
# Then share my-assignment/ folder with students
```

---

## 📝 Adding Custom Instructor Constraints

Beyond teaching levels, you can add **custom constraints** for specific assignments!

### Quick Example:

```json
{
  "socretes.teachingLevel": "strict",
  "socretes.lockTeachingLevel": true,
  "socretes.instructorConstraints": "- Do not provide PyTorch code, only NumPy\n- Focus on implementing algorithms from scratch\n- Do not suggest using built-in sorting functions"
}
```

### Common Use Cases:

**Restrict Libraries:**
```
- No pandas, use only NumPy
- No jQuery, vanilla JavaScript only
```

**Force Approaches:**
```
- All solutions must use recursion
- Implement data structures from scratch
```

**Require Analysis:**
```
- Always discuss time/space complexity
- Ask about edge cases before hints
```

**Style Requirements:**
```
- Use only functional programming patterns
- No list comprehensions (use loops)
```

### How It Works:
These constraints are added to **every conversation** and Claude follows them strictly. Perfect for:
- Preventing shortcuts (no library X)
- Enforcing learning objectives (recursion only)
- Assignment-specific rules (Week 3 features only)

**For complete examples and use cases, see:**
[INSTRUCTOR_CONSTRAINTS_EXAMPLES.md](INSTRUCTOR_CONSTRAINTS_EXAMPLES.md)

---

## How to Choose the Right Level

### Use **Strict** when:
- ✅ Students have strong fundamentals
- ✅ Course focuses on problem-solving skills
- ✅ Preparing for competitive programming/interviews
- ✅ You want maximum cognitive effort
- ✅ Students are self-motivated

### Use **Balanced** when:
- ✅ Mixed ability classroom
- ✅ Standard CS curriculum
- ✅ You want both rigor and support
- ✅ Most undergraduate courses
- ✅ Default choice for most situations

### Use **Helpful** when:
- ✅ Students are complete beginners
- ✅ High frustration observed in class
- ✅ Time-limited assignments
- ✅ Building foundational confidence
- ✅ Supporting struggling students

---

## Changing Teaching Level Mid-Semester

You can adjust the teaching level at any time:

1. **Start Strict, Move to Balanced** if students are too frustrated
2. **Start Helpful, Move to Balanced** as students gain confidence
3. **Different levels for different assignments** - change in settings before each assignment

**Note:** The setting applies immediately - no need to restart VS Code!

---

## Monitoring Student Usage

### What Teaching Level Affects:
- ✅ How many questions before giving answers
- ✅ Size of hints provided
- ✅ Willingness to show code examples
- ✅ Response to frustration signals

### What It Doesn't Affect:
- ❌ The Socratic questioning approach (always used)
- ❌ The four learning modes (Explain, Start, Debug, Review)
- ❌ Conversation history or export
- ❌ API costs (same number of messages)

---

## Best Practices for Professors

### 1. **Set Expectations**
Tell students what teaching level you've chosen and why:
> "I've set Socretes to Strict mode because I want you to develop strong problem-solving skills. Don't expect direct answers!"

### 2. **Match to Learning Objectives**
- **Debugging assignment?** → Strict (they need to find bugs themselves)
- **New concept introduction?** → Helpful (build confidence first)
- **Exam prep?** → Balanced (practice with support)

### 3. **Consider Individual Needs**
Students can't change the teaching level themselves (it's a workspace setting), but you could:
- Create different workspace configurations for different student groups
- Adjust level based on class performance
- Use Helpful during office hours, Strict during class time

### 4. **Combine with Other Pedagogical Tools**
- Use Socretes for initial exploration
- Follow up with pair programming
- Discuss Socretes conversations in class
- Have students export and submit conversations

---

## Technical Details

### Where is the Setting Stored?
- In VS Code's workspace settings (`.vscode/settings.json`)
- Or in user settings (applies to all projects)
- Students can see the value but typically can't change workspace settings

### Can Students Override It?
- If set in **workspace settings**: No (they'd need workspace file access)
- If set in **user settings**: Yes (they can change their own settings)
- **Recommendation:** Use workspace settings shared with students

### Sample `.vscode/settings.json`:
```json
{
  "socretes.anthropicApiKey": "sk-ant-...",
  "socretes.teachingLevel": "strict",
  "socretes.modelName": "claude-sonnet-4-5-20250929"
}
```

---

## FAQ

**Q: Can students change the teaching level?**
A: Only if you don't lock it! Set `"socretes.lockTeachingLevel": true` in workspace settings to prevent changes.

**Q: How do I lock the teaching level?**
A: Create a `.vscode/settings.json` file with `lockTeachingLevel: true`, then share the folder with students.

**Q: What happens if a student tries to change a locked setting?**
A: They'll see a warning message: "Teaching level is locked to 'X' by your instructor and cannot be changed."

**Q: Can I see what students are asking?**
A: Students can export conversations. You could require them to submit exports as part of assignments.

**Q: Will Strict mode frustrate beginners too much?**
A: Possibly! Start with Balanced and only use Strict for advanced students or specific challenging assignments.

**Q: Does this prevent cheating?**
A: Socretes helps students learn, not copy solutions. Even in Helpful mode, it guides rather than solving problems completely.

**Q: Can different students have different levels?**
A: Yes! Create different workspace folders with different locked settings for different groups.

**Q: How do I know which level is working?**
A: Monitor student progress, ask for feedback, review exported conversations.

---

## Example Course Configurations

### **CS1 (Intro to Programming)**
- **Level:** Helpful → Balanced (start helpful, increase rigor)
- **Rationale:** Build confidence early, increase challenge later

### **CS2 (Data Structures)**
- **Level:** Balanced
- **Rationale:** Students need support but should think critically

### **Algorithms Course**
- **Level:** Strict
- **Rationale:** Problem-solving skills are the goal

### **Senior Capstone**
- **Level:** Balanced
- **Rationale:** Support available but students should be independent

---

## Getting Started

1. **Try all three levels yourself** with sample code
2. **Choose a default** for your course
3. **Tell students** what level you've chosen and why
4. **Adjust as needed** based on student feedback
5. **Monitor and iterate** throughout the semester

For more information, see the main [README.md](README.md).

---

**Remember:** The goal is student learning, not making things easy or hard. Choose the level that best supports your learning objectives! 🎓

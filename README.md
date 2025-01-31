# couscous

Couscous is a VS Code extension that uses AI to analyze your code quality against best practices and team conventions. It provides instant visual feedback, rewarding you with the satisfaction of delivering high-standard "code dishes" or... well, letting you know when your code needs a little more seasoning.

Think of it as your personal code chef, ensuring your team follows conventions and best practices. Write clean, elegant code, and you'll feel like a master chef in a prestigious restaurant, serving up delicious couscous. But if your code is messy or inconsistent, you might just get a not-so-appetizing reminder to clean up your act.

## Features

- 🧠 AI-powered code analysis using Deepseek
- 🥣 Couscous icon for compliant files (score > 70%)
- 💩 Poop icon for files needing improvement
- 🔍 Inline violation highlighting
- 💡 AI-generated improvement suggestions
- ✅ Quick-fix code actions

1. Install from VS Code Marketplace  
   _or_  
   Package locally:
   ```bash
   npm install -g vsce
   npm run package
   ```
2. Install the `.vsix` file via VS Code Extensions panel

## Usage

run the code anlaysis on a file of " any programming langauge " :

- ctrl + 1 keys on windows
- ctrl + 1 keys on mac

## Configuration

Add to your `.vscode/settings.json`:

```json
{
  "couscous": {
    "type": "deepseek", // openai or deepseek
    "model": "model-slug"
  },
  "couscous.conventions": [
    "Use descriptive naming conventions",
    "Adhere to DRY (Don’t Repeat Yourself)",
    "Handle errors gracefully",
    "Write small, single-responsibility functions",
    "Avoid magic numbers/strings",
    "Use version control effectively (e.g., meaningful commits)",
    "Conduct code reviews",
    "Avoid global mutable state",
    "Write unit tests"
  ]
}
```

or configure globally from settings.json

## Development

```bash
# Clone repo
git clone https://github.com/yourusername/couscous.git

# Install dependencies
npm install

# Build
npm run compile

# Test
npm test

# Package
npm run package
```

## Contributing

PRs welcome! Please:

1. Open an issue first
2. Keep tests at 80%+ coverage
3. Follow existing TypeScript patterns

## License

MIT © [Ahmed Rakan]

---

**Acknowledgments**

- Deepseek, OpenAI for the AI magic
- LangChain for LLM orchestration
- VS Code team for extension APIs

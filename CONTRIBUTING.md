# Contributing to Compare Code

Thank you for your interest in contributing to **Compare Code**! 🎉 This document provides guidelines and information for contributors to help make the process smooth and effective.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [gobasdev@gmail.com](mailto:gobasdev@gmail.com).

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **VS Code** (latest version)
- **Git**

### First-time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Compare-Code.git
   cd Compare-Code
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/bastndev/Compare-Code.git
   ```

## 🛠️ Development Setup

### Installation

```bash
# Install dependencies
npm install

# Compile TypeScript and SCSS
npm run compile

# Watch for changes during development
npm run watch
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch a new Extension Development Host window
3. Test your changes in the new window

### Available Scripts

```bash
npm run compile          # Compile TypeScript and SCSS
npm run watch           # Watch for changes
npm run package         # Build for production
npm run lint            # Run ESLint
npm run test            # Run tests
npm run check-types     # TypeScript type checking
```

## 🎯 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🌍 **Translations** (new languages)
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🧪 **Tests**

### Finding Issues to Work On

- Check the [Issues](https://github.com/bastndev/Compare-Code/issues) page
- Look for issues labeled `good first issue` for beginners
- Issues labeled `help wanted` are great for experienced contributors
- Feel free to propose new features by opening an issue first

### Before You Start

1. **Check existing issues** to avoid duplicating work
2. **Comment on the issue** you want to work on
3. **Wait for assignment** or approval from maintainers
4. **Create a new branch** for your work

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Make your changes** following our coding standards

3. **Test thoroughly**:
   ```bash
   npm run test
   npm run lint
   npm run check-types
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new comparison algorithm"
   # or
   git commit -m "fix: resolve memory leak in webview"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Link issues**: Reference related issues with `Fixes #123`
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(comparison): add Jaccard similarity algorithm
fix(ui): resolve scroll sync issue in webview
docs(readme): update installation instructions
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use **TypeScript strict mode**
- Provide **type annotations** for public APIs
- Use **interfaces** for object shapes
- Follow **naming conventions**:
  - `PascalCase` for classes and interfaces
  - `camelCase` for variables and functions
  - `UPPER_SNAKE_CASE` for constants

### Code Style

- **Indentation**: 2 spaces
- **Line length**: 80 characters (flexible for readability)
- **Semicolons**: Always use them
- **Quotes**: Single quotes for strings
- **Trailing commas**: Use them in multiline structures

### File Organization

```
src/
├── services/           # Business logic
├── ui/                # User interface components
├── utils/             # Utility functions
└── __tests__/         # Test files
```

### ESLint Configuration

We use ESLint with TypeScript support. Run `npm run lint` to check your code.

## 🧪 Testing Guidelines

### Writing Tests

- **Unit tests** for individual functions and classes
- **Integration tests** for component interactions
- **Test file naming**: `*.test.ts` or `*.spec.ts`
- **Test location**: Same directory as the code being tested

### Test Structure

```typescript
describe('ComparisonEngine', () => {
  describe('compare method', () => {
    it('should detect identical lines', () => {
      // Arrange
      const text1 = 'hello world';
      const text2 = 'hello world';
      
      // Act
      const result = ComparisonEngine.compare(text1, text2);
      
      // Assert
      expect(result.similarity).toBe(100);
    });
  });
});
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test -- --watch  # Run tests in watch mode
```

## 📚 Documentation

### Code Documentation

- Use **JSDoc comments** for public APIs
- Include **examples** in documentation
- Document **complex algorithms** with inline comments

### README Updates

When adding new features:
- Update feature lists
- Add usage examples
- Update screenshots if needed

### Translation Files

For new UI text:
1. Add the key to `src/ui/webview/l10n/en.json`
2. Provide translations for other supported languages
3. Use the i18n system in your code

## 🌍 Internationalization

### Adding New Languages

1. Create a new JSON file in `src/ui/webview/l10n/`
2. Follow the structure of existing language files
3. Update the language list in `compareView.ts`
4. Test the new language in the extension

### Translation Guidelines

- Keep translations **concise** and **clear**
- Maintain **consistent terminology**
- Consider **cultural context**
- Test UI layout with longer translations

## 🏗️ Architecture Guidelines

### Adding New Services

1. Create service in `src/services/`
2. Follow the existing service patterns
3. Add proper error handling
4. Include comprehensive tests
5. Update architecture documentation

### UI Components

- Use the webview architecture
- Follow existing styling patterns
- Ensure accessibility compliance
- Test across different themes

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** for duplicates
2. **Test with latest version**
3. **Try in a clean environment**

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10, macOS 12.0]
- VS Code Version: [e.g. 1.74.0]
- Extension Version: [e.g. 0.0.1]
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider the scope** - does it fit the project goals?
3. **Think about implementation** - is it feasible?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

## 🎉 Recognition

Contributors are recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Email**: [gobasdev@gmail.com](mailto:gobasdev@gmail.com) for private matters

### Response Times

- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 72 hours
- **Email**: Response within 24-48 hours

## 🙏 Thank You

Every contribution, no matter how small, makes Compare Code better for everyone. We appreciate your time and effort in helping improve this project!

---

**Happy Coding!** 🚀

For more information, visit our [website](https://bastndev.com/extensions) or check out our other [projects](https://github.com/bastndev).
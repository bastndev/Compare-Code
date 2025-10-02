# Contributing to Compare Code

## Welcome! 🌟

Thank you for your interest in contributing to **Compare Code**! We're excited to have you join our community of developers who are passionate about creating better tools for code comparison and analysis.

Whether you want to improve existing algorithms, add new comparison features, enhance the UI, or help with documentation, your contributions are valuable and welcome.

## Understanding the Project 🏗️

Before diving into contributions, we recommend reading our [**Architecture Documentation**](ARCHITECTURE.md) to understand:

- How the extension works internally
- The comparison algorithms and their implementations
- File organization and service structure
- The overall project architecture

This will help you make more effective contributions and understand where your changes fit in the bigger picture.

## Code of Conduct 📋

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for everyone. Report any unacceptable behavior to [gobasdev@gmail.com](mailto:gobasdev@gmail.com).

## Getting Started 🚀

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **VS Code** (latest version)
- **Git**

### Setting Up Your Development Environment

1. **Fork the repository**: Click the "Fork" button on the [Compare Code repository](https://github.com/bastndev/Compare-Code)

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Compare-Code.git
   cd Compare-Code
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/bastndev/Compare-Code.git
   ```

4. **Open in VS Code**:
   ```bash
   code .
   ```

## Development Workflow 🛠️

### Installation

```bash
# Install dependencies
npm install

# Compile TypeScript and SCSS
npm run compile

# Watch for changes during development
npm run watch
```

### Testing Your Changes

1. **Press `F5`** to launch a new Extension Development Host window
2. **Test thoroughly** with different file types and comparison scenarios
3. **Try various comparison algorithms** to ensure they work correctly

### Available Scripts

```bash
npm run compile          # Compile TypeScript and SCSS
npm run watch           # Watch for changes
npm run package         # Build for production
npm run lint            # Run ESLint
npm run test            # Run tests
npm run check-types     # TypeScript type checking
```

## Types of Contributions 📝

We welcome various types of contributions:

### 1. Improving Comparison Algorithms

**Location**: `./src/services/compare-code/`

Enhance existing algorithms or create new ones:

- **Similarity algorithms** (Jaccard, Cosine, etc.)
- **Diff algorithms** for better change detection
- **Performance optimizations** for large files
- **Language-specific comparisons**

### 2. UI/UX Enhancements

**Location**: `./src/ui/`

Improve the user experience:

- **Webview components** (`./src/ui/webview/`)
- **Comparison visualization**
- **Theme support** and styling
- **Responsive design** improvements

### 3. New Features

- 🔍 **Advanced search** and filtering
- 📊 **Statistics and metrics**
- 🎨 **Customization options**
- 🔧 **Configuration settings**
- 📱 **Mobile-friendly views**

### 4. Internationalization

**Location**: `./src/ui/webview/l10n/`

Add support for new languages:

- Create translation files (e.g., `fr.json`, `de.json`)
- Follow existing language file structure
- Test UI layout with different text lengths

### 5. Documentation & Testing

- 📚 **Documentation improvements**
- 🧪 **Unit and integration tests**
- 🐛 **Bug fixes**
- ⚡ **Performance optimizations**

### Finding Issues to Work On

- Check the [Issues](https://github.com/bastndev/Compare-Code/issues) page
- Look for `good first issue` labels for beginners
- `help wanted` issues are great for experienced contributors
- Feel free to propose new features by opening an issue first

## Submitting Your Contribution 🎯

### Development Process

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

### Pull Request Requirements

When creating your PR, please include:

1. **Clear description** of what you've added/changed
2. **Feature information** (if adding new functionality):

   - Feature name and purpose
   - How it improves the comparison experience
   - Any new configuration options

3. **Screenshots** (highly recommended):
   - Show your changes in action
   - Include before/after comparisons for UI changes
   - Demonstrate new features with examples

### Testing Checklist

Before submitting, please test with:

- ✅ **Different file types** (JavaScript, Python, TypeScript, etc.)
- ✅ **Various file sizes** (small and large files)
- ✅ **Different comparison scenarios** (similar files, completely different files)
- ✅ **UI responsiveness** across different screen sizes
- ✅ **Performance** with large files

## Important Notes ⚠️

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(comparison): add Jaccard similarity algorithm
fix(ui): resolve scroll sync issue in webview
docs(readme): update installation instructions
```

### What NOT to Modify

- **`package.json`** - Only maintainers update this for version releases and feature registration

## Coding Standards 📝

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

### Project Structure

```
src/
├── services/           # Business logic and algorithms
│   ├── compare-code/   # Comparison algorithms
│   ├── display/        # Display and formatting
│   └── user-actions/   # User interaction handlers
├── ui/                 # User interface components
│   ├── webview/        # Webview components and assets
│   └── compareView.ts  # Main view controller
├── utils/              # Utility functions
└── __tests__/          # Test files
```

### Code Formatting

The project uses ESLint and Prettier for consistent code formatting. Run `npm run lint` to check your code before submitting.

## Testing Guidelines 🧪

### Writing Tests

- **Unit tests** for individual functions and classes
- **Integration tests** for component interactions
- **Test file naming**: `*.test.ts` or `*.spec.ts`
- **Test location**: `src/__test__/` directory

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

## Getting Help 🆘

- **Bugs?** Create an [Issue](https://github.com/bastndev/Compare-Code/issues)
- **Architecture questions?** Check the [Architecture documentation](ARCHITECTURE.md)
- **Need inspiration?** Check out existing comparison algorithms and the [VS Code extension documentation](https://code.visualstudio.com/api)
- **Email**: [gobasdev@gmail.com](mailto:gobasdev@gmail.com) for private matters

### Response Times

- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 72 hours
- **Email**: Response within 24-48 hours

---

**Thank you for contributing to Compare Code!** Your work helps developers worldwide have better tools for code comparison and analysis. 🚀

For more information, visit our [website](https://bastndev.com/extensions) or check out our other [projects](https://github.com/bastndev).

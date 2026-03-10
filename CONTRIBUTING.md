# Contributing to Fact.it - Deepfake AI Checker

Thank you for your interest in contributing to Fact.it! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Python version, Node version, browser)

### Suggesting Enhancements

We welcome feature suggestions! Please create an issue with:

- **Clear description** of the enhancement
- **Use case** - why is this feature needed?
- **Proposed solution** (if you have one)
- **Alternative solutions** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages** following our commit guidelines
6. **Submit a pull request**

## 🔧 Development Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/deepfake-ai-checker.git
cd deepfake-ai-checker

# Create a new branch
git checkout -b feature/your-feature-name

# Install dependencies
pip3 install -r requirements.txt
cd frontend && npm install && cd ..
cd backend && pip3 install -r requirements.txt && cd ..

# Make your changes
# ...

# Test your changes
# Backend: Run uvicorn app:app --reload
# Frontend: Run npm run dev
```

## 📝 Coding Standards

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** where applicable
- Write **docstrings** for functions and classes
- Keep functions **small and focused**
- Use **meaningful variable names**

Example:
```python
def predict_image(image: np.ndarray) -> dict:
    """
    Predict if an image is fake or real.
    
    Args:
        image: RGB image as numpy array
        
    Returns:
        Dictionary with prediction results
    """
    # Implementation
    pass
```

### JavaScript/React (Frontend)

- Use **functional components** with hooks
- Follow **React best practices**
- Use **meaningful component and variable names**
- Keep components **small and reusable**
- Add **comments** for complex logic

Example:
```javascript
// Good
const [isLoading, setIsLoading] = useState(false)

// Avoid
const [x, setX] = useState(false)
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
# Add your tests in tests/ directory
pytest
```

### Frontend Testing

```bash
cd frontend
# Manual testing for now
npm run dev
# Test all features in browser
```

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add batch image processing
fix: Resolve CORS issue in API
docs: Update README with new features
style: Format code according to PEP 8
refactor: Simplify image preprocessing
test: Add unit tests for predictor
chore: Update dependencies
```

Format: `<type>: <description>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

## 🎯 Areas for Contribution

### High Priority
- [ ] Add unit tests for backend
- [ ] Add integration tests
- [ ] Improve error handling
- [ ] Add loading states and animations
- [ ] Optimize model inference speed

### Medium Priority
- [ ] Add user authentication
- [ ] Implement result history
- [ ] Add export functionality (CSV/PDF)
- [ ] Improve mobile responsiveness
- [ ] Add dark/light theme toggle

### Low Priority
- [ ] Add more model options
- [ ] Implement video detection
- [ ] Add API rate limiting
- [ ] Create admin dashboard
- [ ] Add analytics

## 🐛 Bug Fixes

When fixing bugs:

1. **Reproduce the bug** first
2. **Write a test** that fails (if applicable)
3. **Fix the bug**
4. **Verify the test passes**
5. **Check for side effects**

## ✨ Adding Features

When adding new features:

1. **Discuss in an issue** first (for major features)
2. **Design the solution**
3. **Implement incrementally**
4. **Add tests**
5. **Update documentation**
6. **Submit PR with clear description**

## 📚 Documentation

When updating documentation:

- Keep it **clear and concise**
- Include **code examples** where helpful
- Update **README.md** for user-facing changes
- Add **inline comments** for complex code
- Update **API documentation** if endpoints change

## 🔍 Code Review Process

All submissions require review. We use GitHub pull requests for this purpose:

1. **Automated checks** must pass
2. **At least one approval** from maintainers
3. **All discussions resolved**
4. **No merge conflicts**

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Email** - For private concerns

## 🙏 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes
- Project documentation

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Fact.it! 🎉

# Contributing to Psycho Trader AI

Thank you for your interest in this project! While this is primarily a portfolio project, I'm open to feedback, ideas, and discussions.

## 🤔 How Can You Contribute?

### 1. **Share Feedback**
If you're interested in trading psychology or AI-powered reflection tools, I'd love to hear your thoughts:
- What resonates with you about the approach?
- What features would you find most valuable?
- Any UX suggestions?

### 2. **Report Issues**
Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 3. **Suggest Features**
Have an idea? Open an issue tagged "enhancement" with:
- Problem it solves
- Proposed solution
- Why it matters for trading psychology

### 4. **Code Contributions** (Future)
Currently not accepting PRs, but if you want to fork and build something inspired by this, go for it! Let me know—I'd love to see what you create.

## 🎯 Project Philosophy

Before suggesting changes, please understand the core principles:

1. **Human-Driven Design**: AI is a tool, not a replacement for thoughtful product decisions
2. **Psychoanalytic Approach**: Focus on *why* behaviors happen, not just *what* happened
3. **Memory Over Logs**: Curated observations, not infinite chat history
4. **Warm but Direct**: No therapy-speak, no excessive validation

## 🛠️ Development Setup

If you want to explore the codebase locally:

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/psycho-trader-ai.git
cd psycho-trader-ai

# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
uvicorn app:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📝 Code Style

- **Python**: Follow PEP 8, use type hints
- **JavaScript/TypeScript**: Use ESLint/Prettier defaults
- **Commits**: Clear, descriptive messages (imperative mood)

## 💬 Contact

Questions? Ideas? Want to chat about trading psychology or AI product design?

**LinkedIn**: [Your LinkedIn]
**Email**: [Your Email]

---

*"Building at the intersection of AI and human behavior."*

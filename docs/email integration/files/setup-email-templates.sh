#!/bin/bash

# Email Templates Setup Script
# Run this to organize the email template files in your project

echo "🚀 Setting up Email Templates..."

# Create directory structure
echo "📁 Creating directories..."
mkdir -p src/services
mkdir -p src/templates/emails
mkdir -p examples

# Move files to appropriate locations
echo "📋 Organizing files..."

# Move email service
if [ -f "emailService.js" ]; then
  mv emailService.js src/services/
  echo "✅ Moved emailService.js to src/services/"
fi

# Move examples
if [ -f "emailExamples.js" ]; then
  mv emailExamples.js examples/
  echo "✅ Moved emailExamples.js to examples/"
fi

# Rename and move templates
if [ -f "email-template-signin.html" ]; then
  mv email-template-signin.html src/templates/emails/signin.html
  echo "✅ Moved signin template"
fi

if [ -f "email-template-question-created.html" ]; then
  mv email-template-question-created.html src/templates/emails/question-created.html
  echo "✅ Moved question-created template"
fi

if [ -f "email-template-answer-received.html" ]; then
  mv email-template-answer-received.html src/templates/emails/answer-received.html
  echo "✅ Moved answer-received template"
fi

if [ -f "email-template-expert-new-question.html" ]; then
  mv email-template-expert-new-question.html src/templates/emails/expert-new-question.html
  echo "✅ Moved expert-new-question template"
fi

# Copy .env.example if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "✅ Created .env file from .env.example"
  echo "⚠️  Please update .env with your ZeptoMail API key"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with ZeptoMail API key"
echo "2. Customize templates in src/templates/emails/"
echo "3. Test with: node examples/emailExamples.js"
echo ""
echo "📚 Read EMAIL-README.md for full documentation"

#!/bin/bash

# Test script for magic link token cleanup
# Run this to verify the cleanup system is working

echo "🧪 Testing Magic Link Token Cleanup"
echo "===================================="
echo ""

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET environment variable not set"
  echo "   Set it with: export CRON_SECRET=your_secret_here"
  exit 1
fi

echo "📡 Calling cleanup cron job..."
echo ""

# Call the cleanup endpoint
RESPONSE=$(curl -s -X POST "https://quickchat-dev.vercel.app/api/cron/cleanup-orphaned-media" \
  -H "Authorization: Bearer $CRON_SECRET")

# Check if response is valid JSON
if echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then
  echo "✅ Response received successfully"
  echo ""

  # Pretty print the response
  echo "$RESPONSE" | jq '.'

  # Extract magic link tokens stats
  TOKENS_DELETED=$(echo "$RESPONSE" | jq -r '.magicLinkTokens.deleted // 0')
  TOKENS_ERRORS=$(echo "$RESPONSE" | jq -r '.magicLinkTokens.errors // 0')

  echo ""
  echo "📊 Magic Link Token Cleanup Summary:"
  echo "   Deleted: $TOKENS_DELETED"
  echo "   Errors: $TOKENS_ERRORS"

  if [ "$TOKENS_ERRORS" -gt 0 ]; then
    echo ""
    echo "⚠️  Warning: Cleanup had errors. Check Vercel logs for details."
  fi
else
  echo "❌ Error: Invalid JSON response"
  echo ""
  echo "Response:"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "✅ Test complete!"
echo ""
echo "💡 To see detailed logs:"
echo "   1. Go to https://vercel.com/your-project/logs"
echo "   2. Find the latest /api/cron/cleanup-orphaned-media execution"
echo "   3. Look for 🔐 Part 4 logs"

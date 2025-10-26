#!/bin/bash

# Security Validation Test Runner
# Loads .env and runs security tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"

# Generate log file with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$SCRIPT_DIR/logs/security-test-$TIMESTAMP.log"

echo -e "${GREEN}QuickChat Security Validation${NC}"
echo -e "${GREEN}==============================${NC}"
echo -e "${CYAN}Log file: $LOG_FILE${NC}\n"

# Function to log and display
log_and_display() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Start logging
{
    echo "QuickChat Security Validation Test Run"
    echo "Date: $(date)"
    echo "======================================"
    echo ""
} > "$LOG_FILE"

# Check if .env exists in the tests directory
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    MSG="⚠️  .env file not found\nCreating .env from .env.example..."
    echo -e "${YELLOW}$MSG${NC}" | tee -a "$LOG_FILE"

    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo -e "${YELLOW}📝 Please edit $SCRIPT_DIR/.env with your test data${NC}" | tee -a "$LOG_FILE"
        exit 1
    else
        echo -e "${RED}❌ .env.example not found in $SCRIPT_DIR${NC}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required (you have v$NODE_VERSION)${NC}" | tee -a "$LOG_FILE"
    echo "Please upgrade: https://nodejs.org/" | tee -a "$LOG_FILE"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}✓ Loading test configuration from $SCRIPT_DIR/.env${NC}\n" | tee -a "$LOG_FILE"

# Export variables from .env
set -a
source "$SCRIPT_DIR/.env"
set +a

# Run tests and capture all output
echo "Running security validation tests..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run the test script with output to both terminal and log
# Pass all script arguments to the Node.js script (e.g., --cleanup)
node "$SCRIPT_DIR/security-validation.cjs" "$@" 2>&1 | tee -a "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

# Add final messages
echo "" | tee -a "$LOG_FILE"
echo "====================================" | tee -a "$LOG_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All security tests passed!${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}📄 Full log saved to: $LOG_FILE${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Security tests failed!${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}📄 Full log saved to: $LOG_FILE${NC}"
    echo -e "${YELLOW}Review the log file for details.${NC}"
    echo ""
    exit 1
fi

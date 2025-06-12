#!/bin/bash
cd /home/kavia/workspace/code-generation/ordersim-api-109147-cbc87926/ordersim_api
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi


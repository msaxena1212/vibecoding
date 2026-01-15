#!/bin/bash

# Vibe LangGraph API Test Suite
# Use this script to test the backend API endpoints

BASE_URL="http://localhost:8000/api/v1"

echo "=== Testing Root Endpoint ==="
curl -X GET "http://localhost:8000/"
echo -e "\n"

echo "=== Testing List Projects ==="
curl -X GET "$BASE_URL/projects"
echo -e "\n"

echo "=== Testing Generate Project (React Counter) ==="
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/generate/" \
     -H "Content-Type: application/json" \
     -d '{"intent": "create a simple react counter app"}')
echo "$GENERATE_RESPONSE" | jq .
PROJECT_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.project_id')
echo -e "\nProject ID: $PROJECT_ID\n"

if [ "$PROJECT_ID" != "null" ]; then
    echo "=== Testing Get Project Messages ==="
    curl -X GET "$BASE_URL/projects/$PROJECT_ID/messages" | jq .
    echo -e "\n"
    
    echo "=== Testing Modify Project (Add Reset Button) ==="
    curl -s -X POST "$BASE_URL/generate/" \
         -H "Content-Type: application/json" \
         -d "{\"intent\": \"add a reset button to the counter\", \"project_id\": \"$PROJECT_ID\"}" | jq .
    echo -e "\n"
fi

echo "=== Testing Explain/Chat (How it works?) ==="
curl -s -X POST "$BASE_URL/generate/" \
     -H "Content-Type: application/json" \
     -d '{"intent": "greet me and tell me how this platform works"}' | jq .
echo -e "\n"

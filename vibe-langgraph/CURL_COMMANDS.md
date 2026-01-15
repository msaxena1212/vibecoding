# Vibe LangGraph API Test Commands (cURL)

Use these commands to test the backend API. Ensure the server is running (e.g., via `uvicorn backend.apps.api.main:app --reload`).

## 1. List All Projects
```bash
curl -X GET "http://localhost:8000/api/v1/projects"
```

## 2. Generate a New Project (React Counter)
```bash
curl -X POST "http://localhost:8000/api/v1/generate/" \
     -H "Content-Type: application/json" \
     -d '{"intent": "create a simple react counter app"}'
```

## 3. Get Project Messages
Replace `{project_id}` with the ID returned from the generate command.
```bash
curl -X GET "http://localhost:8000/api/v1/projects/{project_id}/messages"
```

## 4. Modify an Existing Project
Replace `{project_id}` with the ID of the project you want to modify.
```bash
curl -X POST "http://localhost:8000/api/v1/generate/" \
     -H "Content-Type: application/json" \
     -d '{"intent": "add a reset button to the counter", "project_id": "{project_id}"}'
```

## 5. Conversational/Explain Intent
```bash
curl -X POST "http://localhost:8000/api/v1/generate/" \
     -H "Content-Type: application/json" \
     -d '{"intent": "greet me and tell me how this platform works"}'
```

## 6. Validate Codebase (If applicable)
```bash
curl -X POST "http://localhost:8000/api/v1/validate/" \
     -H "Content-Type: application/json" \
     -d '{"project_id": "{project_id}"}'
```

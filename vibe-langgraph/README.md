# Vibe LangGraph Platform

A generative coding platform inspired by Lovable/Antigravity, powered by LangGraph.

## Architecture

- **Apps**: FastAPI backend
- **Agents**: Planner, Generator, Linker, Editor, Validator
- **Graph**: LangGraph state machine
- **Memory**: Project snapshots and diff engine
- **Detailed Workflow**: See [workflow.md](./workflow.md) for full process details.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # or
   pip install .
   ```

2. Set environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run with Docker:
   ```bash
   docker-compose up
   ```

4. Or run locally:
   ```bash
   uvicorn apps.api.main:app --reload
   ```

## Usage

- **Generate**: POST /api/v1/generate
- **Edit**: POST /api/v1/edit

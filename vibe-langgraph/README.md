# Vibe LangGraph Platform

A generative coding platform inspired by Lovable/Antigravity, powered by LangGraph.

## Architecture

- **Apps**: FastAPI backend
- **Agents**: Planner, Generator, Linker, Editor, Validator, UI Specialist, SEO Specialist
- **Graph**: LangGraph state machine (See [LOGIC.md](./LOGIC.md) for details)
- **Memory**: Project snapshots and diff engine

## Key Features
- **Dashboard 2.0**: High-fidelity "Command Center" with Chart.js analytics and real-time stats.
- **Mobile-First Design**: Universal responsive navigation with glassmorphism overlays.
- **Premium Interactions**: Interaction Observer reveal effects and smooth scroll physics.


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

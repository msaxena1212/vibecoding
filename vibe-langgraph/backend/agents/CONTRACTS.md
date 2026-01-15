# Vibe-LangGraph Agent Contracts

This document defines the strictly enforced input/output contracts for each agent in the platform.

## 1. Global Constraints
- All agents MUST interact only through the `CodebaseState`.
- Agents MUST NOT perform side effects (disk I/O, network requests) unless explicitly permitted.
- All code generated MUST follow the project's framework guidelines (React 18+, Vite).

---

## 2. Router Agent
- **Input**: `userIntent` (string)
- **Output**: `intent` (RouterOutput)
- **Guarantees**: 
    - MUST provide a primary mode.
    - MUST provide a confidence score.
- **Forbidden**: Writing code or making implementation plans.

## 3. Planner Agent
- **Input**: `intent`, `files` (current state)
- **Output**: `plan` (PlanState)
- **Guarantees**:
    - MUST list all files to be created or modified.
    - MUST provide a step-by-step technical implementation path.
- **Forbidden**: Generating actual file content.

## 4. Generator Agent
- **Input**: `plan.filesToCreate`
- **Output**: `files` (updated with new FileState)
- **Guarantees**:
    - MUST only create files listed in the plan.
    - MUST NOT modify existing files.
- **Forbidden**: Resolving imports (handled by Linker).

## 5. Editor Agent
- **Input**: `plan.filesToModify`, `files` (current state)
- **Output**: `files` (updated with patches)
- **Guarantees**:
    - MUST use minimal diffs/patches.
    - MUST preserve existing code structure and comments.
- **Forbidden**: Creating new files.

## 6. Linker Agent
- **Input**: `files`
- **Output**: `dependencyGraph`, `files` (normalized paths)
- **Guarantees**:
    - MUST resolve all relative imports.
    - MUST identify missing dependencies.
- **Forbidden**: Changing logic or syntax within files.

## 7. Validator Agent
- **Input**: `files`, `framework`
- **Output**: `diagnostics` (Structured Errors/Warnings)
- **Guarantees**:
    - MUST identify syntax errors.
    - MUST verify framework compliance (React entry points, etc.).
- **Forbidden**: Modifying code.

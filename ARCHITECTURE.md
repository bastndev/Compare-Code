# Current Architecture of the Compare-Code Project

## General Description
This VS Code extension allows efficient code comparison. The current architecture is based on a modular structure with separation of responsibilities between activation, services, user interface, and utilities.

## Current Architecture Diagram


```py
src/
├──__test__/              # Tests existentes + nuevos para servicios 
├── services/             # Lógica reutilizable
│   ├── comparisonService.ts  # Calcula diffs (línea por línea o avanzado)
│   ├── inputService.ts       # Maneja selección local/pasteo (y futuro web)
│   └── configService.ts      # Configs de VSCode (e.g., ignore whitespace)
├── ui/                   # Interfaz
│   └── compareView.ts    # Abre diff editor o webview para visualización
├── utils/                # Soporte
│   ├── logger.ts         # Logging para debug
│   └── types.ts          # Interfaces (e.g., IComparisonResult)
└──extension.ts           # Puente: Activa, registra comandos, conecta módulos
```


## Main Components
- **extension.ts**: Entry point that activates the extension and registers commands.
- **Services**: Handle comparison logic, data input, and configuration.
- **UI**: Manages the visualization of differences.
- **Utils**: Provides logging and type definitions.
- **Tests**: Ensure code quality.

# Improved Architecture

## Title: Enhanced Modular Architecture for Code Comparison Extension

## Description 
This improved architecture introduces better modularity, error handling, and scalability. It includes asynchronous operations, a more robust UI layer with webview support, and enhanced services with dependency injection. The structure promotes maintainability and extensibility for future features like multi-language support and cloud integration.

## Improved Architecture Diagram

```mermaid
graph TD
    A[Extension Activation] --> B[Command Registry]
    B --> C[Input Service]
    B --> D[Config Service]
    C --> E[Comparison Service]
    D --> E
    E --> F[UI Layer: Diff Editor / Webview]
    F --> G[Logger]
    E --> H[Error Handler]
    I[Tests] --> J[Unit Tests for Services]
    I --> K[Integration Tests for UI]
    L[Utils] --> M[Types & Interfaces]
    L --> G
```

NEXT- future

```py
src/
├── __tests__/                    # Tests
│   ├── unit/                     # Unit Tests for Services
│   │   ├── comparisonService.test.ts
│   │   ├── inputService.test.ts
│   │   └── configService.test.ts
│   └── integration/              # Integration Tests for UI
│       └── diffEditor.integration.test.ts
├── services/                     # Servicios principales
│   ├── comparisonService.ts      # Procesa comparaciones tras recibir de Input/Config
│   ├── inputService.ts           # Maneja selección/input del usuario
│   └── configService.ts          # Configuraciones de VSCode
├── ui/                          # UI Layer: Diff Editor / Webview
│   └── diffEditor.ts            # Diff Editor / Webview que conecta con Logger
├── utils/                       # Utils
│   ├── logger.ts               # Logger (recibe de UI Layer)
│   ├── types.ts                # Types & Interfaces
│   └── errorHandler.ts         # Error Handler (recibe de Comparison Service)
├── commandRegistry.ts          # Command Registry (punto intermedio tras activation)
└── extension.ts                # Extension Activation (punto de entrada)
```

### Improved Components
- **Asynchronous Operations**: All services now support async/await operations for better performance.
- **Error Handling**: A dedicated module for handling errors and exceptions.
- **Dependency Injection**: Services are injected to facilitate testing and mocking.
- **Enhanced UI**: Support for webview in addition to the native diff editor.
- **Scalability**: Structure prepared to add new services and features.


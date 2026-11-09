# Technical specification

## Summary

[Briefly describe the technical approach of the solution. Summarize the main architecture decisions and the implementation strategy in one or two paragraphs.]

## System architecture

### Component overview

[Briefly describe the main components and list each new or modified component:

- Component names and main responsibilities
- Main relationships between components
- Data flow overview]

## Implementation design

### Main interfaces

[If applicable, define the main service interfaces, following the project's patterns and language, with at most 20 lines per example:

```
ServiceName
  methodName(input) -> output
```

]

### Data models

If applicable, document **each** entity or contract using the model below: its own subsection, a field table and a representative example in the format adopted by the project. Variants, degradations, error envelopes, mappings and fixed parameters must have their own blocks, as shown.

If there are JSON contracts between backend and UI, they must be ready for display. [Complete the feature-specific context. Fields missing at the source must be normalized to `null`, when that is the project's convention.]

#### `[TypeName]` — [short description]

| Field     | Type     | Required | Description   |
| --------- | -------- | -------- | ------------- |
| `[field]` | `[type]` | yes/no   | [Description] |

```text
{
  "[field]": "[realistic value]"
}
```

[Repeat the pattern above for each main entity or contract: aggregated payload, input types, error types etc.]

> **[Variant/degradation (if applicable)]:** [Explain when it occurs and what the impact on the payload is.]

```text
{
  "[affected_section]": null
}
```

#### `[ErrorName]` — error envelope (if applicable)

| Code     | HTTP       | Meaning       |
| -------- | ---------- | ------------- |
| `[code]` | `[status]` | [Description] |

```text
{
  "error": {
    "code": "[code]",
    "message": "[message in English or PT-BR, following the project's convention]"
  }
}
```

#### Mapping [external source] → contract (if applicable)

| Source ([API/source]) | Target (contract) |
| --------------------- | ----------------- |
| `[source_field]`      | `[target_field]`  |

#### Fixed parameters at the source (if applicable)

| API               | Main parameters                    |
| ----------------- | ---------------------------------- |
| **[API name]**    | `[param1=value]`, `[param2=value]` |

[If applicable, document the database schemas using the same pattern: subsection, table and example in JSON or SQL.]

### API endpoints (if applicable)

If the feature exposes or consumes an API, document **each** endpoint using the model below and cover all relevant scenarios: success, empty list, validation error, source error and partial degradation. Record non-obvious behaviors in a blockquote (`>`). For payloads already documented in Data models, reference the existing example instead of duplicating it.

#### Overview

| Method           | Route        | Description         |
| ---------------- | ------------ | ------------------- |
| `[GET/POST/...]` | `[/api/...]` | [Brief description] |

---

#### `[METHOD] [/api/route]`

[Brief description of the endpoint's purpose.]

**Query parameters** (or **body** for POST/PUT/PATCH)

| Parameter | Type     | Default                  | Rules                   |
| --------- | -------- | ------------------------ | ----------------------- |
| `[param]` | `[type]` | `[default value or —]`   | [Validations and rules] |

**Responses**

| Status  | Body             | When                           |
| ------- | ---------------- | ------------------------------ |
| `[200]` | `[ResponseType]` | [Success condition]            |
| `[400]` | `[ErrorType]`    | [Validation error condition]   |
| `[502]` | `[ErrorType]`    | [Source failure condition]     |

**Example — success**

```http
[METHOD] /api/route?param=value
```

```text
{
  "[field]": "[realistic value]"
}
```

**Example — [alternative scenario, for example, no match]**

```http
[METHOD] /api/route?param=value
```

```text
{
  "[body]": []
}
```

> [Note about frontend/client behavior, if applicable.]

**Example — [error scenario]**

```http
[METHOD] /api/route
```

```text
{
  "error": {
    "code": "[code]",
    "message": "[message]"
  }
}
```

[Repeat the pattern above for each endpoint, separating them with `---`.]

---

## Integration points

[Include only if the feature requires external integrations:

- External services or APIs
- Authentication requirements
- Error handling strategy]

## Testing approach

Define the testing strategy applicable to the feature and name each case with a stable identifier. Use `UT-*` for unit tests, `IT-*` for integration tests and `E2E-*` for E2E tests. Link each case to the acceptance criteria (`AC-*`) it verifies. Record as not applicable any layer that does not make sense for the solution.

### Unit tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
|----|----------------|---------------------|-----------------|
| UT-01 | [test case name] | [AC-01] | [expected result] |

[Detail the unit testing strategy:

- Main components to be tested
- Use mocks only for external services
- Critical test scenarios]

### Integration tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
|----|----------------|---------------------|-----------------|
| IT-01 | [test case name] | [AC-01] | [expected result] |

[If necessary, detail:

- Components to be tested together
- Test data requirements]

### E2E tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
|----|----------------|---------------------|-----------------|
| E2E-01 | [test case name] | [AC-01] | [expected result] |

[If necessary, describe how to test the interface together with the services involved using the browser tool available in the environment.]

## Development sequencing

### Build order

[Describe the implementation sequence:

1. First component/feature (why first)
2. Second component/feature (dependencies)
3. Remaining components
4. Integration and tests]

### Technical dependencies

[List the blockers and technical dependencies:

- Required infrastructure
- Availability of external services]

## Monitoring and observability

[Describe the monitoring approach using the project's existing infrastructure:

- Metrics or health checks to expose
- Main events to log and their levels]

## Technical considerations

### Key decisions

[Record the key technical decisions:

- Choice of approach and justification
- Trade-offs considered
- Discarded alternatives and the reasons]

### Known risks

[List the technical risks:

- Potential challenges
- Mitigation approaches
- Areas that need research]

### Compliance with AGENTS.md and the rules

[Confirm you have read the `AGENTS.md` and all rules in `.agents/rules/`. Record the constraints and decisions relevant to this specification.]

### Skills compliance

[List only the project skills (`.agents/skills`) applicable to this specification.]

### Relevant and dependent files

[List the relevant and dependent files.]

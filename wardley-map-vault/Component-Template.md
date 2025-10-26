---
# Component Metadata Template
# Copy this template when creating new strategic components

type: component  # Options: component, capability, service, user_need, product
evolution_stage: product  # Options: genesis, custom, product, commodity
strategic_importance: supporting  # Options: critical, important, supporting, optional
confidence_level: medium  # Options: high, medium, low

# Evidence sources - link to notes that support your strategic assessment
evidence_sources:
  - "[[Evidence Note 1]]"
  - "[[Evidence Note 2]]"

# Last validation date - when did you last verify this assessment?
last_validated: "2025-01-08"  # Use YYYY-MM-DD format

# Dependencies - what does this component depend on?
depends_on:
  - "[[Lower Component 1]]"
  - "[[Lower Component 2]]"

# Enables - what does this component enable?
enables:
  - "[[Higher Component 1]]"

# Evolution relationships - show technological progression
evolves_to:
  - "[[Future State]]"
evolved_from:
  - "[[Previous State]]"
---

# Component Name

Brief description of what this component is and its role in your strategic landscape.

## Purpose / Value Proposition

What does this component do? Why does it exist? What value does it provide?

## Current State

Describe the current reality:
- How is this implemented today?
- What are its characteristics?
- What are the strengths and weaknesses?

## Strategic Position

Explain why you positioned it where it is:
- **Evolution Stage**: Why genesis/custom/product/commodity?
- **Value Chain Position**: What does it depend on? What depends on it?
- **Strategic Importance**: Why critical/important/supporting?

## Evolution Considerations

If this component is evolving or could evolve:
- Where is it headed?
- What forces are driving evolution?
- What's the timeline?
- What are the implications?

## Evidence & Validation

Reference the evidence supporting your assessment:
- Market research findings
- Technical assessments  
- Customer feedback
- Competitive analysis
- Expert opinions

## Risks & Dependencies

Key risks and dependencies to track:
- What could go wrong?
- What are the dependencies on?
- What alternatives exist?
- What's the mitigation strategy?

---

## Template Guide

### Choosing Type
- **user_need**: The fundamental need driving the value chain (usually at the top)
- **product**: What you deliver to meet the need
- **capability**: An organizational ability or skill
- **service**: A service you consume or provide
- **component**: A building block or infrastructure element

### Choosing Evolution Stage
- **genesis**: Novel, uncertain, rapidly changing, few understand it
- **custom**: Becoming understood, competitive advantage, custom-built solutions
- **product**: Best practices emerging, standardized products available, rental options
- **commodity**: Standardized, utility-like, stable, well-defined, volume operations

### Choosing Strategic Importance
- **critical**: Business fails if this fails, no alternatives, high visibility
- **important**: Significant impact, alternatives exist but costly, strategic differentiator
- **supporting**: Necessary but not differentiating, alternatives readily available
- **optional**: Nice to have, low impact if removed

### Choosing Confidence Level
- **high**: Strong evidence, recent validation, well understood
- **medium**: Some evidence, reasonable validation, understood with caveats
- **low**: Assumptions, old data, uncertainty, needs validation

### Evidence Sources
Link to notes containing:
- Research reports
- Analysis documents
- Meeting notes with decisions
- Customer feedback
- Market data
- Technical assessments
- Expert interviews

These don't need strategic metadata themselves - they're just supporting documentation.

### Validation Dates
Set reminders to review:
- Critical components: Every 3 months
- Important components: Every 6 months  
- Supporting components: Every 12 months

### Relationships
- **depends_on**: What this needs to function (usually more evolved/commodity)
- **enables**: What this makes possible (usually less evolved/closer to user need)
- **evolves_to**: Future state (usually more evolved)
- **evolved_from**: Previous state (usually less evolved)

---

## Quick Examples

### Example 1: Infrastructure Component
```yaml
type: service
evolution_stage: commodity
strategic_importance: supporting
confidence_level: high
evidence_sources:
  - "[[Cloud Provider Comparison]]"
last_validated: "2025-01-08"
enables:
  - "[[Application Platform]]"
```

### Example 2: User Need
```yaml
type: user_need
evolution_stage: genesis
strategic_importance: critical
confidence_level: medium
evidence_sources:
  - "[[Customer Interviews]]"
  - "[[Market Research]]"
last_validated: "2025-01-08"
depends_on:
  - "[[Product Offering]]"
```

### Example 3: Custom Capability
```yaml
type: capability
evolution_stage: custom
strategic_importance: important
confidence_level: high
evidence_sources:
  - "[[Team Skills Assessment]]"
  - "[[Competitive Analysis]]"
last_validated: "2024-12-15"
depends_on:
  - "[[Development Tools]]"
  - "[[Cloud Infrastructure]]"
enables:
  - "[[Product Features]]"
```

### Example 4: Evolving Component
```yaml
type: component
evolution_stage: product
strategic_importance: supporting
confidence_level: high
evidence_sources:
  - "[[Technology Roadmap]]"
last_validated: "2025-01-08"
evolved_from:
  - "[[Legacy System]]"
evolves_to:
  - "[[Cloud Native Platform]]"
```

---

## Tips for Quality Strategic Components

1. **Be specific in descriptions** - "Web Application" not "Tech Thing"
2. **Link real evidence** - Create actual notes with research/data
3. **Update validation dates** - Set calendar reminders
4. **Be honest about confidence** - Low confidence is valuable information
5. **Show relationships** - Isolated components suggest missing connections
6. **Document evolution** - Show how things change over time
7. **Explain positioning** - Why this stage? Why this importance?

---

## Next Steps

1. **Copy this template** to create a new component note
2. **Fill in the metadata** with your strategic assessment
3. **Write the description** explaining the component's role
4. **Link to evidence** or create evidence notes
5. **Connect relationships** using depends_on/enables
6. **Open Wardley Map view** to see your component visualized
7. **Check Strategic Intelligence** to validate your data quality

---

*Remember: The value isn't in drawing pretty maps - it's in the thinking and evidence behind them. Use this template to capture that strategic reasoning.*

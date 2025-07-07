# Strategic Mapping Example Vault

This directory contains sample content demonstrating different organizational patterns for strategic mapping with the Breadcrumbs Wardley extension.

## Quick Start

1. **Copy to your vault**: Copy the contents of this `example-vault` directory to your Obsidian vault
2. **Install the plugin**: Build and install the Breadcrumbs Wardley extension  
3. **Open Wardley Map view**: Use Command Palette → "Breadcrumbs: Open Wardley Map view"
4. **Select a map**: Use the dropdown to switch between different strategic contexts

## Organizational Patterns Demonstrated

### 1. Folder-Based Strategic Maps (`Strategic-Maps/`)

**Best for**: Multiple strategic contexts in one vault

- `Product-Strategy/` - User-facing features and capabilities
- `Infrastructure-Strategy/` - Technical infrastructure and platform services

Each folder contains a `Map-Context.md` file that defines the strategic map scope and description.

### 2. Shared Components (`Shared-Components/`)

**Best for**: Components that belong to multiple strategic maps

These components use the `strategic_maps` field to declare membership in multiple maps:
```yaml
strategic_maps: ["Product-Strategy", "Infrastructure-Strategy"]
```

### 3. Simple Vault-Wide Map (`Simple-Vault-Example/`)

**Best for**: Single strategic context or getting started

All strategic components in the vault belong to one map. No special organization required.

## Component Examples by Evolution Stage

### Genesis (Innovation/Research)
- **Feature Discovery**: Early-stage capability still being defined
- **Reporting System**: New capability in prototype phase

### Custom (Competitive Advantage)  
- **User Dashboard**: Customized interface providing competitive differentiation
- **Customer Onboarding**: Tailored experience optimized for our users
- **Notification System**: Custom-built system (but showing issues)

### Product (Best Practice)
- **User Authentication**: Well-understood, standardized implementation
- **Analytics Engine**: Proven technology with established patterns
- **Data Pipeline**: Standard ETL/ELT processing system

### Commodity (Utility/Infrastructure)
- **Identity Provider**: External service (Auth0) providing standard functionality
- **Cloud Infrastructure**: AWS services as commodity infrastructure
- **Email Service**: SendGrid for standard email delivery

## Strategic Intelligence Examples

The sample data includes various scenarios that will trigger strategic intelligence warnings:

### Validation Warnings
- **Outdated validation**: Components not reviewed recently
- **Missing evidence**: Components without supporting documentation
- **Low confidence**: Components marked as uncertain or risky
- **Evolution inconsistency**: Mismatched component types and evolution stages

### Strategic Insights
- **Orphaned components**: Components with no strategic relationships
- **Critical path**: High-importance components with many dependencies  
- **Evolution gaps**: Missing intermediate evolution stages in dependency chains
- **Dependency risks**: Components depending on low-confidence or outdated components

## Usage Tips

1. **Start with Simple Example**: Copy the `Simple-Vault-Example/` files first to see basic functionality
2. **Add Strategic Maps**: Then explore the `Strategic-Maps/` folders for more complex scenarios
3. **Toggle Intelligence Panel**: Use the panels icon in the Wardley Map view to see strategic analysis
4. **Click Components**: Click on components in the map to open their notes
5. **Switch Contexts**: Use the dropdown to see how different strategic maps show different perspectives

## Customization

Feel free to modify this content to match your organization:

- Change component names and descriptions
- Add your own strategic metadata fields
- Adjust evolution stages based on your assessment
- Create new strategic map contexts
- Add evidence sources relevant to your organization

## Strategic Metadata Reference

```yaml
---
# Component classification
type: component | user_need | capability | product | service

# Evolution positioning  
evolution_stage: genesis | custom | product | commodity

# Business criticality
strategic_importance: critical | important | supporting | optional

# Data quality
confidence_level: high | medium | low
evidence_sources: ["source1", "source2"]
last_validated: "2025-01-15"

# Map membership (for shared components)
strategic_maps: ["Map1", "Map2"]

# Relationships (standard Breadcrumbs)
depends_on: [[Component A]]
enables: [[Component B]]
constrains: [[Component C]]
---
```

## Next Steps

1. Try the examples in your vault
2. Create your own strategic components
3. Experiment with different organizational patterns
4. Use the strategic intelligence to identify improvement opportunities
5. Iterate and refine your strategic maps over time
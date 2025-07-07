# Tea Shop Strategic Mapping Example

This vault demonstrates strategic mapping capabilities using [Simon Wardley's classic tea cup example](https://swardley.medium.com/a-good-enough-map-eaed8a525bf4).

## 🚀 Quick Start

1. **Open Wardley Map view**: Use Command Palette → "Open Wardley Map view"
2. **Select Tea-Shop map**: Should be automatically selected in the dropdown
3. **Explore the map**: See the interactive Wardley Map with positioned components
4. **Click components**: Click any component circle to open its note
5. **Toggle intelligence**: Click the analysis icon to see strategic insights

## 🍵 Tea Shop Example

The Tea Shop folder contains a complete strategic map showing:

### Value Chain (Bottom to Top)
- **Infrastructure**: Power, Water, Kettle
- **Capabilities**: Hot Water  
- **Products**: Cup, Tea, Cup of Tea
- **User Needs**: Business, Public/Regulatory

### Evolution Stages (Left to Right)
- **Custom**: Kettle (traditional, custom-built solution)
- **Product**: Electric Kettle, Power, Business (standardized products)
- **Commodity**: Cup, Tea, Hot Water, Water, Public (utility-like services)

### Evolution Relationship
- **Kettle → Electric Kettle**: Shows technological evolution with purple dotted arrow

## 📋 Strategic Metadata Examples

Each component includes strategic metadata:

```yaml
---
type: component
evolution_stage: product
strategic_importance: supporting  
confidence_level: high
evidence_sources:
  - "market_research"
  - "supplier_data"
last_validated: "2024-12-15"
depends_on:
  - "[[Power]]"
enables:
  - "[[Hot Water]]"
evolves_to:
  - "[[Electric Kettle]]"
---
```

## 🎯 What You'll See

### Interactive Map Features
- **Component positioning** based on evolution stage (X-axis) and value chain (Y-axis)
- **Relationship arrows**:
  - Blue lines: `depends_on` relationships
  - Green lines: `enables` relationships  
  - Purple dotted arrows: `evolves_to`/`evolved_from` with arrow heads
- **Component colors** indicating strategic importance
- **Click-to-open** functionality for each component

### Strategic Intelligence Panel
- **Component analysis**: Distribution across evolution stages
- **Relationship insights**: Dependency patterns and flows
- **Evolution tracking**: Components with evolution relationships
- **Validation status**: Last updated dates and confidence levels

## 🛠️ Customization

Feel free to modify this example:

### Add Your Own Components
```yaml
---
type: component
evolution_stage: custom
strategic_importance: critical
depends_on: ["[[Existing Component]]"]
---

# Your Component

Description of your strategic component...
```

### Create New Maps
1. Create a new folder (e.g., `Your-Strategy/`)
2. Add components with strategic metadata
3. The folder automatically becomes a map context
4. Use the dropdown to switch between maps

### Modify Evolution Stages
Change any component's `evolution_stage`:
- `genesis` - Novel, experimental, high uncertainty
- `custom` - Competitive advantage, custom-built
- `product` - Best practice, standardized products
- `commodity` - Utility services, stable and well-defined

## 📚 Strategic Metadata Reference

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `component`, `capability`, `service`, `user_need`, `product` | Component classification |
| `evolution_stage` | `genesis`, `custom`, `product`, `commodity` | Maturity/evolution level |
| `strategic_importance` | `critical`, `important`, `supporting` | Business criticality |
| `confidence_level` | `high`, `medium`, `low` | Assessment confidence |
| `depends_on` | List of `[[links]]` | Value chain dependencies |
| `enables` | List of `[[links]]` | What this component enables |
| `evolves_to` | List of `[[links]]` | Evolution progression |
| `evolved_from` | List of `[[links]]` | Evolution history |

## 🔍 Strategic Analysis

Use this example to:
- **Understand value chains**: See how user needs flow down to infrastructure
- **Track evolution**: Observe how Kettle evolves to Electric Kettle
- **Assess positioning**: Components distributed across evolution stages
- **Identify dependencies**: Critical paths and bottlenecks
- **Plan strategy**: Where to invest, what to outsource, evolution opportunities

## 📖 Learn More

- **Original Tea Cup Map**: [Simon Wardley's Article](https://swardley.medium.com/a-good-enough-map-eaed8a525bf4)
- **Wardley Mapping**: [Official Guide](https://wardleymaps.com/)
- **Plugin Features & Installation**: [Strategic Mapping Extension Documentation](../README.md)

---

**Ready to start strategic mapping? Explore the Tea Shop example and then create your own strategic landscape!** ☕ 🗺️
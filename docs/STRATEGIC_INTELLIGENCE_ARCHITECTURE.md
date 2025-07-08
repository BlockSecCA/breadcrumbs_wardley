# Strategic Intelligence Architecture

## Overview

The Strategic Intelligence system provides automated analysis and validation for Wardley Maps by examining strategic metadata in note frontmatter and generating actionable warnings and insights.

## Core Components

### 1. Strategic Metadata Parser (`strategic_metadata.ts`)

**Purpose**: Extracts strategic information from note frontmatter
**Key Functions**:
- `parse_strategic_metadata()`: Parses YAML frontmatter for strategic fields
- `get_strategic_field()`: Retrieves specific strategic attributes with fallback support

**Supported Fields**:
```typescript
- type: 'user_need' | 'capability' | 'component' | 'service' | 'product'
- evolution_stage: 'genesis' | 'custom' | 'product' | 'commodity'
- strategic_importance: 'critical' | 'important' | 'supporting'
- confidence_level: 'high' | 'medium' | 'low'
- evidence_sources: string[] // Obsidian note links in [[Note Name]] format
- last_validated: string // ISO date
- depends_on: string[] // Component dependencies
- enables: string[] // Components this enables
- evolved_from: string[] // Evolution relationships
```

**Field Recognition**: Supports multiple field name variants for backward compatibility:
- `strategic_evidence` and `evidence_sources`
- Flexible field mapping through `META_FIELD` constants

### 2. Strategic Analyzer (`strategic_analysis.ts`)

**Purpose**: Analyzes strategic metadata to generate warnings and insights

#### Validation Warnings

**Low Confidence**:
- Detects components with `confidence_level: 'low'`
- Severity: Medium
- Suggests increasing confidence through better evidence

**Missing Evidence**:
- Identifies components without evidence sources
- Validates that referenced evidence notes exist in vault
- Severity: Medium (no evidence) / Low (missing notes)
- Uses regex pattern `/\[\[([^\]]+)\]\]/` to extract note names

**Outdated Validation**:
- Flags components not validated in >6 months (medium severity)
- Flags components not validated in >12 months (high severity)
- Flags components with no validation date (low severity)

**Evolution Inconsistency**:
- Cross-references component type with evolution stage
- Built-in expectations:
  - `user_need`: typically in genesis/custom
  - `capability`: typically in custom/product
  - `component`/`service`: typically in product/commodity
- Severity: Low (advisory)

#### Strategic Insights

**Orphaned Components**:
- Finds components with no strategic relationships (no depends_on/enables)
- Uses graph edge analysis to identify isolated nodes
- Priority: Medium

**Critical Path**:
- Identifies components marked as `strategic_importance: 'critical'`
- Finds components with 3+ dependencies (high connectivity)
- Priority: High

**Evolution Gaps**:
- Analyzes dependency chains for evolution stage inconsistencies
- Flags dependencies from more evolved to less evolved components
- Uses evolution order: genesis → custom → product → commodity
- Priority: Medium

**Dependency Risks**:
- Identifies components depending on low-confidence dependencies
- Flags dependencies on components >12 months without validation
- Priority: High

### 3. Evidence Validation System

**Current Implementation**:
- Validates existence of evidence notes in Obsidian vault
- Supports both root-level and subfolder note locations
- Uses `app.vault.getMarkdownFiles()` for comprehensive search

**Architecture for Future AI Validation**:
```typescript
// Future enhancement structure
interface EvidenceValidation {
  note_name: string;
  exists: boolean;
  quality_score?: number;  // AI-generated
  relevance_score?: number; // AI-generated
  last_ai_validated?: string;
}
```

## Data Flow

```
1. Note Frontmatter (YAML)
   ↓
2. Strategic Metadata Parser
   ↓
3. Graph Integration (BCGraph)
   ↓
4. Strategic Analyzer
   ↓
5. Warnings & Insights
   ↓
6. Strategic Intelligence Panel (UI)
```

## Integration Points

### Graph System Integration
- Components stored as graph nodes with strategic attributes
- Relationships stored as graph edges (depends_on, enables, evolved_from)
- Uses existing Breadcrumbs graph infrastructure

### Settings Integration
- Strategic fields configurable in plugin settings
- Field mapping customizable for different use cases
- Validation criteria adjustable

### UI Integration
- Strategic Intelligence panel accessible from Wardley Map view
- Real-time updates when notes change
- Color-coded severity levels for warnings

## Performance Considerations

### Efficient Analysis
- Component filtering at graph level (only strategic components)
- Edge iteration with early returns for irrelevant relationships
- Cached metadata parsing results

### Memory Management
- Analysis runs on-demand, not continuous background processing
- Results not permanently stored, regenerated for each view
- Leverages Obsidian's existing metadata cache

## Error Handling

### Graceful Degradation
- Missing fields default to safe values
- Invalid dates handled with fallback logic
- Malformed evidence sources ignored rather than breaking analysis

### Validation Robustness
- Field type checking before analysis
- Safe array/object access patterns
- Error boundaries prevent analysis failures from breaking UI

## Extension Architecture

### Custom Validation Rules
The system is designed for easy extension:

```typescript
// Add custom warning types
interface CustomValidationWarning extends StrategicValidationWarning {
  custom_data?: any;
}

// Add custom insight types
private generateCustomInsights(components: Component[]): StrategicInsight[] {
  // Custom analysis logic
}
```

### Industry-Specific Adaptations
- Field mapping can be customized for different domains
- Validation rules can be industry-specific
- Evidence requirements can vary by component type

## Future Enhancements

### AI Evidence Validation
- Semantic analysis of evidence note content
- Relevance scoring for evidence quality
- Automated evidence gap detection

### Advanced Analytics
- Trend analysis over time
- Comparative analysis across maps
- Predictive insights based on patterns

### Integration Expansion
- Export to strategic planning tools
- Integration with project management systems
- Automated reporting capabilities

## Security Considerations

### Data Privacy
- All analysis happens locally within Obsidian
- No external API calls for core functionality
- Evidence notes remain private to user's vault

### Input Validation
- YAML frontmatter parsing with safety checks
- Evidence source validation prevents path traversal
- Field value sanitization for UI display

---

This architecture enables sophisticated strategic analysis while maintaining simplicity and extensibility for future enhancements.
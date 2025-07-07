# Breadcrumbs V4 Strategic Mapping Extension Specification

## Project Overview

Extend the forked Breadcrumbs V4 Obsidian plugin to support Wardley Mapping methodology. Transform the existing typed relationship system into a strategic intelligence platform that can visualize strategic positioning and provide strategic analysis.

## Current State Analysis

### What Breadcrumbs V4 Already Provides
- ✅ **Typed Link Infrastructure**: Complete system for parsing relationships from YAML frontmatter
- ✅ **Graph Data Structure**: Internal graph with typed edges and nodes
- ✅ **View System**: Extensible architecture with Matrix, Tree, Path, Grid views
- ✅ **YAML Processing**: Reads and processes note frontmatter metadata
- ✅ **Obsidian Integration**: Plugin lifecycle, settings, commands, file watching
- ✅ **Multiple Graph Builders**: Various ways to define relationships (frontmatter, dataview, etc.)

### Strategic Enhancement Goals
- Add Wardley Map visualization as new view type
- Extend YAML schema for strategic attributes
- Implement strategic analysis and intelligence features
- Prepare architecture for future AI advisory integration

## Core Development Tasks

### 1. Strategic YAML Schema Extension

**Objective**: Extend existing YAML frontmatter processing to support strategic attributes.

**Current Breadcrumbs YAML**:
```yaml
up: [[Parent Note]]
down: [[Child Note]]
```

**Target Strategic YAML**:
```yaml
# Existing Breadcrumbs relationships (keep unchanged)
depends_on: [[AWS]]
enables: [[User Login]]
competes_with: [[Auth0]]

# New strategic attributes
type: component | user_need | capability | product | service
evolution_stage: genesis | custom | product | commodity
strategic_importance: critical | important | supporting | optional
confidence_level: high | medium | low
evidence_sources: ["market_research_2024", "user_interviews"]
last_validated: "2025-01-15"
```

**Implementation Tasks**:
- Locate existing YAML processing code in V4
- Add strategic field validation to existing schema system
- Create TypeScript interfaces for strategic metadata
- Extend note parsing to capture strategic attributes
- Add validation warnings for invalid strategic values

### 2. Wardley Map View Implementation

**Objective**: Create new view type that positions components using Wardley Map methodology.

**Positioning Logic**:
- **X-axis (Evolution)**: Use `evolution_stage` YAML attribute
  - genesis → leftmost position
  - custom → left-center position
  - product → right-center position 
  - commodity → rightmost position
- **Y-axis (Value Chain)**: Use typed relationships (depends_on, enables)
  - Apply topological sorting to dependency graph
  - Components with dependencies positioned above their dependencies
  - User needs at top, foundational components at bottom

**Implementation Tasks**:
- Study existing view implementations (Matrix, Tree, Path views)
- Create new WardleyMapView class following V4 view patterns
- Implement positioning algorithm using graph data + strategic YAML
- Design visual rendering (nodes, edges, axes, labels)
- Add interactive features (hover, click, zoom, pan)
- Integrate with existing view registration system

**Technical Considerations**:
- Use same graph data structure as other V4 views
- Follow V4 patterns for view lifecycle and updates
- Ensure view updates when notes change (leverage existing file watching)
- Handle positioning edge cases (cycles, missing data, etc.)

### 3. Strategic Intelligence Panel

**Objective**: Add analysis panel that provides strategic insights and validation warnings.

**Features**:
- **Validation Warnings**: Components with low confidence, missing evidence, outdated validation dates
- **Strategic Insights**: Orphaned components, evolution inconsistencies, critical path analysis
- **Quick Actions**: Links to update evidence, validate components, review dependencies

**Implementation Tasks**:
- Study existing V4 panel/view architecture
- Create strategic analysis algorithms using graph data + YAML attributes
- Design panel UI following Obsidian/V4 design patterns
- Implement real-time updates when strategic data changes
- Add commands for strategic actions (validate, update evidence, etc.)

### 4. Enhanced Search and Filtering

**Objective**: Extend existing search to understand strategic attributes and relationships.

**Strategic Search Syntax**:
- `evolution:commodity` - Find components at commodity stage
- `confidence:low` - Find components needing validation
- `type:capability` - Filter by component type
- `depends_on:AWS` - Find components depending on AWS
- Complex queries: `type:capability AND evolution:genesis`

**Implementation Tasks**:
- Locate existing search implementation in V4
- Extend search parser to understand strategic syntax
- Add strategic attribute indexing to existing search index
- Implement boolean operators for complex queries
- Add auto-completion for strategic search terms

### 5. Settings and Configuration

**Objective**: Add strategic mapping configuration to existing V4 settings system.

**New Settings**:
```json
{
  "strategic.enableWardleyView": true,
  "strategic.defaultEvolutionStage": "custom",
  "strategic.showConfidenceIndicators": true,
  "strategic.relationshipTypes": ["depends_on", "enables", "constrains"],
  "strategic.mapDimensions": {
    "width": 800,
    "height": 600,
    "nodeSize": 10
  }
}
```

**Implementation Tasks**:
- Study V4 settings architecture
- Add strategic settings to existing settings tab
- Implement settings validation and defaults
- Connect settings to strategic features (view styling, behavior, etc.)

### 6. Commands and User Interface

**Objective**: Add strategic mapping commands to existing V4 command system.

**New Commands**:
- "Breadcrumbs: Open Strategic Map View"
- "Breadcrumbs: Strategic Analysis Panel"
- "Breadcrumbs: Validate Strategic Component"
- "Breadcrumbs: Export Strategic Map"

**Implementation Tasks**:
- Study existing V4 command registration
- Add strategic commands following V4 patterns
- Create keyboard shortcuts and menu integrations
- Ensure commands work with existing V4 workspace management

## Strategic Map Organization and Scoping

### Organizational Patterns Supported

The extension must support multiple organizational approaches to accommodate different user workflows and strategic contexts.

#### Pattern 1: Vault Per Map (Simple, Isolated)
```
Strategic-Product-Roadmap/           # One vault = One strategic map
├── .obsidian/
├── Agent.md                        # Strategic context instructions
├── User Authentication.md
├── Payment Processing.md
└── AWS Infrastructure.md
```

**Implementation**: 
- All notes in vault belong to the strategic map
- Wardley view shows entire vault contents
- Simple scoping - no filtering needed

#### Pattern 2: Folder Per Map (Multi-Context)
```
Strategic-Company/                   # One vault, multiple strategic maps
├── Agent.md                        # Global strategic instructions
├── Product-Roadmap/
│   ├── Map-Context.md              # Map-specific context
│   ├── User Authentication.md
│   └── Payment Processing.md
├── Infrastructure-Strategy/
│   ├── Map-Context.md
│   └── AWS Services.md
└── Shared-Components/
    └── AWS.md                      # Cross-map components
```

**Implementation**:
- Folder-based scoping with Map-Context.md files
- Wardley view has map selector dropdown
- Components can be shared across maps via references

#### Pattern 3: Component Membership (Tag-Based)
```yaml
# In any component note
strategic_maps: ["Product-Roadmap", "Security-Strategy"]
evolution_stage: product
type: capability
```

**Implementation**:
- Components declare map membership in YAML frontmatter
- Wardley view filters by selected map context
- Maximum flexibility for component reuse

### Technical Implementation Requirements

#### Map Context Detection
```typescript
interface MapContext {
  id: string;
  name: string;
  scope: 'vault' | 'folder' | 'membership';
  description?: string;
  includes?: string[];  // For folder or membership scoping
}

class MapContextManager {
  detectMapContexts(): MapContext[]
  getCurrentMapContext(): MapContext
  getComponentsForMap(mapId: string): ComponentNode[]
}
```

#### Component Membership System
- **Vault Scoping**: All components in vault belong to single map
- **Folder Scoping**: Components inherit map from folder structure
- **Membership Scoping**: Components declare `strategic_maps: []` in YAML
- **Hybrid**: Support multiple methods simultaneously

#### View Filtering and Selection
```typescript
class WardleyMapView {
  // Map selection UI
  renderMapSelector(): void
  setActiveMap(mapId: string): void
  
  // Filtered rendering
  getFilteredComponents(): ComponentNode[]
  updateViewForMap(mapContext: MapContext): void
}
```

### User Experience Flow

#### Multi-Map Navigation
1. **Map Discovery**: Automatically detect available strategic maps
2. **Map Selection**: Dropdown or sidebar for switching contexts
3. **Component Filtering**: Show only relevant components for selected map
4. **Cross-Map References**: Handle shared components appropriately

#### Settings Configuration
```json
{
  "strategic.organizationPattern": "auto" | "vault" | "folder" | "membership",
  "strategic.defaultMapContext": "auto-detect",
  "strategic.showCrossMapReferences": true,
  "strategic.mapSelectorLocation": "toolbar" | "sidebar"
}
```

### AI Context Management

Since AI integration will use existing Obsidian AI plugins with flexible context selection:

#### Context Scoping Strategies
- **Vault-Wide**: AI reads entire vault (single strategic context)
- **Folder-Based**: AI reads specific folder + Agent.md + shared components
- **Map-Filtered**: AI reads only components belonging to selected strategic map
- **Agent.md Instructions**: Context files guide AI behavior for different scopes

#### Agent.md Context Files
```markdown
# Agent.md (Global)
This vault contains strategic mapping analysis for [Company/Domain].
Use Wardley mapping principles to analyze component positioning and relationships.

# Product-Roadmap/Map-Context.md (Specific)
This map focuses on user-facing product capabilities.
Priority: User experience and product-market fit.
Time horizon: 12-18 months.
```

#### Future AI Integration Points
- **Map-Aware Conversations**: AI understands current map context
- **Cross-Map Analysis**: AI can compare positioning across strategic contexts
- **Context Switching**: AI maintains conversation continuity across map changes

## Development Approach

### Phase 1: Foundation (Week 1)
1. **Codebase Analysis**: Study V4 architecture, identify extension points
2. **Strategic YAML**: Extend existing YAML processing for strategic attributes
3. **Map Context System**: Implement basic map detection and scoping
4. **Basic Validation**: Add schema validation for strategic fields

### Phase 2: Core Visualization (Week 2-3)
1. **Wardley View Skeleton**: Create basic view structure following V4 patterns
2. **Map Selection UI**: Add map selector and filtering capabilities
3. **Positioning Algorithm**: Implement strategic positioning logic with map scoping
4. **Basic Rendering**: Node/edge visualization with map context awareness
5. **Integration**: Connect to existing V4 view system

### Phase 3: Intelligence and Multi-Map Support (Week 4)
1. **Strategic Analysis**: Implement intelligence panel with map-aware insights
2. **Cross-Map Features**: Handle shared components and references
3. **Enhanced Search**: Add strategic search with map filtering
4. **Settings Integration**: Connect to V4 settings system with map options
5. **Testing and Refinement**: Ensure integration across organizational patterns

## Technical Architecture Guidelines

### Code Organization
- Follow existing V4 file structure and naming conventions
- Create strategic features in dedicated modules/folders
- Maintain separation between core V4 functionality and strategic extensions
- Use existing V4 TypeScript interfaces and extend where needed

### Integration Points
- **Graph System**: Use existing graph data structure, extend with strategic metadata
- **View System**: Follow existing view registration and lifecycle patterns  
- **Settings**: Extend existing settings architecture
- **Commands**: Use existing command registration system
- **File Watching**: Leverage existing note change detection

### Data Flow
1. Notes with strategic YAML frontmatter
2. Existing V4 parsing → enhanced with strategic attribute extraction
3. Graph data structure → enhanced with strategic metadata
4. Multiple views → existing V4 views + new Wardley Map view
5. Analysis engine → new strategic intelligence using enhanced graph data

## Success Criteria

1. **Functional Integration**: Strategic features work seamlessly with existing V4 functionality
2. **Wardley Visualization**: Clear, accurate strategic map positioning
3. **Strategic Intelligence**: Useful insights and validation warnings
4. **User Experience**: Intuitive interface following V4/Obsidian patterns
5. **Performance**: No degradation of existing V4 features
6. **Extensibility**: Architecture supports future AI advisory integration

## Risk Mitigation

1. **V4 Compatibility**: Ensure changes don't break existing V4 functionality
2. **Performance**: Strategic analysis must not slow down basic operations
3. **Data Integrity**: Strategic metadata preserved during note operations
4. **User Experience**: Strategic features feel native to V4, not bolted-on
5. **Future-Proofing**: Architecture supports upcoming AI conversational interface

## Future AI Integration Preparation

While not part of initial implementation, ensure architecture supports:
- **Data Export APIs**: Structured access to strategic graph data
- **Conversational Hooks**: Events and APIs for AI system integration
- **Real-time Updates**: Strategic data changes accessible to external systems
- **Query Interface**: Programmatic access to strategic analysis results

## Deliverables

1. **Extended Plugin**: Breadcrumbs V4 + Strategic Mapping features
2. **Wardley Map View**: New visualization type in V4 view system
3. **Strategic Intelligence**: Analysis panel with insights and warnings
4. **Enhanced Search**: Strategic attribute and relationship queries
5. **Documentation**: Usage guide for strategic mapping features
6. **Test Suite**: Validation of strategic features and V4 integration
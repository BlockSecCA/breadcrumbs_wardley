# Wardley Map Positioning Algorithm Documentation

## Overview

The Wardley Map positioning algorithm transforms strategic components with relationship metadata into properly positioned visual elements on a 2D map. The algorithm respects both **evolution stages** (X-axis) and **value chain dependencies** (Y-axis) while handling collisions and special relationships.

## Core Principles

### 1. **Value Chain is Primary** (Y-axis)
The Y-axis represents the value chain from user-visible needs (top) to infrastructure (bottom). This positioning is **strictly enforced** and based on dependency relationships:
- Components that `depends_on` others are positioned higher (closer to users)
- Components that `enables` others are positioned lower (closer to infrastructure)

### 2. **Evolution Stage Positioning** (X-axis) 
Components are positioned horizontally based on their evolution stage:
- **Genesis** (left): Novel, experimental, high uncertainty
- **Custom**: Competitive advantage, custom-built solutions
- **Product**: Best practices, standardized products  
- **Commodity** (right): Utility services, stable and well-defined

### 3. **Evolution Relationships**
Components connected by `evolves_to`/`evolved_from` should maintain the same Y-position when possible, as they represent the same capability at different evolution stages.

## Algorithm Structure

### File: `src/components/wardley/WardleyPositioner.ts`

The algorithm consists of 4 main phases:

```typescript
position(components: ComponentNode[], edges: ComponentEdge[]): ComponentNode[] {
    // 1. X-axis positioning by evolution stage
    const positioned = this.positionByEvolution(components);
    
    // 2. Y-axis positioning by value chain dependencies  
    return this.positionByValueChain(positioned, edges);
}
```

## Phase 1: Evolution Stage Positioning (X-axis)

**Method**: `positionByEvolution()`

Maps evolution stages to X coordinates:
```typescript
const stageMap = {
    genesis: 0,
    custom: CONTENT_WIDTH * 0.33,
    product: CONTENT_WIDTH * 0.66, 
    commodity: CONTENT_WIDTH,
};
```

**Key Design Decision**: Linear distribution across available width with fixed ratios.

## Phase 2: Value Chain Positioning (Y-axis)

**Method**: `positionByValueChain()`

This is the most complex phase with 4 sub-steps:

### 2.1 Dependency Graph Construction

**Method**: `buildDependencyGraph()`

Creates a directed graph representing value chain relationships:

```typescript
// depends_on: source depends on target
// target enables source (reverse relationship)
if (edge.type === 'depends_on') {
    graph.get(edge.target).add(edge.source);
} else if (edge.type === 'enables') {
    graph.get(edge.source).add(edge.target);
}
```

**Evolution Inheritance**: Evolved components inherit the same dependencies as their predecessors:
```typescript
evolutionPairs.forEach(pair => {
    // Copy all dependencies from Kettle to Electric Kettle
    sourceGraph.forEach(dependent => targetGraph.add(dependent));
});
```

### 2.2 Topological Sorting

**Method**: `topologicalSort()`

Performs depth-first search to determine dependency layers:
- **Layer 0**: Components with no dependencies (user needs)
- **Layer N**: Components that depend on Layer N-1
- **Output**: Array of arrays, each representing a horizontal layer

**Algorithm**: 
1. Visit each unvisited node
2. Recursively visit all dependents  
3. Assign node to layer based on maximum dependent depth + 1
4. Handle cycles gracefully by assigning to current layer

### 2.3 Layer-based Y Positioning

Maps topological layers to Y coordinates:
```typescript
const y = layers.length <= 1 
    ? MARGIN + (CONTENT_HEIGHT / 2)  // Center single layer
    : MARGIN + (layerIndex * (CONTENT_HEIGHT / (layers.length - 1)));
```

### 2.4 Collision Resolution

**Method**: `resolveCollisions()`

Handles overlapping components within the same evolution stage and layer:
```typescript
const COLLISION_THRESHOLD = 30; // Minimum distance
const VERTICAL_OFFSET = 35;     // Displacement amount

// If components are too close, move second one down
if (xDiff < component_spacing && yDiff < COLLISION_THRESHOLD) {
    comp2.y += VERTICAL_OFFSET;
}
```

**Key Constraint**: Only moves components vertically by small amounts to avoid breaking value chain integrity.

## Configuration Settings

### Visual Settings Interface
```typescript
interface WardleyMapVisualSettings {
    font_size: number;           // 8-20px
    node_size: number;           // 6-24px radius  
    component_spacing: number;   // 40-150px horizontal spacing
    edge_thickness: number;      // 1-5px line width
    grid_color: string;          // CSS color for evolution grid
    grid_opacity: number;        // 0.1-1.0 transparency
    show_evolution_grid: boolean;
    show_axis_labels: boolean;
}
```

### Default Values
```typescript
// From src/const/settings.ts
wardley: {
    font_size: 11,
    node_size: 12, 
    component_spacing: 80,
    edge_thickness: 2,
    grid_color: "var(--text-muted)",
    grid_opacity: 0.5,
    // ...
}
```

## Relationship Types and Mapping

### Strategic Relationships
- **`depends_on`**: Value chain dependency (A needs B to function)
- **`enables`**: Reverse dependency (A makes B possible)
- **`evolves_to`**: Technological evolution (A becomes B over time)
- **`evolved_from`**: Reverse evolution (B came from A)

### Breadcrumbs Relationships  
- **`up`**: Mapped to `depends_on`
- **`down`**: Mapped to `enables` 
- **`same`**: Mapped to `evolves_to`/`evolved_from` (processed but no visual edge)

## Known Limitations and Trade-offs

### 1. **Evolution vs Dependencies**
When evolution components have conflicting dependencies, value chain takes precedence. Evolution alignment is disabled to preserve dependency accuracy.

### 2. **Collision Resolution**
Current approach uses simple vertical displacement. Could be improved with:
- Radial distribution around original position
- Smart grouping of related components
- Dynamic spacing based on component importance

### 3. **Layer Calculation**
Topological sort can create many thin layers. Could be optimized with:
- Layer consolidation for similar components
- Strategic importance-based layer adjustments
- Manual layer overrides for specific components

## Future Enhancement Ideas

### 1. **Improved Collision Detection**
```typescript
// Potential enhancement: cluster-based positioning
private distributeCluster(components: ComponentNode[], basePos: {x: number, y: number}) {
    // Use force-directed layout within constraints
    // Respect strategic importance for positioning priority
    // Maintain minimum distances based on relationship strength
}
```

### 2. **Strategic Importance Integration**
```typescript
// Use strategic importance for positioning priority
const layerOffset = (strategic_importance === 'critical') ? -10 : 0;
comp.y = baseY + layerOffset;
```

### 3. **Dynamic Evolution Alignment**
```typescript
// Only align evolution pairs if no dependency conflicts
const hasConflict = this.checkDependencyConflict(evolutionPair, layers);
if (!hasConflict) {
    alignEvolutionComponents(source, target);
}
```

### 4. **Component Clustering**
Group related components visually while maintaining value chain positioning:
```typescript
// Group components by domain/capability
const clusters = this.identifyComponentClusters(components, edges);
clusters.forEach(cluster => this.positionCluster(cluster));
```

## Debugging and Monitoring

### Debug Output
The algorithm includes console logging for dependency layers:
```
WardleyPositioner: Dependency layers: 
Layer 0: Public, Business
Layer 1: Cup of Tea
Layer 2: Hot Water, Tea, Cup  
Layer 3: Water, Kettle, Electric Kettle
Layer 4: Power
```

### Performance Monitoring
- **Time Complexity**: O(V + E) for topological sort
- **Space Complexity**: O(V) for dependency graph
- **Typical Performance**: <10ms for 50 components

## Testing Strategy

### Test Cases
1. **Simple Value Chain**: Linear dependencies A→B→C→D
2. **Evolution Pairs**: Components with `evolves_to` relationships
3. **Multiple Layers**: Complex dependency networks
4. **Collision Scenarios**: Multiple components in same evolution stage
5. **Circular Dependencies**: Graceful handling of cycles

### Validation Checks
1. No component overlaps (except minor collision adjustments)
2. Value chain ordering preserved (dependencies flow top-to-bottom)
3. Evolution stages correctly mapped to X-axis
4. All components within canvas bounds

## Modification Guidelines

### When Changing Layer Logic
1. Update `buildDependencyGraph()` for new relationship types
2. Ensure `topologicalSort()` handles edge cases
3. Test with complex dependency networks
4. Verify evolution inheritance still works

### When Changing Collision Detection
1. Maintain value chain integrity (minimal Y-axis movement)
2. Consider strategic importance for positioning priority
3. Test with large component counts
4. Ensure visual clarity is improved

### When Adding New Relationship Types
1. Add to `ComponentEdge` type in `WardleyMapRenderer.ts`
2. Update `mapFieldToEdgeType()` method
3. Add handling in `buildDependencyGraph()`
4. Consider visual representation needs

---

**Last Updated**: January 2025  
**Algorithm Version**: v1.0 (Post-collision detection improvements)  
**Key Contributors**: Strategic mapping positioning algorithm development
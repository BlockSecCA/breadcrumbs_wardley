import type { BCGraph } from "src/graph/MyMultiGraph";
import type { ComponentNode, ComponentEdge } from "./WardleyMapRenderer";
import type { EvolutionStage, WardleyMapVisualSettings } from "src/interfaces/strategic";

export class WardleyPositioner {
	private graph: BCGraph;
	private settings: WardleyMapVisualSettings;
	
	// Canvas dimensions (matching SVG viewBox)
	private readonly CANVAS_WIDTH = 800;
	private readonly CANVAS_HEIGHT = 600;
	private readonly MARGIN = 80;
	private readonly CONTENT_WIDTH = this.CANVAS_WIDTH - (this.MARGIN * 2);
	private readonly CONTENT_HEIGHT = this.CANVAS_HEIGHT - (this.MARGIN * 2);

	constructor(graph: BCGraph, settings: WardleyMapVisualSettings) {
		this.graph = graph;
		this.settings = settings;
	}

	position(components: ComponentNode[], edges: ComponentEdge[]): ComponentNode[] {
		// Step 1: Position components on X-axis based on evolution stage
		const positioned = this.positionByEvolution(components);
		
		// Step 2: Position components on Y-axis based on value chain (dependency order)
		return this.positionByValueChain(positioned, edges);
	}

	private positionByEvolution(components: ComponentNode[]): ComponentNode[] {
		return components.map(component => {
			const evolution_stage = component.attrs.strategic?.evolution_stage || 'custom';
			const x = this.getEvolutionX(evolution_stage);
			
			return {
				...component,
				x: this.MARGIN + x,
				y: component.y, // Will be set by value chain positioning
			};
		});
	}

	private getEvolutionX(stage: EvolutionStage): number {
		const stageMap = {
			genesis: 0,
			custom: this.CONTENT_WIDTH * 0.33,
			product: this.CONTENT_WIDTH * 0.66,
			commodity: this.CONTENT_WIDTH,
		};

		return stageMap[stage] || stageMap.custom;
	}

	private positionByValueChain(components: ComponentNode[], edges: ComponentEdge[]): ComponentNode[] {
		// Create dependency graph for topological sorting
		const dependencyGraph = this.buildDependencyGraph(components, edges);
		
		// Handle evolution relationships first (they should maintain same Y position)
		const evolutionPairs = this.findEvolutionPairs(edges);
		
		// Perform topological sort to determine layers
		const layers = this.topologicalSort(dependencyGraph);
		
		// Debug logging
		console.log('WardleyPositioner: Dependency layers:', layers.map((layer, i) => 
			`Layer ${i}: ${layer.map(id => id.split('/').pop()?.replace('.md', '')).join(', ')}`
		).join('\n'));
		
		// Position components in layers from top (user-visible) to bottom (infrastructure)
		const positioned = [...components];
		
		// First pass: Set Y positions based on value chain layers
		layers.forEach((layer, layerIndex) => {
			const y = layers.length <= 1 
				? this.MARGIN + (this.CONTENT_HEIGHT / 2)  // Center single layer
				: this.MARGIN + (layerIndex * (this.CONTENT_HEIGHT / (layers.length - 1)));
			
			// Set base Y position for all components in this layer
			layer.forEach(id => {
				const comp = positioned.find(c => c.id === id);
				if (comp) {
					comp.y = y;
				}
			});
		});
		
		// Second pass: Ensure evolution pairs have same Y position (disabled for now)
		// TODO: Re-enable after fixing value chain positioning
		/* 
		evolutionPairs.forEach(pair => {
			const sourceComp = positioned.find(c => c.id === pair.source);
			const targetComp = positioned.find(c => c.id === pair.target);
			if (sourceComp && targetComp) {
				// Check if evolution components have dependencies that conflict
				const hasConflictingDependencies = this.checkEvolutionConflict(pair, edges, layers);
				
				if (!hasConflictingDependencies) {
					// Safe to align - use the lower position (closer to infrastructure) for both
					const sharedY = Math.max(sourceComp.y, targetComp.y);
					sourceComp.y = sharedY;
					targetComp.y = sharedY;
				}
			}
		});
		*/
		
		// Third pass: Handle collisions within same layer and evolution stage
		this.resolveCollisions(positioned);

		return positioned;
	}

	private distributeComponentsInGroup(group: ComponentNode[], baseX: number, baseY: number): void {
		const MIN_SPACING = this.settings.component_spacing; // Configurable horizontal spacing
		const VERTICAL_SPACING = 40; // Vertical spacing between overlapping components
		const MAX_SPREAD = this.CONTENT_WIDTH * 0.2; // Increased maximum horizontal spread
		
		if (group.length === 1) {
			group[0].x = baseX;
			group[0].y = baseY;
			return;
		}
		
		// Sort components by name for consistent positioning
		group.sort((a, b) => a.name.localeCompare(b.name));
		
		// Use a spiral/grid pattern for better distribution
		if (group.length <= 3) {
			// For small groups, use horizontal distribution
			const totalSpacing = (group.length - 1) * MIN_SPACING;
			const spread = Math.min(MAX_SPREAD, totalSpacing);
			
			group.forEach((comp, index) => {
				const progress = group.length > 1 ? index / (group.length - 1) : 0;
				const horizontalOffset = (progress - 0.5) * spread;
				
				comp.x = Math.max(this.MARGIN, Math.min(this.CANVAS_WIDTH - this.MARGIN, baseX + horizontalOffset));
				comp.y = baseY;
			});
		} else {
			// For larger groups, use a 2D grid pattern
			const cols = Math.ceil(Math.sqrt(group.length));
			const rows = Math.ceil(group.length / cols);
			
			group.forEach((comp, index) => {
				const col = index % cols;
				const row = Math.floor(index / cols);
				
				const horizontalOffset = (col - (cols - 1) / 2) * (MIN_SPACING * 0.8);
				const verticalOffset = (row - (rows - 1) / 2) * VERTICAL_SPACING;
				
				comp.x = Math.max(this.MARGIN, Math.min(this.CANVAS_WIDTH - this.MARGIN, baseX + horizontalOffset));
				comp.y = baseY + verticalOffset;
			});
		}
	}

	private findEvolutionPairs(edges: ComponentEdge[]): {source: string, target: string}[] {
		const pairs: {source: string, target: string}[] = [];
		
		edges.forEach(edge => {
			if (edge.type === 'evolves_to') {
				pairs.push({source: edge.source, target: edge.target});
			}
		});
		
		return pairs;
	}

	private checkEvolutionConflict(
		pair: {source: string, target: string}, 
		edges: ComponentEdge[], 
		layers: string[][]
	): boolean {
		// Find which layers the evolution pair components are in
		let sourceLayer = -1;
		let targetLayer = -1;
		
		layers.forEach((layer, index) => {
			if (layer.includes(pair.source)) sourceLayer = index;
			if (layer.includes(pair.target)) targetLayer = index;
		});
		
		// If they're more than 1 layer apart, there's likely a dependency conflict
		return Math.abs(sourceLayer - targetLayer) > 1;
	}

	private resolveCollisions(components: ComponentNode[]): void {
		const COLLISION_THRESHOLD = 30; // Minimum distance between components
		const VERTICAL_OFFSET = 35; // How much to move overlapping components
		
		// Group components by approximate position (Y within threshold and same X band)
		for (let i = 0; i < components.length; i++) {
			for (let j = i + 1; j < components.length; j++) {
				const comp1 = components[i];
				const comp2 = components[j];
				
				// Check if they're in collision (close X and Y positions)
				const xDiff = Math.abs(comp1.x - comp2.x);
				const yDiff = Math.abs(comp1.y - comp2.y);
				
				if (xDiff < this.settings.component_spacing && yDiff < COLLISION_THRESHOLD) {
					// Collision detected - move the second component slightly down
					comp2.y += VERTICAL_OFFSET;
					
					// Ensure it stays within bounds
					comp2.y = Math.min(comp2.y, this.CANVAS_HEIGHT - this.MARGIN);
				}
			}
		}
	}

	private buildDependencyGraph(components: ComponentNode[], edges: ComponentEdge[]): Map<string, Set<string>> {
		const graph = new Map<string, Set<string>>();
		
		// Initialize all components
		components.forEach(comp => {
			graph.set(comp.id, new Set<string>());
		});

		// Add dependencies (reverse direction for value chain - things higher up depend on things lower)
		edges.forEach(edge => {
			if (edge.type === 'depends_on') {
				// Source depends on target, so target should be positioned lower (higher Y)
				// Add source as dependent of target
				const dependents = graph.get(edge.target);
				if (dependents) {
					dependents.add(edge.source);
				}
			} else if (edge.type === 'enables') {
				// Source enables target, so source should be positioned lower (higher Y)
				// Add target as dependent of source
				const dependents = graph.get(edge.source);
				if (dependents) {
					dependents.add(edge.target);
				}
			}
		});

		// Handle evolution relationships: evolved components inherit same dependencies
		const evolutionPairs = this.findEvolutionPairs(edges);
		evolutionPairs.forEach(pair => {
			const sourceGraph = graph.get(pair.source);
			const targetGraph = graph.get(pair.target);
			
			if (sourceGraph && targetGraph) {
				// Copy dependencies from source to target (evolved component)
				sourceGraph.forEach(dependent => targetGraph.add(dependent));
				
				// Also copy dependencies TO the evolved component
				graph.forEach((dependents, nodeId) => {
					if (dependents.has(pair.source)) {
						dependents.add(pair.target);
					}
				});
			}
		});

		return graph;
	}

	private topologicalSort(dependencyGraph: Map<string, Set<string>>): string[][] {
		const visited = new Set<string>();
		const visiting = new Set<string>();
		const layers: string[][] = [];
		const nodeLayer = new Map<string, number>();

		const visit = (nodeId: string): number => {
			if (visiting.has(nodeId)) {
				// Cycle detected - assign to current layer
				return 0;
			}
			if (visited.has(nodeId)) {
				return nodeLayer.get(nodeId) || 0;
			}

			visiting.add(nodeId);

			let maxDepth = 0;
			const dependents = dependencyGraph.get(nodeId) || new Set();
			
			for (const dependent of dependents) {
				const depth = visit(dependent);
				maxDepth = Math.max(maxDepth, depth + 1);
			}

			visiting.delete(nodeId);
			visited.add(nodeId);
			
			nodeLayer.set(nodeId, maxDepth);
			
			// Ensure layers array is big enough
			while (layers.length <= maxDepth) {
				layers.push([]);
			}
			layers[maxDepth].push(nodeId);

			return maxDepth;
		};

		// Visit all nodes to build layers
		for (const nodeId of dependencyGraph.keys()) {
			if (!visited.has(nodeId)) {
				visit(nodeId);
			}
		}

		// Handle components with no dependencies or dependents
		for (const nodeId of dependencyGraph.keys()) {
			if (!visited.has(nodeId)) {
				if (layers.length === 0) {
					layers.push([]);
				}
				layers[0].push(nodeId);
			}
		}

		// Ensure we have at least one layer
		if (layers.length === 0) {
			layers.push([...dependencyGraph.keys()]);
		}

		// Remove empty layers
		const filteredLayers = layers.filter(layer => layer.length > 0);
		
		// Ensure we still have at least one layer
		if (filteredLayers.length === 0) {
			filteredLayers.push([...dependencyGraph.keys()]);
		}

		return filteredLayers;
	}
}
import type { BCGraph } from "src/graph/MyMultiGraph";
import type { ComponentNode, ComponentEdge } from "./WardleyMapRenderer";
import type { EvolutionStage } from "src/interfaces/strategic";

export class WardleyPositioner {
	private graph: BCGraph;
	
	// Canvas dimensions (matching SVG viewBox)
	private readonly CANVAS_WIDTH = 800;
	private readonly CANVAS_HEIGHT = 600;
	private readonly MARGIN = 80;
	private readonly CONTENT_WIDTH = this.CANVAS_WIDTH - (this.MARGIN * 2);
	private readonly CONTENT_HEIGHT = this.CANVAS_HEIGHT - (this.MARGIN * 2);

	constructor(graph: BCGraph) {
		this.graph = graph;
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
		
		// Perform topological sort to determine layers
		const layers = this.topologicalSort(dependencyGraph);
		
		// Position components in layers from top (user-visible) to bottom (infrastructure)
		const positioned = [...components];
		
		layers.forEach((layer, layerIndex) => {
			const y = layers.length <= 1 
				? this.MARGIN + (this.CONTENT_HEIGHT / 2)  // Center single layer
				: this.MARGIN + (layerIndex * (this.CONTENT_HEIGHT / (layers.length - 1)));
			
			// Distribute components within layer horizontally if they have same evolution stage
			const layerComponents = layer.map(id => positioned.find(c => c.id === id)!).filter(Boolean);
			
			// Group by X position (evolution stage)
			const xGroups = new Map<number, ComponentNode[]>();
			layerComponents.forEach(comp => {
				const x = comp.x;
				if (!xGroups.has(x)) {
					xGroups.set(x, []);
				}
				xGroups.get(x)!.push(comp);
			});

			// Distribute components within each X group
			xGroups.forEach((group, baseX) => {
				if (group.length === 1) {
					group[0].y = y;
				} else {
					// Spread components around the evolution stage position
					const spread = Math.min(50, this.CONTENT_WIDTH * 0.1);
					group.forEach((comp, index) => {
						const offset = (index - (group.length - 1) / 2) * (spread / Math.max(1, group.length - 1));
						comp.x = Math.max(this.MARGIN, Math.min(this.CANVAS_WIDTH - this.MARGIN, baseX + offset));
						comp.y = y;
					});
				}
			});
		});

		return positioned;
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
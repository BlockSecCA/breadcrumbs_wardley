import type BreadcrumbsPlugin from "src/main";
import type { MapContext, EvolutionStage } from "src/interfaces/strategic";
import type { BCNodeAttributes } from "src/graph/MyMultiGraph";
import { WardleyPositioner } from "./WardleyPositioner";

export interface ComponentNode {
	id: string;
	name: string;
	attrs: BCNodeAttributes;
	x: number;
	y: number;
}

export interface ComponentEdge {
	source: string;
	target: string;
	type: 'depends_on' | 'enables' | 'constrains' | 'evolves_to' | 'evolved_from';
}

export class WardleyMapRenderer {
	private container: HTMLElement;
	private plugin: BreadcrumbsPlugin;
	private context: MapContext;
	private positioner: WardleyPositioner;
	private svg: SVGElement | null = null;
	private components: ComponentNode[] = [];
	private edges: ComponentEdge[] = [];

	constructor(container: HTMLElement, plugin: BreadcrumbsPlugin, context: MapContext) {
		this.container = container;
		this.plugin = plugin;
		this.context = context;
		this.positioner = new WardleyPositioner(plugin.graph);
	}

	async updateContext(context: MapContext) {
		this.context = context;
		await this.render();
	}

	async render() {
		console.log('WardleyMap: Starting render for context:', this.context.name);
		this.clearCanvas();
		this.loadComponents();
		console.log('WardleyMap: Loaded', this.components.length, 'components');
		this.loadEdges();
		this.positionComponents();
		this.createSVG();
		this.renderAxes();
		this.renderEdges();
		this.renderComponents();
		console.log('WardleyMap: Render complete');
	}

	private clearCanvas() {
		this.container.innerHTML = '';
		this.svg = null;
		this.components = [];
		this.edges = [];
	}

	private loadComponents() {
		const component_ids = this.plugin.mapContextManager.getComponentsForMap(this.context.id);
		
		this.components = component_ids.map(id => {
			const attrs = this.plugin.graph.getNodeAttributes(id);
			const name = this.getComponentDisplayName(id);
			
			console.log(`WardleyMap: Loading component ${id}:`, {
				attrs: attrs.strategic,
				evolution_stage: attrs.strategic?.evolution_stage
			});
			
			return {
				id,
				name,
				attrs,
				x: 0,  // Will be set by positioning algorithm
				y: 0,  // Will be set by positioning algorithm
			};
		}).filter(comp => comp.attrs.strategic); // Only include components with strategic data
		
		console.log(`WardleyMap: Total components loaded: ${this.components.length}`);
	}

	private loadEdges() {
		this.edges = [];
		const component_ids = new Set(this.components.map(c => c.id));

		console.log('WardleyMap: Loading edges for components:', Array.from(component_ids));
		
		let edge_count = 0;
		// Extract edges from graph that connect components in this map
		this.plugin.graph.forEachEdge((edge_id, attrs, source, target) => {
			edge_count++;
			console.log(`WardleyMap: Edge ${edge_count}:`, { edge_id, field: attrs.field, source, target });
			
			if (component_ids.has(source) && component_ids.has(target)) {
				const edge_type = this.mapFieldToEdgeType(attrs.field);
				console.log(`WardleyMap: Found matching edge:`, { source, target, field: attrs.field, edge_type });
				
				if (edge_type) {
					this.edges.push({
						source,
						target,
						type: edge_type,
					});
				}
			}
		});
		
		console.log(`WardleyMap: Total edges in graph: ${edge_count}, Strategic edges found: ${this.edges.length}`);
	}

	private mapFieldToEdgeType(field: string | null): 'depends_on' | 'enables' | 'constrains' | 'evolves_to' | 'evolved_from' | null {
		if (!field) return null;
		
		const fieldMap: Record<string, 'depends_on' | 'enables' | 'constrains' | 'evolves_to' | 'evolved_from'> = {
			'depends_on': 'depends_on',
			'enables': 'enables',
			'constrains': 'constrains',
			'evolves_to': 'evolves_to',
			'evolved_from': 'evolved_from',
			'up': 'depends_on',
			'down': 'enables',
		};

		return fieldMap[field] as 'depends_on' | 'enables' | 'constrains' | 'evolves_to' | 'evolved_from' || null;
	}

	private positionComponents() {
		const positioned = this.positioner.position(this.components, this.edges);
		this.components = positioned;
	}

	private createSVG() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		svg.setAttribute('viewBox', '0 0 800 600');
		svg.style.width = '100%';
		svg.style.height = '100%';

		// Add arrow marker definitions
		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
		
		// Evolution arrow marker (purple)
		const evolutionMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
		evolutionMarker.setAttribute('id', 'evolution-arrow');
		evolutionMarker.setAttribute('markerWidth', '10');
		evolutionMarker.setAttribute('markerHeight', '10');
		evolutionMarker.setAttribute('refX', '8');
		evolutionMarker.setAttribute('refY', '3');
		evolutionMarker.setAttribute('orient', 'auto');
		evolutionMarker.setAttribute('markerUnits', 'strokeWidth');
		
		const evolutionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		evolutionPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
		evolutionPath.setAttribute('fill', 'var(--color-purple)');
		evolutionMarker.appendChild(evolutionPath);
		
		defs.appendChild(evolutionMarker);
		svg.appendChild(defs);

		this.container.appendChild(svg);
		this.svg = svg;
	}

	private renderAxes() {
		if (!this.svg) return;

		// Create axis group
		const axesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		axesGroup.setAttribute('class', 'wardley-axes');

		// Y-axis (Value Chain) - left side
		const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		yAxis.setAttribute('x1', '80');
		yAxis.setAttribute('y1', '50');
		yAxis.setAttribute('x2', '80');
		yAxis.setAttribute('y2', '550');
		yAxis.setAttribute('stroke', 'var(--text-muted)');
		yAxis.setAttribute('stroke-width', '2');
		axesGroup.appendChild(yAxis);

		// X-axis (Evolution) - bottom
		const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxis.setAttribute('x1', '80');
		xAxis.setAttribute('y1', '550');
		xAxis.setAttribute('x2', '750');
		xAxis.setAttribute('y2', '550');
		xAxis.setAttribute('stroke', 'var(--text-muted)');
		xAxis.setAttribute('stroke-width', '2');
		axesGroup.appendChild(xAxis);

		// Y-axis label
		const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		yLabel.setAttribute('x', '20');
		yLabel.setAttribute('y', '300');
		yLabel.setAttribute('text-anchor', 'middle');
		yLabel.setAttribute('transform', 'rotate(-90, 20, 300)');
		yLabel.setAttribute('fill', 'var(--text-muted)');
		yLabel.setAttribute('font-size', '14');
		yLabel.textContent = 'Value Chain (User Visible ← → Infrastructure)';
		axesGroup.appendChild(yLabel);

		// X-axis label
		const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		xLabel.setAttribute('x', '415');
		xLabel.setAttribute('y', '580');
		xLabel.setAttribute('text-anchor', 'middle');
		xLabel.setAttribute('fill', 'var(--text-muted)');
		xLabel.setAttribute('font-size', '14');
		xLabel.textContent = 'Evolution (Genesis → Custom → Product → Commodity)';
		axesGroup.appendChild(xLabel);

		// Evolution stage markers
		const stages = ['Genesis', 'Custom', 'Product', 'Commodity'];
		stages.forEach((stage, i) => {
			const x = 80 + (i * 167.5); // Distribute evenly across x-axis
			
			const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			tick.setAttribute('x1', x.toString());
			tick.setAttribute('y1', '545');
			tick.setAttribute('x2', x.toString());
			tick.setAttribute('y2', '555');
			tick.setAttribute('stroke', 'var(--text-muted)');
			axesGroup.appendChild(tick);

			const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			label.setAttribute('x', x.toString());
			label.setAttribute('y', '570');
			label.setAttribute('text-anchor', 'middle');
			label.setAttribute('fill', 'var(--text-muted)');
			label.setAttribute('font-size', '12');
			label.textContent = stage;
			axesGroup.appendChild(label);
		});

		this.svg.appendChild(axesGroup);
	}

	private renderEdges() {
		if (!this.svg) return;

		const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		edgesGroup.setAttribute('class', 'wardley-edges');

		this.edges.forEach(edge => {
			const sourceComp = this.components.find(c => c.id === edge.source);
			const targetComp = this.components.find(c => c.id === edge.target);
			
			if (!sourceComp || !targetComp) return;

			// Calculate line endpoints that stop at circle edges (radius = 12)
			const radius = 12;
			const { x1, y1, x2, y2 } = this.calculateLineEndpoints(
				sourceComp.x, sourceComp.y, 
				targetComp.x, targetComp.y, 
				radius
			);

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', x1.toString());
			line.setAttribute('y1', y1.toString());
			line.setAttribute('x2', x2.toString());
			line.setAttribute('y2', y2.toString());
			line.setAttribute('stroke', this.getEdgeColor(edge.type));
			line.setAttribute('stroke-width', '2');
			line.setAttribute('stroke-dasharray', 
				edge.type === 'constrains' ? '5,5' : 
				(edge.type === 'evolves_to' || edge.type === 'evolved_from') ? '3,3' : 
				'');
			
			// Add arrow marker only for evolves_to (not evolved_from to avoid duplicates)
			if (edge.type === 'evolves_to') {
				line.setAttribute('marker-end', 'url(#evolution-arrow)');
			}
			
			edgesGroup.appendChild(line);
		});

		this.svg.appendChild(edgesGroup);
	}

	private renderComponents() {
		if (!this.svg) return;

		const componentsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		componentsGroup.setAttribute('class', 'wardley-components');

		this.components.forEach(component => {
			// Component circle
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', component.x.toString());
			circle.setAttribute('cy', component.y.toString());
			circle.setAttribute('r', '12');
			circle.setAttribute('fill', this.getComponentColor(component));
			circle.setAttribute('stroke', 'var(--text-normal)');
			circle.setAttribute('stroke-width', '2');
			circle.setAttribute('class', 'wardley-component');
			
			// Add click handler
			circle.addEventListener('click', () => this.onComponentClick(component));
			
			componentsGroup.appendChild(circle);

			// Component label
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', component.x.toString());
			text.setAttribute('y', (component.y + 25).toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', 'var(--text-normal)');
			text.setAttribute('font-size', '11');
			text.setAttribute('class', 'wardley-label');
			text.textContent = component.name;
			
			// Add tooltip on hover
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
			title.textContent = `${component.name}\nType: ${component.attrs.strategic?.type || 'unknown'}\nEvolution: ${component.attrs.strategic?.evolution_stage || 'unknown'}\nImportance: ${component.attrs.strategic?.strategic_importance || 'unknown'}`;
			circle.appendChild(title);
			
			componentsGroup.appendChild(text);
		});

		this.svg.appendChild(componentsGroup);
	}

	private getComponentDisplayName(path: string): string {
		return path.split('/').pop()?.replace('.md', '') || path;
	}

	private getComponentColor(component: ComponentNode): string {
		const strategic = component.attrs.strategic;
		if (!strategic) return 'var(--interactive-normal)';

		// Color by strategic importance
		const colorMap: Record<string, string> = {
			critical: 'var(--color-red)',
			important: 'var(--color-orange)', 
			supporting: 'var(--color-blue)',
			optional: 'var(--color-base-40)',
		};

		return colorMap[strategic.strategic_importance || 'supporting'] || 'var(--interactive-normal)';
	}

	private getEdgeColor(type: string): string {
		const colorMap: Record<string, string> = {
			depends_on: 'var(--color-blue)',
			enables: 'var(--color-green)',
			constrains: 'var(--color-red)',
			evolves_to: 'var(--color-purple)',
			evolved_from: 'var(--color-purple)',
		};

		return colorMap[type] || 'var(--text-muted)';
	}

	private calculateLineEndpoints(x1: number, y1: number, x2: number, y2: number, radius: number) {
		// Calculate the direction vector
		const dx = x2 - x1;
		const dy = y2 - y1;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// If components are too close, don't draw line
		if (distance <= radius * 2) {
			return { x1, y1, x2, y2 };
		}

		// Calculate unit vector
		const unitX = dx / distance;
		const unitY = dy / distance;

		// Calculate endpoints at circle edges
		const startX = x1 + unitX * radius;
		const startY = y1 + unitY * radius;
		const endX = x2 - unitX * radius;
		const endY = y2 - unitY * radius;

		return {
			x1: startX,
			y1: startY,
			x2: endX,
			y2: endY
		};
	}

	private onComponentClick(component: ComponentNode) {
		// Open the note file
		const file = this.plugin.app.vault.getAbstractFileByPath(component.id);
		if (file) {
			this.plugin.app.workspace.openLinkText(component.id, '', false);
		}
	}
}
import type { BCGraph } from "./MyMultiGraph";
import type { MapContext, StrategicValidationWarning, StrategicInsight } from "src/interfaces/strategic";
import type BreadcrumbsPlugin from "src/main";

export class StrategicAnalyzer {
	private plugin: BreadcrumbsPlugin;
	private graph: BCGraph;

	constructor(plugin: BreadcrumbsPlugin) {
		this.plugin = plugin;
		this.graph = plugin.graph;
	}

	analyzeMapContext(context: MapContext): {
		warnings: StrategicValidationWarning[];
		insights: StrategicInsight[];
		summary: {
			total_components: number;
			by_evolution: Record<string, number>;
			by_importance: Record<string, number>;
			by_confidence: Record<string, number>;
		};
	} {
		const component_ids = this.plugin.mapContextManager.getComponentsForMap(context.id);
		const components = component_ids.map(id => ({
			id,
			attrs: this.graph.getNodeAttributes(id),
		})).filter(comp => comp.attrs.strategic);

		const warnings = this.generateValidationWarnings(components);
		const insights = this.generateStrategicInsights(components, context);
		const summary = this.generateSummary(components);

		return { warnings, insights, summary };
	}

	private generateValidationWarnings(components: Array<{id: string, attrs: any}>): StrategicValidationWarning[] {
		const warnings: StrategicValidationWarning[] = [];

		components.forEach(({ id, attrs }) => {
			const strategic = attrs.strategic;
			if (!strategic) return;

			// Low confidence warning
			if (strategic.confidence_level === 'low') {
				warnings.push({
					type: 'low_confidence',
					message: `Component has low confidence rating`,
					component_path: id,
					severity: 'medium',
				});
			}

			// Missing evidence warning
			if (!strategic.evidence_sources || strategic.evidence_sources.length === 0) {
				warnings.push({
					type: 'missing_evidence',
					message: `Component lacks evidence sources`,
					component_path: id,
					severity: 'medium',
				});
			} else {
				// Check if evidence notes exist (future enhancement)
				const missingEvidenceNotes = this.checkEvidenceNotesExist(strategic.evidence_sources);
				if (missingEvidenceNotes.length > 0) {
					warnings.push({
						type: 'missing_evidence',
						message: `Referenced evidence notes don't exist: ${missingEvidenceNotes.join(', ')}`,
						component_path: id,
						severity: 'low',
					});
				}
			}

			// Outdated validation warning
			if (strategic.last_validated) {
				const validatedDate = new Date(strategic.last_validated);
				const now = new Date();
				const monthsOld = (now.getTime() - validatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
				
				if (monthsOld > 6) {
					warnings.push({
						type: 'outdated_validation',
						message: `Component hasn't been validated in ${Math.floor(monthsOld)} months`,
						component_path: id,
						severity: monthsOld > 12 ? 'high' : 'medium',
					});
				}
			} else {
				warnings.push({
					type: 'outdated_validation',
					message: `Component has no validation date`,
					component_path: id,
					severity: 'low',
				});
			}

			// Evolution inconsistency
			if (strategic.type && strategic.evolution_stage) {
				const inconsistencies = this.checkEvolutionConsistency(strategic.type, strategic.evolution_stage);
				if (inconsistencies.length > 0) {
					warnings.push({
						type: 'evolution_inconsistency',
						message: `Evolution stage may be inconsistent with component type: ${inconsistencies.join(', ')}`,
						component_path: id,
						severity: 'low',
					});
				}
			}
		});

		return warnings.sort((a, b) => {
			const severityOrder = { high: 3, medium: 2, low: 1 };
			return severityOrder[b.severity] - severityOrder[a.severity];
		});
	}

	private checkEvolutionConsistency(type: string, evolution_stage: string): string[] {
		const inconsistencies: string[] = [];

		// Define typical evolution expectations for different types
		const expectations: Record<string, string[]> = {
			user_need: ['genesis', 'custom'],
			capability: ['custom', 'product'],
			component: ['product', 'commodity'],
			service: ['product', 'commodity'],
			product: ['custom', 'product'],
		};

		const expected = expectations[type];
		if (expected && !expected.includes(evolution_stage)) {
			inconsistencies.push(`${type} components typically exist in ${expected.join(' or ')} stages`);
		}

		return inconsistencies;
	}

	private generateStrategicInsights(components: Array<{id: string, attrs: any}>, context: MapContext): StrategicInsight[] {
		const insights: StrategicInsight[] = [];

		// Find orphaned components (no incoming or outgoing relationships)
		const orphaned = this.findOrphanedComponents(components);
		if (orphaned.length > 0) {
			insights.push({
				type: 'orphaned_component',
				message: `${orphaned.length} component(s) have no strategic relationships`,
				affected_components: orphaned,
				priority: 'medium',
			});
		}

		// Identify critical path components
		const critical_path = this.findCriticalPath(components);
		if (critical_path.length > 0) {
			insights.push({
				type: 'critical_path',
				message: `${critical_path.length} component(s) are on the critical path`,
				affected_components: critical_path,
				priority: 'high',
			});
		}

		// Find evolution gaps
		const evolution_gaps = this.findEvolutionGaps(components);
		if (evolution_gaps.length > 0) {
			insights.push({
				type: 'evolution_gap',
				message: `Potential evolution gaps detected in ${evolution_gaps.length} areas`,
				affected_components: evolution_gaps,
				priority: 'medium',
			});
		}

		// Identify dependency risks
		const dependency_risks = this.findDependencyRisks(components);
		if (dependency_risks.length > 0) {
			insights.push({
				type: 'dependency_risk',
				message: `${dependency_risks.length} component(s) have high dependency risk`,
				affected_components: dependency_risks,
				priority: 'high',
			});
		}

		return insights.sort((a, b) => {
			const priorityOrder = { high: 3, medium: 2, low: 1 };
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		});
	}

	private findOrphanedComponents(components: Array<{id: string, attrs: any}>): string[] {
		const component_ids = new Set(components.map(c => c.id));
		const connected_components = new Set<string>();

		// Check all edges to find connected components
		this.graph.forEachEdge((edge_id, attrs, source, target) => {
			if (component_ids.has(source) && component_ids.has(target)) {
				connected_components.add(source);
				connected_components.add(target);
			}
		});

		return components
			.filter(comp => !connected_components.has(comp.id))
			.map(comp => comp.id);
	}

	private findCriticalPath(components: Array<{id: string, attrs: any}>): string[] {
		// Components marked as critical importance or those with many dependencies
		const critical_components: string[] = [];
		const component_ids = new Set(components.map(c => c.id));

		components.forEach(({ id, attrs }) => {
			if (attrs.strategic?.strategic_importance === 'critical') {
				critical_components.push(id);
				return;
			}

			// Count dependencies
			let dependency_count = 0;
			this.graph.forEachEdge((edge_id, edge_attrs, source, target) => {
				if (component_ids.has(source) && component_ids.has(target)) {
					if (target === id && edge_attrs.field === 'depends_on') {
						dependency_count++;
					} else if (source === id && edge_attrs.field === 'enables') {
						dependency_count++;
					}
				}
			});

			// Consider components with 3+ dependencies as critical path
			if (dependency_count >= 3) {
				critical_components.push(id);
			}
		});

		return critical_components;
	}

	private findEvolutionGaps(components: Array<{id: string, attrs: any}>): string[] {
		// Look for missing evolution stages in dependency chains
		const gaps: string[] = [];
		const component_ids = new Set(components.map(c => c.id));

		const evolution_order = ['genesis', 'custom', 'product', 'commodity'];
		
		this.graph.forEachEdge((edge_id, attrs, source, target) => {
			if (!component_ids.has(source) || !component_ids.has(target)) return;
			if (attrs.field !== 'depends_on') return;

			const source_comp = components.find(c => c.id === source);
			const target_comp = components.find(c => c.id === target);

			if (!source_comp?.attrs.strategic?.evolution_stage || !target_comp?.attrs.strategic?.evolution_stage) return;

			const source_stage = source_comp.attrs.strategic.evolution_stage;
			const target_stage = target_comp.attrs.strategic.evolution_stage;

			const source_index = evolution_order.indexOf(source_stage);
			const target_index = evolution_order.indexOf(target_stage);

			// Flag if dependency is from more evolved to less evolved (potential gap)
			if (source_index > target_index && source_index - target_index > 1) {
				gaps.push(source);
			}
		});

		return [...new Set(gaps)]; // Remove duplicates
	}

	private findDependencyRisks(components: Array<{id: string, attrs: any}>): string[] {
		// Components that depend on low-confidence or outdated components
		const risks: string[] = [];
		const component_ids = new Set(components.map(c => c.id));

		this.graph.forEachEdge((edge_id, attrs, source, target) => {
			if (!component_ids.has(source) || !component_ids.has(target)) return;
			if (attrs.field !== 'depends_on') return;

			const target_comp = components.find(c => c.id === target);
			if (!target_comp?.attrs.strategic) return;

			const target_strategic = target_comp.attrs.strategic;

			// Check if dependency is risky
			let is_risky = false;

			if (target_strategic.confidence_level === 'low') {
				is_risky = true;
			}

			if (target_strategic.last_validated) {
				const validatedDate = new Date(target_strategic.last_validated);
				const now = new Date();
				const monthsOld = (now.getTime() - validatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
				if (monthsOld > 12) {
					is_risky = true;
				}
			}

			if (is_risky) {
				risks.push(source);
			}
		});

		return [...new Set(risks)]; // Remove duplicates
	}

	private generateSummary(components: Array<{id: string, attrs: any}>) {
		const summary = {
			total_components: components.length,
			by_evolution: {} as Record<string, number>,
			by_importance: {} as Record<string, number>,
			by_confidence: {} as Record<string, number>,
		};

		components.forEach(({ attrs }) => {
			const strategic = attrs.strategic;
			if (!strategic) return;

			// Count by evolution stage
			const evolution = strategic.evolution_stage || 'unknown';
			summary.by_evolution[evolution] = (summary.by_evolution[evolution] || 0) + 1;

			// Count by importance
			const importance = strategic.strategic_importance || 'unknown';
			summary.by_importance[importance] = (summary.by_importance[importance] || 0) + 1;

			// Count by confidence
			const confidence = strategic.confidence_level || 'unknown';
			summary.by_confidence[confidence] = (summary.by_confidence[confidence] || 0) + 1;
		});

		return summary;
	}

	private checkEvidenceNotesExist(evidenceSources: string[]): string[] {
		const missingNotes: string[] = [];
		
		evidenceSources.forEach(source => {
			// Extract note name from [[Note Name]] format
			const noteMatch = source.match(/\[\[([^\]]+)\]\]/);
			if (noteMatch) {
				const noteName = noteMatch[1];
				const notePath = noteName + '.md';
				
				// Check if note exists in vault
				const file = this.plugin.app.vault.getAbstractFileByPath(notePath);
				if (!file) {
					// Check in subfolders too
					const allFiles = this.plugin.app.vault.getMarkdownFiles();
					const exists = allFiles.some(f => f.basename === noteName);
					if (!exists) {
						missingNotes.push(noteName);
					}
				}
			}
		});
		
		return missingNotes;
	}
}
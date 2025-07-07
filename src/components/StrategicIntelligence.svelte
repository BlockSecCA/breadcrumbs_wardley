<script lang="ts">
	import type BreadcrumbsPlugin from "src/main";
	import type { MapContext, StrategicValidationWarning, StrategicInsight } from "src/interfaces/strategic";
	import { StrategicAnalyzer } from "src/graph/strategic_analysis";
	import { onMount } from "svelte";

	export let plugin: BreadcrumbsPlugin;

	let analyzer: StrategicAnalyzer;
	let currentContext: MapContext | null = null;
	let analysis: {
		warnings: StrategicValidationWarning[];
		insights: StrategicInsight[];
		summary: any;
	} | null = null;
	let loading = false;

	onMount(async () => {
		analyzer = new StrategicAnalyzer(plugin);
		await refreshAnalysis();
	});

	async function refreshAnalysis() {
		loading = true;
		try {
			currentContext = plugin.mapContextManager.getCurrentMapContext() || 
							plugin.mapContextManager.getDefaultMapContext();
			
			if (currentContext) {
				analysis = analyzer.analyzeMapContext(currentContext);
			}
		} catch (error) {
			console.error('Error during strategic analysis:', error);
		} finally {
			loading = false;
		}
	}

	function getSeverityIcon(severity: string): string {
		switch (severity) {
			case 'high': return '🔴';
			case 'medium': return '🟡';
			case 'low': return '🟢';
			default: return '⚪';
		}
	}

	function getPriorityIcon(priority: string): string {
		switch (priority) {
			case 'high': return '⚡';
			case 'medium': return '📋';
			case 'low': return '💡';
			default: return '📌';
		}
	}

	function getWarningTypeLabel(type: string): string {
		switch (type) {
			case 'low_confidence': return 'Low Confidence';
			case 'missing_evidence': return 'Missing Evidence';
			case 'outdated_validation': return 'Outdated Validation';
			case 'evolution_inconsistency': return 'Evolution Inconsistency';
			default: return type.replace(/_/g, ' ');
		}
	}

	function getInsightTypeLabel(type: string): string {
		switch (type) {
			case 'orphaned_component': return 'Orphaned Components';
			case 'critical_path': return 'Critical Path';
			case 'evolution_gap': return 'Evolution Gap';
			case 'dependency_risk': return 'Dependency Risk';
			default: return type.replace(/_/g, ' ');
		}
	}

	function openComponent(path: string) {
		plugin.app.workspace.openLinkText(path, '', false);
	}

	function getComponentName(path: string): string {
		return path.split('/').pop()?.replace('.md', '') || path;
	}
</script>

<div class="strategic-intelligence-panel">
	<div class="panel-header">
		<h3>Strategic Intelligence</h3>
		<button on:click={refreshAnalysis} class="refresh-btn" disabled={loading}>
			{#if loading}
				<div class="loading-spinner"></div>
			{:else}
				🔄
			{/if}
		</button>
	</div>

	{#if currentContext && analysis}
		<div class="context-info">
			<h4>{currentContext.name}</h4>
			<span class="context-scope">{currentContext.scope}</span>
		</div>

		<div class="summary-cards">
			<div class="summary-card">
				<div class="card-title">Components</div>
				<div class="card-value">{analysis.summary.total_components}</div>
			</div>
			
			<div class="summary-card">
				<div class="card-title">Warnings</div>
				<div class="card-value critical">{analysis.warnings.length}</div>
			</div>
			
			<div class="summary-card">
				<div class="card-title">Insights</div>
				<div class="card-value info">{analysis.insights.length}</div>
			</div>
		</div>

		<!-- Evolution Distribution -->
		{#if Object.keys(analysis.summary.by_evolution).length > 0}
			<div class="distribution-section">
				<h5>Evolution Distribution</h5>
				<div class="distribution-bars">
					{#each Object.entries(analysis.summary.by_evolution) as [stage, count]}
						<div class="distribution-item">
							<span class="stage-name">{stage}</span>
							<div class="bar-container">
								<div 
									class="bar evolution-{stage}" 
									style="width: {(count / analysis.summary.total_components) * 100}%"
								></div>
							</div>
							<span class="count">{count}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Validation Warnings -->
		{#if analysis.warnings.length > 0}
			<div class="warnings-section">
				<h5>Validation Warnings</h5>
				<div class="items-list">
					{#each analysis.warnings as warning}
						<div class="warning-item severity-{warning.severity}">
							<div class="item-header">
								<span class="severity-icon">{getSeverityIcon(warning.severity)}</span>
								<span class="item-type">{getWarningTypeLabel(warning.type)}</span>
							</div>
							<div class="item-message">{warning.message}</div>
							<button 
								class="component-link"
								on:click={() => openComponent(warning.component_path)}
							>
								{getComponentName(warning.component_path)}
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Strategic Insights -->
		{#if analysis.insights.length > 0}
			<div class="insights-section">
				<h5>Strategic Insights</h5>
				<div class="items-list">
					{#each analysis.insights as insight}
						<div class="insight-item priority-{insight.priority}">
							<div class="item-header">
								<span class="priority-icon">{getPriorityIcon(insight.priority)}</span>
								<span class="item-type">{getInsightTypeLabel(insight.type)}</span>
							</div>
							<div class="item-message">{insight.message}</div>
							{#if insight.affected_components.length > 0}
								<div class="affected-components">
									{#each insight.affected_components.slice(0, 3) as componentPath}
										<button 
											class="component-link"
											on:click={() => openComponent(componentPath)}
										>
											{getComponentName(componentPath)}
										</button>
									{/each}
									{#if insight.affected_components.length > 3}
										<span class="more-components">+{insight.affected_components.length - 3} more</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else if loading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Analyzing strategic data...</p>
		</div>
	{:else}
		<div class="empty-state">
			<p>No strategic map context available.</p>
			<p>Add strategic metadata to your notes to enable analysis.</p>
		</div>
	{/if}
</div>

<style>
	.strategic-intelligence-panel {
		padding: 1rem;
		max-height: 100%;
		overflow-y: auto;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--background-modifier-border);
		padding-bottom: 0.5rem;
	}

	.panel-header h3 {
		margin: 0;
		color: var(--text-normal);
	}

	.refresh-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		color: var(--text-muted);
	}

	.refresh-btn:hover {
		background: var(--background-modifier-hover);
	}

	.refresh-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.context-info {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: var(--background-secondary);
		border-radius: 6px;
	}

	.context-info h4 {
		margin: 0 0 0.25rem 0;
		color: var(--text-normal);
	}

	.context-scope {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		font-weight: 500;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.summary-card {
		text-align: center;
		padding: 0.75rem;
		background: var(--background-secondary);
		border-radius: 6px;
	}

	.card-title {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-normal);
	}

	.card-value.critical {
		color: var(--color-red);
	}

	.card-value.info {
		color: var(--color-blue);
	}

	.distribution-section, .warnings-section, .insights-section {
		margin-bottom: 1.5rem;
	}

	.distribution-section h5, .warnings-section h5, .insights-section h5 {
		margin: 0 0 0.75rem 0;
		color: var(--text-normal);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.distribution-bars {
		space-y: 0.5rem;
	}

	.distribution-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.stage-name {
		width: 60px;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.bar-container {
		flex: 1;
		height: 8px;
		background: var(--background-modifier-border);
		border-radius: 4px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		transition: width 0.3s ease;
	}

	.bar.evolution-genesis { background: var(--color-red); }
	.bar.evolution-custom { background: var(--color-orange); }
	.bar.evolution-product { background: var(--color-blue); }
	.bar.evolution-commodity { background: var(--color-green); }
	.bar.evolution-unknown { background: var(--color-base-40); }

	.count {
		width: 20px;
		text-align: right;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.items-list {
		space-y: 0.75rem;
	}

	.warning-item, .insight-item {
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 0.75rem;
		border-left: 3px solid;
	}

	.warning-item.severity-high, .insight-item.priority-high {
		background: var(--background-secondary);
		border-left-color: var(--color-red);
	}

	.warning-item.severity-medium, .insight-item.priority-medium {
		background: var(--background-secondary);
		border-left-color: var(--color-orange);
	}

	.warning-item.severity-low, .insight-item.priority-low {
		background: var(--background-secondary);
		border-left-color: var(--color-green);
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.severity-icon, .priority-icon {
		font-size: 0.9rem;
	}

	.item-type {
		font-weight: 500;
		color: var(--text-normal);
		font-size: 0.9rem;
	}

	.item-message {
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.component-link {
		background: var(--interactive-accent);
		color: white;
		border: none;
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		cursor: pointer;
		margin-right: 0.25rem;
		margin-bottom: 0.25rem;
	}

	.component-link:hover {
		background: var(--interactive-accent-hover);
	}

	.affected-components {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		align-items: center;
	}

	.more-components {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.loading-state, .empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--background-modifier-border);
		border-top: 2px solid var(--interactive-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
<script lang="ts">
	import type BreadcrumbsPlugin from "src/main";
	import type { MapContext } from "src/interfaces/strategic";
	import { onMount } from "svelte";
	import { WardleyMapRenderer } from "./wardley/WardleyMapRenderer";
	import StrategicIntelligence from "./StrategicIntelligence.svelte";

	export let plugin: BreadcrumbsPlugin;

	let container: HTMLElement;
	let mapSelector: HTMLSelectElement;
	let availableContexts: MapContext[] = [];
	let currentContext: MapContext | null = null;
	let renderer: WardleyMapRenderer | null = null;
	let showIntelligence = false;

	onMount(async () => {
		await refreshMapContexts();
		if (currentContext) {
			renderer = new WardleyMapRenderer(container, plugin, currentContext);
			await renderer.render();
		}
		
		// Listen for graph updates
		const refreshHandler = async () => {
			console.log('WardleyMap: Received graph update event');
			// Small delay to ensure graph is fully updated
			setTimeout(async () => {
				await refreshMapContexts();
				if (renderer && currentContext) {
					console.log('WardleyMap: Re-rendering after graph update');
					await renderer.render();
				}
			}, 100);
		};
		
		plugin.app.workspace.on('breadcrumbs:graph-updated', refreshHandler);
		
		// Cleanup on component destroy
		return () => {
			plugin.app.workspace.off('breadcrumbs:graph-updated', refreshHandler);
		};
	});

	async function refreshMapContexts() {
		availableContexts = await plugin.mapContextManager.detectMapContexts();
		currentContext = plugin.mapContextManager.getCurrentMapContext() || 
						plugin.mapContextManager.getDefaultMapContext();
	}

	async function onMapContextChange() {
		const selectedId = mapSelector.value;
		const selected = availableContexts.find(ctx => ctx.id === selectedId);
		if (selected) {
			currentContext = selected;
			plugin.mapContextManager.setCurrentMapContext(selected);
			
			if (renderer) {
				await renderer.updateContext(selected);
			}
		}
	}

	async function refreshMap() {
		if (renderer && currentContext) {
			await renderer.render();
		}
	}
</script>

<div class="wardley-map-container">
	<div class="wardley-map-controls">
		<div class="map-selector">
			<label for="map-context-select">Strategic Map:</label>
			<select 
				id="map-context-select" 
				bind:this={mapSelector} 
				on:change={onMapContextChange}
				value={currentContext?.id || ''}
			>
				{#each availableContexts as context}
					<option value={context.id}>{context.name}</option>
				{/each}
			</select>
		</div>
		
		<div class="map-actions">
			<button 
				on:click={() => showIntelligence = !showIntelligence} 
				class="clickable-icon" 
				class:active={showIntelligence}
				title="Toggle strategic intelligence panel"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 11H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1Z"/>
					<path d="M22 6a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6Z"/>
				</svg>
			</button>
			<button on:click={refreshMap} class="clickable-icon" title="Refresh map">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M23 4v6h-6M1 20v-6h6"/>
					<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
				</svg>
			</button>
		</div>
	</div>

	{#if currentContext}
		<div class="map-info">
			<h3>{currentContext.name}</h3>
			{#if currentContext.description}
				<p class="map-description">{currentContext.description}</p>
			{/if}
			<span class="map-scope-badge scope-{currentContext.scope}">
				{currentContext.scope}
			</span>
		</div>
	{/if}

	<div class="wardley-content" class:split-view={showIntelligence}>
		<div class="wardley-map-canvas" bind:this={container}>
			<!-- Wardley map will be rendered here -->
		</div>
		
		{#if showIntelligence}
			<div class="intelligence-panel">
				<StrategicIntelligence {plugin} />
			</div>
		{/if}
	</div>
</div>

<style>
	.wardley-map-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1rem;
	}

	.wardley-map-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding: 0.5rem;
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.map-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.map-selector label {
		font-weight: 500;
		color: var(--text-muted);
	}

	.map-selector select {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		background: var(--background-primary);
		color: var(--text-normal);
	}

	.map-actions {
		display: flex;
		gap: 0.5rem;
	}

	.map-info {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: var(--background-secondary);
		border-radius: 6px;
	}

	.map-info h3 {
		margin: 0 0 0.5rem 0;
		color: var(--text-normal);
	}

	.map-description {
		margin: 0 0 0.5rem 0;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.map-scope-badge {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 12px;
		text-transform: uppercase;
	}

	.scope-vault {
		background: var(--color-blue);
		color: white;
	}

	.scope-folder {
		background: var(--color-green);
		color: white;
	}

	.scope-membership {
		background: var(--color-purple);
		color: white;
	}

	.wardley-content {
		flex: 1;
		display: flex;
		gap: 1rem;
		min-height: 400px;
	}

	.wardley-content.split-view .wardley-map-canvas {
		flex: 2;
	}

	.wardley-map-canvas {
		flex: 1;
		min-height: 400px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		background: var(--background-primary);
		position: relative;
		overflow: hidden;
	}

	.intelligence-panel {
		flex: 1;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		background: var(--background-primary);
		overflow: hidden;
	}

	.clickable-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: var(--icon-color);
	}

	.clickable-icon:hover {
		background: var(--background-modifier-hover);
	}

	.clickable-icon.active {
		background: var(--interactive-accent);
		color: white;
	}
</style>
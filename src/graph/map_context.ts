import { TFile, App } from "obsidian";
import type { MapContext } from "src/interfaces/strategic";
import type { BCGraph } from "./MyMultiGraph";

export class MapContextManager {
	private app: App;
	private graph: BCGraph;
	private cached_contexts: MapContext[] = [];
	private current_context: MapContext | null = null;

	constructor(app: App, graph: BCGraph) {
		this.app = app;
		this.graph = graph;
	}

	async detectMapContexts(): Promise<MapContext[]> {
		const contexts: MapContext[] = [];

		// Pattern 1: Vault-wide context (single strategic map)
		const vault_context = this.detectVaultContext();
		if (vault_context) {
			contexts.push(vault_context);
		}

		// Pattern 2: Folder-based contexts
		const folder_contexts = await this.detectFolderContexts();
		contexts.push(...folder_contexts);

		// Pattern 3: Membership-based contexts
		const membership_contexts = this.detectMembershipContexts();
		contexts.push(...membership_contexts);

		this.cached_contexts = contexts;
		return contexts;
	}

	private detectVaultContext(): MapContext | null {
		// Check if vault has strategic components but no folder structure
		const strategic_files = this.getStrategicFiles();
		if (strategic_files.length === 0) return null;

		// Check if all strategic files are in root or no clear folder organization
		const has_folder_contexts = strategic_files.some(file => {
			if (!file.path.includes('/')) return false;
			const folder_path = file.path.substring(0, file.path.lastIndexOf('/'));
			return this.hasMapContextFile(folder_path);
		});

		if (!has_folder_contexts) {
			return {
				id: "vault",
				name: "Vault Strategic Map",
				scope: "vault",
				description: "Strategic map spanning entire vault",
			};
		}

		return null;
	}

	private async detectFolderContexts(): Promise<MapContext[]> {
		const contexts: MapContext[] = [];
		const all_files = this.app.vault.getAllLoadedFiles();
		
		// Get unique folder paths from all files, filtering out non-existent files
		const folder_paths = new Set<string>();
		for (const file of all_files) {
			// Check if file actually exists (not just cached)
			if (file.path.includes('/') && this.app.vault.getAbstractFileByPath(file.path)) {
				const folder_path = file.path.substring(0, file.path.lastIndexOf('/'));
				folder_paths.add(folder_path);
			}
		}
		
		console.log('MapContext: Detected folder paths:', Array.from(folder_paths));

		for (const folder_path of folder_paths) {
			const map_context_file = this.app.vault.getAbstractFileByPath(
				`${folder_path}/Map-Context.md`
			);

			if (map_context_file instanceof TFile) {
				const content = await this.app.vault.cachedRead(map_context_file);
				const context = this.parseMapContextFile(content, folder_path);
				if (context) {
					contexts.push(context);
				}
			}
		}

		return contexts;
	}

	private detectMembershipContexts(): MapContext[] {
		const contexts: MapContext[] = [];
		const map_memberships = new Map<string, string[]>();

		// Collect all strategic_maps declarations
		this.graph.forEachNode((node_id, attrs) => {
			if (attrs.strategic?.strategic_maps) {
				attrs.strategic.strategic_maps.forEach(map_id => {
					if (!map_memberships.has(map_id)) {
						map_memberships.set(map_id, []);
					}
					map_memberships.get(map_id)?.push(node_id);
				});
			}
		});

		// Create contexts from memberships
		for (const [map_id, members] of map_memberships) {
			contexts.push({
				id: map_id,
				name: map_id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
				scope: "membership",
				description: `Strategic map with ${members.length} declared members`,
				includes: members,
			});
		}

		return contexts;
	}

	private parseMapContextFile(content: string, folder_path: string): MapContext | null {
		// Extract title from first heading
		const title_match = content.match(/^#\s+(.+)$/m);
		const title = title_match ? title_match[1] : folder_path.split('/').pop() || 'Untitled';

		// Extract description from content
		const description_match = content.match(/^(.+?)(?=\n#|\n\n|\Z)/s);
		const description = description_match ? description_match[1].trim() : undefined;

		return {
			id: folder_path,
			name: title,
			scope: "folder",
			description,
			includes: [folder_path],
		};
	}

	private getStrategicFiles(): TFile[] {
		const strategic_files: TFile[] = [];
		
		this.graph.forEachNode((node_id, attrs) => {
			if (attrs.strategic && attrs.resolved) {
				const file = this.app.vault.getAbstractFileByPath(node_id);
				if (file instanceof TFile) {
					strategic_files.push(file);
				}
			}
		});

		return strategic_files;
	}

	private hasMapContextFile(folder_path: string): boolean {
		const map_context_file = this.app.vault.getAbstractFileByPath(
			`${folder_path}/Map-Context.md`
		);
		return map_context_file instanceof TFile;
	}

	getCurrentMapContext(): MapContext | null {
		return this.current_context;
	}

	setCurrentMapContext(context: MapContext): void {
		this.current_context = context;
	}

	getComponentsForMap(map_id: string): string[] {
		const context = this.cached_contexts.find(ctx => ctx.id === map_id);
		if (!context) return [];

		const components: string[] = [];

		this.graph.forEachNode((node_id, attrs) => {
			if (!attrs.strategic) return;

			let include_in_map = false;

			switch (context.scope) {
				case "vault":
					include_in_map = attrs.resolved;
					break;
				
				case "folder":
					if (context.includes) {
						include_in_map = context.includes.some(folder => 
							node_id.startsWith(folder + '/')
						);
					}
					break;
				
				case "membership":
					include_in_map = attrs.strategic.strategic_maps?.includes(map_id) || false;
					break;
			}

			if (include_in_map) {
				components.push(node_id);
			}
		});

		return components;
	}

	getDefaultMapContext(): MapContext | null {
		if (this.cached_contexts.length === 0) return null;
		
		// Prefer vault context if available
		const vault_context = this.cached_contexts.find(ctx => ctx.scope === "vault");
		if (vault_context) return vault_context;

		// Otherwise return first context
		return this.cached_contexts[0];
	}

	refresh(): void {
		this.cached_contexts = [];
		this.current_context = null;
	}
}
import BreadcrumbsPlugin from "src/main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import WardleyMapComponent from "src/components/WardleyMap.svelte";
import { VIEW_IDS } from "src/const/views";

export class WardleyMapView extends ItemView {
	plugin: BreadcrumbsPlugin;
	component!: WardleyMapComponent;

	constructor(leaf: WorkspaceLeaf, plugin: BreadcrumbsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_IDS.wardley;
	}

	getDisplayText() {
		return "Wardley Map";
	}

	getIcon() {
		return "map";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		this.component = new WardleyMapComponent({
			target: this.contentEl,
			props: { plugin: this.plugin },
		});
	}

	async onClose() {
		this.component?.$destroy();
	}
}
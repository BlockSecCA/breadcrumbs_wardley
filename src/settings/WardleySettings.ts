import { Setting } from "obsidian";
import type BreadcrumbsPlugin from "src/main";

export function _add_settings_wardley(plugin: BreadcrumbsPlugin, containerEl: HTMLElement) {
	const settings = plugin.settings.views.wardley;

	// Visual Appearance Section
	containerEl.createEl("h4", { text: "Visual Appearance" });

	// Font Size
	new Setting(containerEl)
		.setName("Font Size")
		.setDesc("Size of component labels (in pixels)")
		.addSlider((slider) =>
			slider
				.setLimits(8, 20, 1)
				.setValue(settings.font_size)
				.setDynamicTooltip()
				.onChange(async (value) => {
					settings.font_size = value;
					await plugin.saveSettings();
				})
		);

	// Node Size
	new Setting(containerEl)
		.setName("Node Size")
		.setDesc("Radius of component circles (in pixels)")
		.addSlider((slider) =>
			slider
				.setLimits(6, 24, 1)
				.setValue(settings.node_size)
				.setDynamicTooltip()
				.onChange(async (value) => {
					settings.node_size = value;
					await plugin.saveSettings();
				})
		);

	// Edge Thickness
	new Setting(containerEl)
		.setName("Edge Thickness")
		.setDesc("Thickness of relationship lines")
		.addSlider((slider) =>
			slider
				.setLimits(1, 5, 0.5)
				.setValue(settings.edge_thickness)
				.setDynamicTooltip()
				.onChange(async (value) => {
					settings.edge_thickness = value;
					await plugin.saveSettings();
				})
		);

	// Component Spacing
	new Setting(containerEl)
		.setName("Component Spacing")
		.setDesc("Minimum spacing between components in the same evolution stage")
		.addSlider((slider) =>
			slider
				.setLimits(40, 150, 10)
				.setValue(settings.component_spacing)
				.setDynamicTooltip()
				.onChange(async (value) => {
					settings.component_spacing = value;
					await plugin.saveSettings();
				})
		);

	// Color Settings Section
	containerEl.createEl("h4", { text: "Component Colors" });

	// Critical Components
	new Setting(containerEl)
		.setName("Critical Components")
		.setDesc("Color for critical importance components")
		.addText((text) =>
			text
				.setPlaceholder("var(--color-red)")
				.setValue(settings.node_colors.critical)
				.onChange(async (value) => {
					settings.node_colors.critical = value || "var(--color-red)";
					await plugin.saveSettings();
				})
		);

	// Important Components
	new Setting(containerEl)
		.setName("Important Components")
		.setDesc("Color for important components")
		.addText((text) =>
			text
				.setPlaceholder("var(--color-orange)")
				.setValue(settings.node_colors.important)
				.onChange(async (value) => {
					settings.node_colors.important = value || "var(--color-orange)";
					await plugin.saveSettings();
				})
		);

	// Supporting Components
	new Setting(containerEl)
		.setName("Supporting Components")
		.setDesc("Color for supporting components")
		.addText((text) =>
			text
				.setPlaceholder("var(--color-blue)")
				.setValue(settings.node_colors.supporting)
				.onChange(async (value) => {
					settings.node_colors.supporting = value || "var(--color-blue)";
					await plugin.saveSettings();
				})
		);

	// Optional Components
	new Setting(containerEl)
		.setName("Optional Components")
		.setDesc("Color for optional components")
		.addText((text) =>
			text
				.setPlaceholder("var(--color-base-40)")
				.setValue(settings.node_colors.optional)
				.onChange(async (value) => {
					settings.node_colors.optional = value || "var(--color-base-40)";
					await plugin.saveSettings();
				})
		);

	// Display Options Section
	containerEl.createEl("h4", { text: "Display Options" });

	// Show Evolution Grid
	new Setting(containerEl)
		.setName("Show Evolution Grid")
		.setDesc("Display light dotted vertical lines at evolution stage boundaries")
		.addToggle((toggle) =>
			toggle
				.setValue(settings.show_evolution_grid)
				.onChange(async (value) => {
					settings.show_evolution_grid = value;
					await plugin.saveSettings();
				})
		);

	// Show Axis Labels
	new Setting(containerEl)
		.setName("Show Axis Labels")
		.setDesc("Display labels for value chain and evolution axes")
		.addToggle((toggle) =>
			toggle
				.setValue(settings.show_axis_labels)
				.onChange(async (value) => {
					settings.show_axis_labels = value;
					await plugin.saveSettings();
				})
		);

	// Grid Appearance Section
	containerEl.createEl("h4", { text: "Evolution Grid" });

	// Grid Color
	new Setting(containerEl)
		.setName("Grid Color")
		.setDesc("Color of evolution stage boundary lines")
		.addText((text) =>
			text
				.setPlaceholder("var(--text-muted)")
				.setValue(settings.grid_color)
				.onChange(async (value) => {
					settings.grid_color = value || "var(--text-muted)";
					await plugin.saveSettings();
				})
		);

	// Grid Opacity
	new Setting(containerEl)
		.setName("Grid Opacity")
		.setDesc("Transparency of evolution grid lines (0 = invisible, 1 = solid)")
		.addSlider((slider) =>
			slider
				.setLimits(0.1, 1.0, 0.1)
				.setValue(settings.grid_opacity)
				.setDynamicTooltip()
				.onChange(async (value) => {
					settings.grid_opacity = value;
					await plugin.saveSettings();
				})
		);
}
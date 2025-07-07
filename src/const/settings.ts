import type { BreadcrumbsSettings } from "src/interfaces/settings";
import { blank_hierarchy } from "src/utils/hierarchies";

export const DEFAULT_SETTINGS: BreadcrumbsSettings = {
	hierarchies: [
		{
			dirs: {
				up: ["up", "depends_on"],
				same: ["same", "evolves_to", "evolved_from"],
				down: ["down", "enables"],
				next: ["next"],
				prev: ["prev"],
			},
			implied_relationships: blank_hierarchy().implied_relationships,
		},
	],

	explicit_edge_sources: {
		tag_note: {},
		list_note: {},
		typed_link: {},
	},

	views: {
		page: {
			all: {
				readable_line_width: true,
			},

			grid: {
				enabled: true,
				show_node_options: {
					ext: false,
					folder: false,
					alias: false,
				},
			},
			prev_next: {
				enabled: true,
				show_node_options: {
					ext: false,
					folder: false,
					alias: false,
				},
			},
		},
		side: {
			matrix: {
				show_node_options: {
					ext: false,
					folder: true,
					alias: false,
				},
			},
		},
	},
};

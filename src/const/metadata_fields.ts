const METADATA_FIELDS_LIST = [
	// BREAKING: 17-01-2024 - This used to be called "BC-tag-note"
	"BC-tag-note-tag",
	"BC-tag-note-field",
	"BC-tag-note-exact",
	//
	// BREAKING: 17-01-2024 - These used to be "Hierarchy Notes". They didn't have a field (I think)
	//   rather, you specified them in settings
	"BC-list-note-field",
	"BC-list-note-exclude-index",
	//
	// Strategic mapping fields
	"BC-strategic-type",
	"BC-strategic-evolution-stage",
	"BC-strategic-importance",
	"BC-strategic-confidence",
	"BC-strategic-evidence",
	"BC-strategic-validated",
	"BC-strategic-maps",
] as const;

export type MetadataField = (typeof METADATA_FIELDS_LIST)[number];

export const META_FIELD = {
	"tag-note-tag": "BC-tag-note-tag",
	"tag-note-field": "BC-tag-note-field",
	"tag-note-exact": "BC-tag-note-exact",
	//
	"list-note-field": "BC-list-note-field",
	"list-note-exclude-index": "BC-list-note-exclude-index",
	//
	"strategic-type": "BC-strategic-type",
	"strategic-evolution-stage": "BC-strategic-evolution-stage",
	"strategic-importance": "BC-strategic-importance",
	"strategic-confidence": "BC-strategic-confidence",
	"strategic-evidence": "BC-strategic-evidence",
	"strategic-validated": "BC-strategic-validated",
	"strategic-maps": "BC-strategic-maps",
} satisfies Record<string, MetadataField>;

if (Object.keys(META_FIELD).length !== METADATA_FIELDS_LIST.length) {
	throw new Error("Missing keys in META_FIELD");
}

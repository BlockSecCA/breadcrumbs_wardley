import type { CachedMetadata } from "obsidian";
import type { StrategicAttributes, StrategicType, EvolutionStage, StrategicImportance, ConfidenceLevel } from "src/interfaces/strategic";
import { STRATEGIC_TYPES, EVOLUTION_STAGES, STRATEGIC_IMPORTANCE, CONFIDENCE_LEVELS } from "src/interfaces/strategic";
import { META_FIELD } from "src/const/metadata_fields";
import type { DataviewPage } from "src/external/dataview/interfaces";

export function extract_strategic_metadata(cache: CachedMetadata | undefined): StrategicAttributes | undefined {
	if (!cache?.frontmatter) return undefined;

	const strategic: StrategicAttributes = {};
	const fm = cache.frontmatter;

	console.log('Strategic metadata extraction - frontmatter keys:', Object.keys(fm));
	console.log('Strategic metadata extraction - frontmatter values:', fm);

	// Extract strategic type
	const type = get_strategic_field(fm, META_FIELD["strategic-type"]);
	if (type && STRATEGIC_TYPES.includes(type as StrategicType)) {
		strategic.type = type as StrategicType;
	}

	// Extract evolution stage
	const evolution_stage = get_strategic_field(fm, META_FIELD["strategic-evolution-stage"]);
	console.log('Strategic metadata extraction - evolution_stage lookup result:', evolution_stage);
	if (evolution_stage && EVOLUTION_STAGES.includes(evolution_stage as EvolutionStage)) {
		strategic.evolution_stage = evolution_stage as EvolutionStage;
	}

	// Extract strategic importance
	const importance = get_strategic_field(fm, META_FIELD["strategic-importance"]);
	if (importance && STRATEGIC_IMPORTANCE.includes(importance as StrategicImportance)) {
		strategic.strategic_importance = importance as StrategicImportance;
	}

	// Extract confidence level
	const confidence = get_strategic_field(fm, META_FIELD["strategic-confidence"]);
	if (confidence && CONFIDENCE_LEVELS.includes(confidence as ConfidenceLevel)) {
		strategic.confidence_level = confidence as ConfidenceLevel;
	}

	// Extract evidence sources (support both field names)
	const evidence = get_strategic_field(fm, META_FIELD["strategic-evidence"]) || fm.evidence_sources;
	if (evidence) {
		strategic.evidence_sources = Array.isArray(evidence) ? evidence : [evidence];
	}

	// Extract last validated date
	const validated = get_strategic_field(fm, META_FIELD["strategic-validated"]);
	if (typeof validated === "string") {
		strategic.last_validated = validated;
	}

	// Extract strategic maps
	const maps = get_strategic_field(fm, META_FIELD["strategic-maps"]);
	if (maps) {
		strategic.strategic_maps = Array.isArray(maps) ? maps : [maps];
	}

	// Return strategic attributes only if at least one field is present
	return Object.keys(strategic).length > 0 ? strategic : undefined;
}

function get_strategic_field(frontmatter: Record<string, any>, field_name: string): any {
	// Support both BC- prefixed and non-prefixed field names for user convenience
	const prefixed_value = frontmatter[field_name];
	const unprefixed_hyphen = frontmatter[field_name.replace("BC-strategic-", "")];
	const unprefixed_underscore = frontmatter[field_name.replace("BC-strategic-", "").replace(/-/g, "_")];
	
	return prefixed_value ?? unprefixed_hyphen ?? unprefixed_underscore;
}

export function validate_strategic_metadata(strategic: StrategicAttributes): string[] {
	const errors: string[] = [];

	if (strategic.type && !STRATEGIC_TYPES.includes(strategic.type)) {
		errors.push(`Invalid strategic type: ${strategic.type}. Must be one of: ${STRATEGIC_TYPES.join(", ")}`);
	}

	if (strategic.evolution_stage && !EVOLUTION_STAGES.includes(strategic.evolution_stage)) {
		errors.push(`Invalid evolution stage: ${strategic.evolution_stage}. Must be one of: ${EVOLUTION_STAGES.join(", ")}`);
	}

	if (strategic.strategic_importance && !STRATEGIC_IMPORTANCE.includes(strategic.strategic_importance)) {
		errors.push(`Invalid strategic importance: ${strategic.strategic_importance}. Must be one of: ${STRATEGIC_IMPORTANCE.join(", ")}`);
	}

	if (strategic.confidence_level && !CONFIDENCE_LEVELS.includes(strategic.confidence_level)) {
		errors.push(`Invalid confidence level: ${strategic.confidence_level}. Must be one of: ${CONFIDENCE_LEVELS.join(", ")}`);
	}

	if (strategic.last_validated && !isValidDate(strategic.last_validated)) {
		errors.push(`Invalid date format for last_validated: ${strategic.last_validated}. Use YYYY-MM-DD format`);
	}

	return errors;
}

export function extract_strategic_metadata_from_dataview(page: DataviewPage): StrategicAttributes | undefined {
	const strategic: StrategicAttributes = {};

	// Extract strategic type
	const type = get_strategic_field_from_page(page, META_FIELD["strategic-type"]);
	if (type && STRATEGIC_TYPES.includes(type as StrategicType)) {
		strategic.type = type as StrategicType;
	}

	// Extract evolution stage
	const evolution_stage = get_strategic_field_from_page(page, META_FIELD["strategic-evolution-stage"]);
	if (evolution_stage && EVOLUTION_STAGES.includes(evolution_stage as EvolutionStage)) {
		strategic.evolution_stage = evolution_stage as EvolutionStage;
	}

	// Extract strategic importance
	const importance = get_strategic_field_from_page(page, META_FIELD["strategic-importance"]);
	if (importance && STRATEGIC_IMPORTANCE.includes(importance as StrategicImportance)) {
		strategic.strategic_importance = importance as StrategicImportance;
	}

	// Extract confidence level
	const confidence = get_strategic_field_from_page(page, META_FIELD["strategic-confidence"]);
	if (confidence && CONFIDENCE_LEVELS.includes(confidence as ConfidenceLevel)) {
		strategic.confidence_level = confidence as ConfidenceLevel;
	}

	// Extract evidence sources (support both field names)
	const evidence = get_strategic_field_from_page(page, META_FIELD["strategic-evidence"]) || page.evidence_sources;
	if (evidence) {
		strategic.evidence_sources = Array.isArray(evidence) ? evidence : [evidence];
	}

	// Extract last validated date
	const validated = get_strategic_field_from_page(page, META_FIELD["strategic-validated"]);
	if (typeof validated === "string") {
		strategic.last_validated = validated;
	}

	// Extract strategic maps
	const maps = get_strategic_field_from_page(page, META_FIELD["strategic-maps"]);
	if (maps) {
		strategic.strategic_maps = Array.isArray(maps) ? maps : [maps];
	}

	// Return strategic attributes only if at least one field is present
	return Object.keys(strategic).length > 0 ? strategic : undefined;
}

function get_strategic_field_from_page(page: DataviewPage, field_name: string): any {
	// Support both BC- prefixed and non-prefixed field names for user convenience
	const prefixed_value = page[field_name];
	const unprefixed_value = page[field_name.replace("BC-strategic-", "")];
	
	return prefixed_value ?? unprefixed_value;
}

function isValidDate(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}
export const STRATEGIC_TYPES = [
	"component",
	"user_need", 
	"capability",
	"product",
	"service",
] as const;

export type StrategicType = (typeof STRATEGIC_TYPES)[number];

export const EVOLUTION_STAGES = [
	"genesis",
	"custom",
	"product", 
	"commodity",
] as const;

export type EvolutionStage = (typeof EVOLUTION_STAGES)[number];

export const STRATEGIC_IMPORTANCE = [
	"critical",
	"important",
	"supporting",
	"optional",
] as const;

export type StrategicImportance = (typeof STRATEGIC_IMPORTANCE)[number];

export const CONFIDENCE_LEVELS = [
	"high",
	"medium",
	"low",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface StrategicAttributes {
	type?: StrategicType;
	evolution_stage?: EvolutionStage;
	strategic_importance?: StrategicImportance;
	confidence_level?: ConfidenceLevel;
	evidence_sources?: string[];
	last_validated?: string;
	strategic_maps?: string[];
}

export interface MapContext {
	id: string;
	name: string;
	scope: "vault" | "folder" | "membership";
	description?: string;
	includes?: string[];
}

export interface StrategicValidationWarning {
	type: "low_confidence" | "missing_evidence" | "outdated_validation" | "evolution_inconsistency";
	message: string;
	component_path: string;
	severity: "high" | "medium" | "low";
}

export interface StrategicInsight {
	type: "orphaned_component" | "critical_path" | "evolution_gap" | "dependency_risk";
	message: string;
	affected_components: string[];
	priority: "high" | "medium" | "low";
}
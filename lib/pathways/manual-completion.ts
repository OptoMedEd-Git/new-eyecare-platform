import type { PathwayModuleType } from "./types";

/** Blog uses aggregate view counts only — completion is manual via pathway_module_completions. */
export function usesManualPathwayCompletion(moduleType: PathwayModuleType): boolean {
  return moduleType === "external_resource" || moduleType === "blog_post";
}

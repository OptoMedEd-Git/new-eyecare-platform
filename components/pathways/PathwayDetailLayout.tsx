"use client";

import { useState } from "react";

import type { SamplePathway } from "@/lib/pathways/sample-data";

import { CurriculumStepper } from "./CurriculumStepper";
import { MobileModuleModal } from "./MobileModuleModal";
import { ModuleDetailPanel } from "./ModuleDetailPanel";

type Props = {
  pathway: SamplePathway;
};

export function PathwayDetailLayout({ pathway }: Props) {
  const initialModule =
    pathway.curriculum.find((m) => m.status === "in_progress") ??
    pathway.curriculum.find((m) => m.status === "not_started") ??
    pathway.curriculum[0];

  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModule?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);

  const selectedModule = pathway.curriculum.find((m) => m.id === selectedModuleId) ?? null;
  const selectedIndex = pathway.curriculum.findIndex((m) => m.id === selectedModuleId);

  function handleSelect(moduleId: string) {
    setSelectedModuleId(moduleId);
    setModalOpen(true);
  }

  return (
    <>
      <section id="curriculum" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-text-heading">Curriculum</h2>
          <CurriculumStepper
            modules={pathway.curriculum}
            selectedModuleId={selectedModuleId}
            onSelect={handleSelect}
          />
        </div>

        <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <h2 className="sr-only">Module details</h2>
          <ModuleDetailPanel
            module={selectedModule}
            moduleIndex={selectedIndex >= 0 ? selectedIndex : 0}
            totalModules={pathway.curriculum.length}
            variant="panel"
          />
        </div>
      </section>

      <MobileModuleModal
        module={selectedModule}
        moduleIndex={selectedIndex >= 0 ? selectedIndex : 0}
        totalModules={pathway.curriculum.length}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

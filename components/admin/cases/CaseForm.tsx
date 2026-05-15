"use client";

import {
  createCase,
  updateCase,
  updateCaseFindings,
} from "@/app/(admin)/admin/cases/actions";
import { CaseMarkdownField } from "@/components/admin/cases/CaseMarkdownField";
import { FindingsTable } from "@/components/admin/cases/FindingsTable";
import { HelpTooltip } from "@/components/admin/HelpTooltip";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FINDINGS_TABLE_CONFIG } from "@/lib/cases/constants";
import {
  emptyFindingsFormState,
  findingsByTypeToFormState,
  type FindingsFormState,
} from "@/lib/cases/findings-form";
import type { BlogCategoryOption } from "@/lib/cases/admin-queries";
import type { CaseWithDetails, FindingRowCatalogEntry } from "@/lib/cases/types";
import { CASE_FINDING_TYPES } from "@/lib/cases/types";
import { slugifyShort } from "@/lib/blog/slugify";
import type { RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { Loader2, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

function richInitial(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY_DOC;
  return value;
}

const AUDIENCE_OPTIONS = [
  { value: "", label: "Select audience" },
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Select difficulty" },
  { value: "foundational", label: "Foundational" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const SEX_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Unspecified", label: "Unspecified" },
];

export type CaseFormProps = {
  categories: BlogCategoryOption[];
  catalog: FindingRowCatalogEntry[];
  authorName: string;
  initialCase?: CaseWithDetails;
};

export function CaseForm({ categories, catalog, authorName, initialCase }: CaseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialCase);

  const hpiRef = useRef<RichContentEditorHandle>(null);
  const poHxRef = useRef<RichContentEditorHandle>(null);
  const pmHxRef = useRef<RichContentEditorHandle>(null);
  const medsRef = useRef<RichContentEditorHandle>(null);
  const allergiesRef = useRef<RichContentEditorHandle>(null);
  const objectivesRef = useRef<RichContentEditorHandle>(null);

  const [title, setTitle] = useState(initialCase?.title ?? "");
  const [slug, setSlug] = useState(initialCase?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    Boolean(initialCase?.slug && initialCase.slug !== slugifyShort(initialCase.title ?? "")),
  );
  const [chiefComplaint, setChiefComplaint] = useState(initialCase?.chiefComplaint ?? "");
  const [patientAge, setPatientAge] = useState(
    initialCase?.patientAge != null ? String(initialCase.patientAge) : "",
  );
  const [patientEthnicity, setPatientEthnicity] = useState(initialCase?.patientEthnicity ?? "");

  const [findings, setFindings] = useState<FindingsFormState>(() =>
    initialCase ? findingsByTypeToFormState(initialCase.findingsByType, catalog) : emptyFindingsFormState(),
  );

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Select a category" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const categorySelectKey = isEdit ? `${initialCase!.id}-${initialCase!.updatedAt}` : "case-category-new";

  function markDirty() {
    setDirty(true);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    markDirty();
    if (!slugManuallyEdited) {
      setSlug(slugifyShort(newTitle));
    }
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    setSlugManuallyEdited(true);
    markDirty();
  }

  function regenerateSlug() {
    setSlug(slugifyShort(title));
    setSlugManuallyEdited(false);
    markDirty();
  }

  function appendRichFields(fd: FormData) {
    fd.set("hpi", JSON.stringify(hpiRef.current?.getJSON() ?? { type: "doc", content: [] }));
    fd.set(
      "past_ocular_history",
      JSON.stringify(poHxRef.current?.getJSON() ?? { type: "doc", content: [] }),
    );
    fd.set(
      "past_medical_history",
      JSON.stringify(pmHxRef.current?.getJSON() ?? { type: "doc", content: [] }),
    );
    fd.set("medications", JSON.stringify(medsRef.current?.getJSON() ?? { type: "doc", content: [] }));
    fd.set("allergies", JSON.stringify(allergiesRef.current?.getJSON() ?? { type: "doc", content: [] }));
    fd.set(
      "learning_objectives",
      JSON.stringify(objectivesRef.current?.getJSON() ?? { type: "doc", content: [] }),
    );
  }

  async function handleSave() {
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(form);
      appendRichFields(fd);

      if (isEdit && initialCase) {
        const caseResult = await updateCase(initialCase.id, fd);
        if (!caseResult.ok) {
          setError(caseResult.error);
          return;
        }

        const findingsResult = await updateCaseFindings(
          initialCase.id,
          JSON.stringify(findings),
        );
        if (!findingsResult.ok) {
          setError(findingsResult.error);
          return;
        }

        setDirty(false);
        router.refresh();
        return;
      }

      const createResult = await createCase(fd);
      if (!createResult.ok) {
        setError(createResult.error);
        return;
      }

      const caseId = createResult.data?.caseId;
      if (!caseId) {
        setError("Case was created but no id was returned");
        return;
      }

      const findingsResult = await updateCaseFindings(caseId, JSON.stringify(findings));
      if (!findingsResult.ok) {
        setError(findingsResult.error);
        return;
      }

      setDirty(false);
      router.push(`/admin/cases/${caseId}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="w-full">
      <UnsavedChangesGuard dirty={dirty && !saving} onSave={handleSave} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-heading">
            {isEdit ? "Edit case" : "New case"}
          </h1>
          {isEdit && initialCase ? (
            <div className="mt-2">
              <PostStatusPill status={initialCase.status} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {error ? <Alert variant="error" title="Could not save" message={error} /> : null}

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-text-heading">Case metadata</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <FormInput
                label="Title"
                name="title"
                id="case-title"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <FormInput
                      label={isEdit ? "URL slug" : "URL slug (auto-generated)"}
                      name="slug"
                      id="case-slug"
                      required={isEdit}
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    title="Regenerate slug from title"
                    aria-label="Regenerate slug from title"
                    onClick={regenerateSlug}
                    disabled={saving}
                    className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary-soft text-text-muted transition-colors hover:border-border-default-medium hover:text-text-heading disabled:opacity-50"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  Lowercase letters, numbers, and hyphens. Used in public URLs when published.
                </p>
              </div>

              <div>
                <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
                  Author
                  <HelpTooltip content="The case author is set when the case is created and cannot be changed." />
                </label>
                <input
                  type="text"
                  value={authorName}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
                />
              </div>
            </div>

            <div className="space-y-6">
              <FormSelect
                key={categorySelectKey}
                label="Category"
                name="category_id"
                id="case-category"
                required
                options={categoryOptions}
                defaultValue={initialCase?.category.id ?? ""}
                onChange={() => markDirty()}
              />
              <FormSelect
                label="Difficulty"
                name="difficulty"
                id="case-difficulty"
                required
                options={DIFFICULTY_OPTIONS}
                defaultValue={initialCase?.difficulty ?? ""}
                onChange={() => markDirty()}
              />
              <FormSelect
                label="Audience"
                name="target_audience"
                id="case-audience"
                required
                options={AUDIENCE_OPTIONS}
                defaultValue={initialCase?.audience ?? ""}
                onChange={() => markDirty()}
              />
              <FormSelect
                label="Status"
                name="status"
                id="case-status"
                options={STATUS_OPTIONS}
                defaultValue={initialCase?.status ?? "draft"}
                onChange={() => markDirty()}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-text-heading">Patient context</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormInput
              label="Chief complaint"
              name="chief_complaint"
              id="case-chief-complaint"
              value={chiefComplaint}
              onChange={(e) => {
                setChiefComplaint(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Blurred vision OD for 2 weeks"
            />
            <FormInput
              label="Patient age"
              name="patient_age"
              id="case-patient-age"
              type="number"
              min={0}
              max={150}
              value={patientAge}
              onChange={(e) => {
                setPatientAge(e.target.value);
                markDirty();
              }}
            />
            <FormSelect
              label="Patient sex"
              name="patient_sex"
              id="case-patient-sex"
              options={SEX_OPTIONS}
              defaultValue={initialCase?.patientSex ?? ""}
              onChange={() => markDirty()}
            />
            <FormInput
              label="Patient ethnicity"
              name="patient_ethnicity"
              id="case-patient-ethnicity"
              value={patientEthnicity}
              onChange={(e) => {
                setPatientEthnicity(e.target.value);
                markDirty();
              }}
              placeholder="Optional — clinical context when relevant"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-text-heading">Clinical history</h2>
          <div className="space-y-6">
            <CaseMarkdownField
              ref={poHxRef}
              label="Past ocular history"
              initialContent={richInitial(initialCase?.pastOcularHistory)}
              onUpdate={markDirty}
              disabled={saving}
            />
            <CaseMarkdownField
              ref={pmHxRef}
              label="Past medical history"
              initialContent={richInitial(initialCase?.pastMedicalHistory)}
              onUpdate={markDirty}
              disabled={saving}
            />
            <CaseMarkdownField
              ref={medsRef}
              label="Medications"
              initialContent={richInitial(initialCase?.medications)}
              onUpdate={markDirty}
              disabled={saving}
            />
            <CaseMarkdownField
              ref={allergiesRef}
              label="Allergies"
              initialContent={richInitial(initialCase?.allergies)}
              onUpdate={markDirty}
              disabled={saving}
            />
            <CaseMarkdownField
              ref={hpiRef}
              label="HPI / clinical narrative"
              initialContent={richInitial(initialCase?.hpi)}
              onUpdate={markDirty}
              disabled={saving}
            />
            <CaseMarkdownField
              ref={objectivesRef}
              label="Learning objectives"
              initialContent={richInitial(initialCase?.learningObjectives)}
              onUpdate={markDirty}
              disabled={saving}
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-text-heading">Clinical findings</h2>
          <p className="text-sm text-text-body">
            Include only the examination sections that apply to this case. Each included table lists
            all standard rows; leave cells blank for findings you do not document.
          </p>
          <div className="flex flex-col gap-8">
            {CASE_FINDING_TYPES.map((findingType) => {
              const config = FINDINGS_TABLE_CONFIG[findingType];
              return (
                <FindingsTable
                  key={findingType}
                  findingType={findingType}
                  title={config.title}
                  subtitle={config.subtitle}
                  catalogRows={catalog}
                  value={findings[findingType]}
                  disabled={saving}
                  onChange={(next) => {
                    setFindings((prev) => ({ ...prev, [findingType]: next }));
                    markDirty();
                  }}
                />
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-default pt-6">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                {isEdit ? "Save changes" : "Save draft"}
              </>
            )}
          </button>
          <Link
            href="/admin/cases"
            className="inline-flex items-center rounded-base border border-border-default bg-bg-primary-soft px-4 py-2.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}

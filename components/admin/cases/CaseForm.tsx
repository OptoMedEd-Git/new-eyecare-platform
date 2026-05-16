"use client";

import {
  createCase,
  updateCase,
  updateCaseFindings,
  updateCaseHistorySelections,
} from "@/app/(admin)/admin/cases/actions";
import { CaseFormCard } from "@/components/admin/cases/CaseFormCard";
import { CaseFormComingSoonPanel } from "@/components/admin/cases/CaseFormComingSoonPanel";
import { CaseMarkdownField } from "@/components/admin/cases/CaseMarkdownField";
import { FindingsTable } from "@/components/admin/cases/FindingsTable";
import { HistoryConditionsField } from "@/components/admin/cases/HistoryConditionsField";
import { HelpTooltip } from "@/components/admin/HelpTooltip";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import type { BlogCategoryOption } from "@/lib/cases/admin-queries";
import { FINDINGS_TABLE_CONFIG } from "@/lib/cases/constants";
import {
  emptyFindingsFormState,
  findingsByTypeToFormState,
  type FindingsFormState,
} from "@/lib/cases/findings-form";
import {
  emptyMedicalFormRows,
  emptyOcularFormRows,
  medicalSelectionsToFormRows,
  ocularSelectionsToFormRows,
  type MedicalConditionFormRow,
  type OcularConditionFormRow,
} from "@/lib/cases/history-form";
import { historyFieldToPlainText } from "@/lib/cases/plain-text";
import { composeCaseTitle } from "@/lib/cases/title";
import type {
  CasePatientSex,
  CaseWithDetails,
  FindingRowCatalogEntry,
  MedicalHistoryCondition,
  OcularHistoryCondition,
} from "@/lib/cases/types";
import { CASE_FINDING_TYPES } from "@/lib/cases/types";
import { slugifyShort } from "@/lib/blog/slugify";
import type { RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { Loader2, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

const textareaClass =
  "w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-body shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-border-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

function richInitial(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY_DOC;
  return value;
}

function composedTitleFromCase(initialCase: CaseWithDetails): string {
  return composeCaseTitle({
    patientAge: initialCase.patientAge,
    patientSex: initialCase.patientSex,
    chiefComplaint: initialCase.chiefComplaint,
  });
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
  ocularCatalog: OcularHistoryCondition[];
  medicalCatalog: MedicalHistoryCondition[];
  authorName: string;
  initialCase?: CaseWithDetails;
};

function PlainTextarea({
  label,
  name,
  id,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: {
  label: string;
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-text-heading">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={textareaClass}
      />
    </div>
  );
}

export function CaseForm({
  categories,
  catalog,
  ocularCatalog,
  medicalCatalog,
  authorName,
  initialCase,
}: CaseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialCase);

  const hpiRef = useRef<RichContentEditorHandle>(null);
  const objectivesRef = useRef<RichContentEditorHandle>(null);

  const [title, setTitle] = useState(initialCase?.title ?? "");
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(() =>
    initialCase ? initialCase.title !== composedTitleFromCase(initialCase) : false,
  );
  const [slug, setSlug] = useState(initialCase?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    Boolean(initialCase?.slug && initialCase.slug !== slugifyShort(initialCase.title ?? "")),
  );
  const [chiefComplaint, setChiefComplaint] = useState(initialCase?.chiefComplaint ?? "");
  const [patientAge, setPatientAge] = useState(
    initialCase?.patientAge != null ? String(initialCase.patientAge) : "",
  );
  const [patientSex, setPatientSex] = useState<CasePatientSex | "">(initialCase?.patientSex ?? "");
  const [patientEthnicity, setPatientEthnicity] = useState(initialCase?.patientEthnicity ?? "");

  const [pastOcularOther, setPastOcularOther] = useState(() =>
    historyFieldToPlainText(initialCase?.pastOcularHistory),
  );
  const [pastMedicalOther, setPastMedicalOther] = useState(() =>
    historyFieldToPlainText(initialCase?.pastMedicalHistory),
  );
  const [medications, setMedications] = useState(() =>
    historyFieldToPlainText(initialCase?.medications),
  );
  const [allergies, setAllergies] = useState(() =>
    historyFieldToPlainText(initialCase?.allergies),
  );

  const [ocularRows, setOcularRows] = useState<OcularConditionFormRow[]>(() =>
    initialCase
      ? ocularSelectionsToFormRows(ocularCatalog, initialCase.ocularHistory)
      : emptyOcularFormRows(ocularCatalog),
  );
  const [medicalRows, setMedicalRows] = useState<MedicalConditionFormRow[]>(() =>
    initialCase
      ? medicalSelectionsToFormRows(medicalCatalog, initialCase.medicalHistory)
      : emptyMedicalFormRows(medicalCatalog),
  );

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

  const parsedAge = useMemo(() => {
    const raw = patientAge.trim();
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }, [patientAge]);

  const derivedTitle = useMemo(
    () =>
      composeCaseTitle({
        patientAge: parsedAge,
        patientSex: patientSex || null,
        chiefComplaint,
      }),
    [parsedAge, patientSex, chiefComplaint],
  );

  const effectiveTitle = titleManuallyEdited ? title : derivedTitle;
  const effectiveSlug = slugManuallyEdited ? slug : slugifyShort(effectiveTitle);

  function markDirty() {
    setDirty(true);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    setTitleManuallyEdited(true);
    markDirty();
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    setSlugManuallyEdited(true);
    markDirty();
  }

  function regenerateSlug() {
    setSlug(slugifyShort(effectiveTitle));
    setSlugManuallyEdited(false);
    markDirty();
  }

  function regenerateTitle() {
    if (
      titleManuallyEdited &&
      !window.confirm("Replace your custom title with an auto-generated one from patient context?")
    ) {
      return;
    }
    setTitleManuallyEdited(false);
    if (!slugManuallyEdited) {
      setSlug(slugifyShort(derivedTitle));
    }
    markDirty();
  }

  function appendRichFields(fd: FormData) {
    fd.set("hpi", JSON.stringify(hpiRef.current?.getJSON() ?? { type: "doc", content: [] }));
    fd.set(
      "learning_objectives",
      JSON.stringify(objectivesRef.current?.getJSON() ?? { type: "doc", content: [] }),
    );
  }

  function appendChildTableFields(fd: FormData) {
    fd.set("findings_json", JSON.stringify(findings));
    fd.set("history_selections", JSON.stringify({ ocular: ocularRows, medical: medicalRows }));
  }

  async function saveChildTablesAfterCreate(caseId: string): Promise<string | null> {
    const historyResult = await updateCaseHistorySelections(
      caseId,
      JSON.stringify({ ocular: ocularRows, medical: medicalRows }),
    );
    if (!historyResult.ok) return historyResult.error;

    const findingsResult = await updateCaseFindings(caseId, JSON.stringify(findings));
    if (!findingsResult.ok) return findingsResult.error;

    return null;
  }

  async function handleSave() {
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(form);
      appendRichFields(fd);
      appendChildTableFields(fd);

      if (isEdit && initialCase) {
        const caseResult = await updateCase(initialCase.id, fd);
        if (!caseResult.ok) {
          setError(caseResult.error);
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

      const nestedError = await saveChildTablesAfterCreate(caseId);
      if (nestedError) {
        setError(nestedError);
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

      <div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-heading">
          {isEdit ? "Edit case" : "New case"}
        </h1>
        {isEdit && initialCase ? (
          <div className="mt-2">
            <PostStatusPill status={initialCase.status} />
          </motionPlainTextarea>
        ) : null}
        {!isEdit ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-body">
            Enter case metadata, patient context, and clinical findings. Ancillary tests and questions
            can be added after saving.
          </p>
        ) : null}
      </motionPlainTextarea>

      <div className="mt-8 flex flex-col gap-10">
        {error ? <Alert variant="error" title="Could not save" message={error} /> : null}

        <CaseFormCard title="Case metadata">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <FormInput
                      label="Title"
                      name="title"
                      id="case-title"
                      required
                      value={effectiveTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    title="Regenerate title from patient context"
                    aria-label="Regenerate title from patient context"
                    onClick={regenerateTitle}
                    disabled={saving}
                    className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary-soft text-text-muted transition-colors hover:border-border-default-medium hover:text-text-heading disabled:opacity-50"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  Auto-generated from age, sex, and chief complaint unless you edit it manually.
                </p>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <FormInput
                      label={isEdit ? "URL slug" : "URL slug (auto-generated)"}
                      name="slug"
                      id="case-slug"
                      required={isEdit}
                      value={effectiveSlug}
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
        </CaseFormCard>

        <CaseFormCard
          title="Patient context"
          description="Demographics, presenting complaint, and clinical history for this case."
        >
          <div className="grid gap-6 sm:grid-cols-3">
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
              key={`case-patient-sex-${patientSex}`}
              label="Patient sex"
              name="patient_sex"
              id="case-patient-sex"
              options={SEX_OPTIONS}
              defaultValue={patientSex}
              onChange={(e) => {
                setPatientSex(e.target.value as CasePatientSex | "");
                markDirty();
              }}
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
          <CaseMarkdownField
            ref={hpiRef}
            label="History of present illness"
            initialContent={richInitial(initialCase?.hpi)}
            onUpdate={markDirty}
            disabled={saving}
          />

          <div className="mt-8 space-y-8 border-t border-border-default pt-8">
            <div>
              <h3 className="text-lg font-semibold text-text-heading">Clinical history</h3>
              <p className="mt-1 text-sm text-text-body">
                Select common conditions or enter free text under Other when needed.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-heading">Past ocular history</h3>
              <HistoryConditionsField
                variant="ocular"
                catalog={ocularCatalog}
                rows={ocularRows}
                disabled={saving}
                onChange={(rows) => {
                  setOcularRows(rows);
                  markDirty();
                }}
              />
              <PlainTextarea
                label="Other"
                name="past_ocular_history"
                id="case-poh-other"
                value={pastOcularOther}
                disabled={saving}
                placeholder="Unlisted ocular history"
                onChange={(v) => {
                  setPastOcularOther(v);
                  markDirty();
                }}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-heading">Past medical history</h3>
              <HistoryConditionsField
                variant="medical"
                catalog={medicalCatalog}
                rows={medicalRows}
                disabled={saving}
                onChange={(rows) => {
                  setMedicalRows(rows);
                  markDirty();
                }}
              />
              <PlainTextarea
                label="Other"
                name="past_medical_history"
                id="case-pmh-other"
                value={pastMedicalOther}
                disabled={saving}
                placeholder="Unlisted medical history"
                onChange={(v) => {
                  setPastMedicalOther(v);
                  markDirty();
                }}
              />
            </div>

            <PlainTextarea
              label="Medications"
              name="medications"
              id="case-medications"
              value={medications}
              disabled={saving}
              rows={2}
              onChange={(v) => {
                setMedications(v);
                markDirty();
              }}
            />
            <PlainTextarea
              label="Allergies"
              name="allergies"
              id="case-allergies"
              value={allergies}
              disabled={saving}
              rows={2}
              onChange={(v) => {
                setAllergies(v);
                markDirty();
              }}
            />
            <CaseMarkdownField
              ref={objectivesRef}
              label="Learning objectives"
              initialContent={richInitial(initialCase?.learningObjectives)}
              onUpdate={markDirty}
              disabled={saving}
            />
          </div>
        </CaseFormCard>

        <CaseFormCard
          title="Clinical findings"
          description="Include only the examination sections that apply. Each included table lists all standard rows; leave cells blank for findings you do not document."
        >
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

          <div className="mt-10 space-y-8 border-t border-border-default pt-8">
            <CaseFormComingSoonPanel
              title="Ancillary testing"
              description="Order and document ancillary tests for this case."
            />
            <CaseFormComingSoonPanel
              title="Media upload"
              description="Attach images and files to ancillary tests."
            />
          </div>
        </CaseFormCard>

        <CaseFormCard title="Learning content">
          <CaseFormComingSoonPanel
            title="Case questions"
            description="Attach existing quiz-bank questions to this case and set their order."
          />
        </CaseFormCard>

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

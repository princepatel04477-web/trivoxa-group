"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getAllCategoriesWithIndustry } from "@/lib/data/industries";
import { INCOTERMS, QUANTITY_UNITS, rfqCompanySchema, rfqProductSchema, rfqSchema, rfqTermsSchema } from "@/lib/validation/rfq";

const STEPS = ["Company", "Product", "Terms"] as const;

interface FormState {
  companyName: string;
  contactName: string;
  email: string;
  whatsapp: string;
  importCountry: string;
  destinationPort: string;
  categoryKey: string;
  hsCode: string;
  quantity: string;
  unit: (typeof QUANTITY_UNITS)[number];
  priceBand: string;
  incoterm: (typeof INCOTERMS)[number];
  deliveryStart: string;
  deliveryEnd: string;
  sampleRequired: "yes" | "no";
  notes: string;
}

const categoryKeyOf = (industrySlug: string, categoryName: string) => `${industrySlug}::${categoryName}`;

const STEP_SCHEMAS = [rfqCompanySchema, rfqProductSchema, rfqTermsSchema];

export default function RfqForm() {
  const searchParams = useSearchParams();
  const categoryOptions = useMemo(() => getAllCategoriesWithIndustry(), []);
  const presetSlug = searchParams.get("category");

  const initial = useMemo(() => {
    const preferred = categoryOptions.find((c) => c.industrySlug === presetSlug) ?? categoryOptions[0];
    return preferred;
  }, [categoryOptions, presetSlug]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    companyName: "",
    contactName: "",
    email: "",
    whatsapp: "",
    importCountry: "",
    destinationPort: "",
    categoryKey: initial ? categoryKeyOf(initial.industrySlug, initial.category.name) : "",
    hsCode: initial?.category.hsCode ?? "",
    quantity: "",
    unit: "MT",
    priceBand: "",
    incoterm: "FOB",
    deliveryStart: "",
    deliveryEnd: "",
    sampleRequired: "no",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onCategoryChange(key: string) {
    const match = categoryOptions.find((c) => categoryKeyOf(c.industrySlug, c.category.name) === key);
    setForm((f) => ({ ...f, categoryKey: key, hsCode: match?.category.hsCode ?? f.hsCode }));
  }

  function validateStep(index: number): boolean {
    const parsed = STEP_SCHEMAS[index].safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const parsed = rfqSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      const failingStep = STEP_SCHEMAS.findIndex((schema) => !schema.safeParse(form).success);
      if (failingStep !== -1) setStep(failingStep);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed. Please try again.");
      setReference(json.reference);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="rfq-confirm">
        <span className="tvx-eyebrow">RFQ Received</span>
        <h2>Reference #{reference}</h2>
        <p>Our team responds within 24 business hours (IST) via the email and WhatsApp number you provided.</p>
        <div className="rfq-confirm__next">
          <span className="ind-drawer__eyebrow">What Happens Next</span>
          <ol>
            <li>Our sourcing team reviews your requirement against current factory capacity.</li>
            <li>You receive a formal quotation with pricing, lead time, and payment terms.</li>
            <li>Once confirmed, we issue a proforma invoice and begin production scheduling.</li>
          </ol>
        </div>
        <Link className="tvx-btn tvx-btn--primary" href="/industries/">
          Browse More Industries
        </Link>
      </div>
    );
  }

  return (
    <div className="rfq-form">
      <div className="rfq-progress">
        <div className="rfq-progress__bar">
          <div className="rfq-progress__fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
        {STEPS.map((label, i) => (
          <div key={label} className={`rfq-progress__step${i <= step ? " is-active" : ""}`}>
            <span className="rfq-progress__n">{String(i + 1).padStart(2, "0")}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 0 && (
            <div className="rfq-grid">
              <Field label="Company Name" error={errors.companyName}>
                <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </Field>
              <Field label="Contact Name" error={errors.contactName}>
                <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
              </Field>
              <Field label="Business Email" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="WhatsApp Number" error={errors.whatsapp}>
                <PhoneInput international defaultCountry="IN" value={form.whatsapp} onChange={(v) => update("whatsapp", v ?? "")} />
              </Field>
              <Field label="Country of Import" error={errors.importCountry}>
                <input value={form.importCountry} onChange={(e) => update("importCountry", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="rfq-grid">
              <Field label="Destination Port" error={errors.destinationPort}>
                <input value={form.destinationPort} onChange={(e) => update("destinationPort", e.target.value)} />
              </Field>
              <Field label="Product Category" error={errors.categoryKey}>
                <select value={form.categoryKey} onChange={(e) => onCategoryChange(e.target.value)}>
                  {categoryOptions.map((c) => (
                    <option key={categoryKeyOf(c.industrySlug, c.category.name)} value={categoryKeyOf(c.industrySlug, c.category.name)}>
                      {c.industryName} — {c.category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="HS Code" error={errors.hsCode}>
                <input value={form.hsCode} onChange={(e) => update("hsCode", e.target.value)} />
              </Field>
              <Field label="Quantity" error={errors.quantity}>
                <input type="number" min="0" step="any" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
              </Field>
              <Field label="Unit">
                <select value={form.unit} onChange={(e) => update("unit", e.target.value as FormState["unit"])}>
                  {QUANTITY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Target Price Band (optional)">
                <input placeholder="e.g. $2.10–$2.40 / kg" value={form.priceBand} onChange={(e) => update("priceBand", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="rfq-grid">
              <Field label="Preferred Incoterm" error={errors.incoterm}>
                <select value={form.incoterm} onChange={(e) => update("incoterm", e.target.value as FormState["incoterm"])}>
                  {INCOTERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Delivery Window — From" error={errors.deliveryStart}>
                <input type="date" value={form.deliveryStart} onChange={(e) => update("deliveryStart", e.target.value)} />
              </Field>
              <Field label="Delivery Window — To" error={errors.deliveryEnd}>
                <input type="date" value={form.deliveryEnd} onChange={(e) => update("deliveryEnd", e.target.value)} />
              </Field>
              <Field label="Sample Required">
                <div className="rfq-toggle">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={form.sampleRequired === v ? "is-active" : ""}
                      onClick={() => update("sampleRequired", v)}
                    >
                      {v === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Additional Notes" full>
                <textarea rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </Field>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {submitError && <p className="rfq-error">{submitError}</p>}

      <div className="rfq-actions">
        {step > 0 && (
          <button type="button" className="tvx-btn tvx-btn--ghost" onClick={goBack}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" className="tvx-btn tvx-btn--primary" onClick={goNext}>
            Continue
          </button>
        )}
        {step === STEPS.length - 1 && (
          <button type="button" className="tvx-btn tvx-btn--primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting…" : "Submit RFQ"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`rfq-field${full ? " rfq-field--full" : ""}`}>
      <span className="rfq-field__label">{label}</span>
      {children}
      {error && <span className="rfq-field__error">{error}</span>}
    </label>
  );
}

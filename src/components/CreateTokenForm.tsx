"use client";

import { SiSolana, SiTelegram, SiX } from "@icons-pack/react-simple-icons";
import { Check, Info, Loader2, Rocket } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { LaunchSuccessToast } from "@/components/LaunchSuccessToast";
import { SocialPlatformSelector } from "@/components/SocialPlatformSelector";
import { SocialRecipientCard } from "@/components/SocialRecipientCard";
import { TokenImageUpload } from "@/components/TokenImageUpload";
import { Button } from "@/components/ui/Button";
import { Field, InputShell, TextArea, TextInput } from "@/components/ui/Field";
import { Badge, Eyebrow } from "@/components/ui/primitives";
import { E2W_TOKEN } from "@/config/token";
import { cn } from "@/lib/cn";
import { feeRoutingProvider } from "@/lib/fee-routing";
import {
  formatHandle,
  getPlatform,
  isValidHandle,
  normalizeHandle,
} from "@/lib/platforms";
import type { PlatformId } from "@/lib/platforms";

interface FormState {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string | null;
  platform: PlatformId;
  handle: string;
  website: string;
  x: string;
  telegram: string;
  openingBuy: string;
}

const INITIAL: FormState = {
  name: "",
  ticker: "",
  description: "",
  imageUrl: null,
  platform: "x",
  handle: "",
  website: "",
  x: "",
  telegram: "",
  openingBuy: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

/** The stages shown while the demo launch "runs". */
const STAGES = ["Preparing token", "Configuring recipient", "Finalizing demo"] as const;

const MAX_NAME = 32;
const MAX_TICKER = 10;
const MAX_DESCRIPTION = 280;

function validate(form: FormState): Errors {
  const errors: Errors = {};

  if (!form.name.trim()) errors.name = "Token name is required.";
  else if (form.name.trim().length < 2) errors.name = "Use at least 2 characters.";

  const ticker = form.ticker.trim();
  if (!ticker) errors.ticker = "Ticker is required.";
  else if (!/^[A-Za-z0-9]{2,10}$/.test(ticker))
    errors.ticker = "2–10 letters or numbers, no spaces.";

  if (!form.description.trim()) errors.description = "Add a short description.";

  if (!form.imageUrl) errors.imageUrl = "A token image is required.";

  if (!normalizeHandle(form.handle)) errors.handle = "Recipient handle is required.";
  else if (!isValidHandle(form.handle))
    errors.handle = "Use letters, numbers, dots, dashes or underscores.";

  if (form.website.trim() && !/^https?:\/\/.+\..+/.test(form.website.trim()))
    errors.website = "Enter a full URL starting with https://";

  const buy = form.openingBuy.trim();
  if (buy) {
    const amount = Number(buy);
    if (!Number.isFinite(amount) || amount < 0) errors.openingBuy = "Enter a valid amount.";
    else if (amount > 1000) errors.openingBuy = "Keep the demo amount under 1000 SOL.";
  }

  return errors;
}

export function CreateTokenForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [toast, setToast] = useState<{
    name: string;
    ticker: string;
    recipient: string;
  } | null>(null);

  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  // Release the object URL when the selection changes or the form unmounts, so
  // replacing or resetting the image does not leak blobs.
  useEffect(() => {
    const url = form.imageUrl;
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [form.imageUrl]);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const platform = getPlatform(form.platform);
  const tickerDisplay = form.ticker.trim().toUpperCase() || "EXAMPLE";
  const recipientDisplay = formatHandle(form.platform, form.handle);

  const reset = useCallback(() => {
    setForm(INITIAL);
    setErrors({});
    setStage(0);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const found = validate(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen reader users
      // are not left guessing.
      const firstKey = Object.keys(found)[0];
      document
        .querySelector<HTMLElement>(`[name="${firstKey}"], #field-${firstKey}`)
        ?.focus();
      return;
    }

    setSubmitting(true);
    setStage(0);

    // Record the recipient with the local demo provider. This moves no money.
    void feeRoutingProvider.createRecipient({
      platform: form.platform,
      handle: form.handle,
    });

    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setStage(1), 560),
      window.setTimeout(() => setStage(2), 1180),
      window.setTimeout(() => {
        setToast({
          name: form.name.trim(),
          ticker: tickerDisplay,
          recipient: recipientDisplay,
        });
        setSubmitting(false);
        reset();
      }, 1720),
    ];
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start lg:gap-12">
        <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-10">
          {/* ─────────────── Token ─────────────── */}
          <fieldset disabled={submitting} className="min-w-0 space-y-5">
            <legend className="mb-5 flex items-center gap-3">
              <span className="text-[15px] font-semibold">Token</span>
              <span className="h-px flex-1 bg-line" />
            </legend>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="field-name"
                label="Token name"
                error={errors.name}
                meta={`${form.name.length}/${MAX_NAME}`}
              >
                <InputShell invalid={Boolean(errors.name)}>
                  <TextInput
                    id="field-name"
                    name="name"
                    value={form.name}
                    maxLength={MAX_NAME}
                    autoComplete="off"
                    placeholder="Example Coin"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "field-name-error" : undefined}
                    onChange={(event) => set("name", event.target.value)}
                  />
                </InputShell>
              </Field>

              <Field
                id="field-ticker"
                label="Ticker"
                error={errors.ticker}
                hint="Shown as $TICKER across the product."
              >
                <InputShell invalid={Boolean(errors.ticker)}>
                  <span aria-hidden className="mr-1 font-mono text-[15px] text-fg-muted">
                    $
                  </span>
                  <TextInput
                    id="field-ticker"
                    name="ticker"
                    value={form.ticker}
                    maxLength={MAX_TICKER}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="EXAMPLE"
                    aria-invalid={Boolean(errors.ticker)}
                    aria-describedby={
                      errors.ticker ? "field-ticker-error" : "field-ticker-hint"
                    }
                    className="font-mono uppercase"
                    onChange={(event) =>
                      set("ticker", event.target.value.replace(/[^A-Za-z0-9]/g, ""))
                    }
                  />
                </InputShell>
              </Field>
            </div>

            <Field
              id="field-description"
              label="Description"
              error={errors.description}
              meta={`${form.description.length}/${MAX_DESCRIPTION}`}
            >
              <TextArea
                id="field-description"
                name="description"
                value={form.description}
                maxLength={MAX_DESCRIPTION}
                placeholder="What is this token about, and who is it for?"
                invalid={Boolean(errors.description)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "field-description-error" : undefined
                }
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>

            <TokenImageUpload
              value={form.imageUrl}
              error={errors.imageUrl}
              onChange={(previewUrl) => set("imageUrl", previewUrl)}
            />
          </fieldset>

          {/* ───────────── Recipient ───────────── */}
          <fieldset disabled={submitting} className="min-w-0 space-y-5">
            <legend className="mb-5 flex items-center gap-3">
              <span className="text-[15px] font-semibold">Recipient</span>
              <span className="h-px flex-1 bg-line" />
            </legend>

            <div>
              <p className="mb-3 text-[13px] font-medium text-fg">Platform</p>
              <SocialPlatformSelector
                value={form.platform}
                onChange={(next) => set("platform", next)}
                label="Fee recipient platform"
                size="sm"
              />
            </div>

            <Field
              id="field-handle"
              label="Creator username"
              error={errors.handle}
              hint={
                <>
                  Written as{" "}
                  <span className="font-mono text-fg-secondary">
                    {platform.prefix}
                    {platform.placeholder}
                  </span>{" "}
                  on {platform.name}. Pasting a profile URL works too.
                </>
              }
            >
              <InputShell invalid={Boolean(errors.handle)}>
                {platform.prefix ? (
                  <span
                    aria-hidden
                    className="mr-0.5 shrink-0 font-mono text-[15px] text-fg-muted"
                  >
                    {platform.prefix}
                  </span>
                ) : null}
                <TextInput
                  id="field-handle"
                  name="handle"
                  value={form.handle}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={platform.placeholder}
                  aria-invalid={Boolean(errors.handle)}
                  aria-describedby={
                    errors.handle ? "field-handle-error" : "field-handle-hint"
                  }
                  onChange={(event) => set("handle", event.target.value)}
                />
              </InputShell>
            </Field>

            <div>
              <Eyebrow>Live recipient preview</Eyebrow>
              <div className="mt-2.5">
                <SocialRecipientCard
                  platform={form.platform}
                  handle={form.handle}
                  showArrow={false}
                />
              </div>
            </div>
          </fieldset>

          {/* ────────── Optional socials ────────── */}
          <fieldset disabled={submitting} className="min-w-0 space-y-5">
            <legend className="mb-5 flex items-center gap-3">
              <span className="text-[15px] font-semibold">Optional socials</span>
              <span className="h-px flex-1 bg-line" />
            </legend>

            <Field id="field-website" label="Website" optional error={errors.website}>
              <InputShell invalid={Boolean(errors.website)}>
                <TextInput
                  id="field-website"
                  name="website"
                  type="url"
                  inputMode="url"
                  value={form.website}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://example.com"
                  aria-invalid={Boolean(errors.website)}
                  aria-describedby={errors.website ? "field-website-error" : undefined}
                  onChange={(event) => set("website", event.target.value)}
                />
              </InputShell>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="field-x" label="X" optional>
                <InputShell>
                  <SiX size={13} className="mr-2.5 shrink-0 text-fg-muted" aria-hidden />
                  <TextInput
                    id="field-x"
                    name="x"
                    value={form.x}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="handle"
                    onChange={(event) => set("x", event.target.value)}
                  />
                </InputShell>
              </Field>

              <Field id="field-telegram" label="Telegram" optional>
                <InputShell>
                  <SiTelegram
                    size={14}
                    className="mr-2.5 shrink-0 text-fg-muted"
                    aria-hidden
                  />
                  <TextInput
                    id="field-telegram"
                    name="telegram"
                    value={form.telegram}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="channel"
                    onChange={(event) => set("telegram", event.target.value)}
                  />
                </InputShell>
              </Field>
            </div>
          </fieldset>

          {/* ─────────────── Launch ─────────────── */}
          <fieldset disabled={submitting} className="min-w-0 space-y-5">
            <legend className="mb-5 flex items-center gap-3">
              <span className="text-[15px] font-semibold">Launch</span>
              <span className="h-px flex-1 bg-line" />
            </legend>

            <Field
              id="field-openingBuy"
              label="Opening buy"
              optional
              error={errors.openingBuy}
              hint="Simulated only. This release never requests a wallet or submits a transaction."
              className="sm:max-w-xs"
            >
              <InputShell invalid={Boolean(errors.openingBuy)}>
                <TextInput
                  id="field-openingBuy"
                  name="openingBuy"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.openingBuy}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.openingBuy)}
                  aria-describedby={
                    errors.openingBuy
                      ? "field-openingBuy-error"
                      : "field-openingBuy-hint"
                  }
                  className="tabular"
                  onChange={(event) => set("openingBuy", event.target.value)}
                />
                <span
                  aria-hidden
                  className="ml-2 shrink-0 border-l border-line pl-3 text-[13px] font-medium text-fg-secondary"
                >
                  SOL
                </span>
              </InputShell>
            </Field>
          </fieldset>

          <div className="flex flex-col items-stretch gap-4 border-t border-line pt-7 sm:items-start">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto sm:min-w-56"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" aria-hidden />
                  Preparing launch…
                </>
              ) : (
                <>
                  <Rocket size={16} aria-hidden />
                  Create Token
                </>
              )}
            </Button>

            {/* Stage progress, announced politely while it runs. */}
            <div aria-live="polite" className="min-h-6">
              {submitting ? (
                <ol className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {STAGES.map((label, index) => (
                    <li
                      key={label}
                      className={cn(
                        "flex items-center gap-2 text-[12.5px] transition-colors duration-200",
                        index < stage
                          ? "text-brand"
                          : index === stage
                            ? "text-fg"
                            : "text-fg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border transition-colors duration-200",
                          index < stage
                            ? "border-brand bg-brand text-[#04140B]"
                            : index === stage
                              ? "border-brand"
                              : "border-line-strong",
                        )}
                      >
                        {index < stage ? (
                          <Check size={9} strokeWidth={4} aria-hidden />
                        ) : index === stage ? (
                          <span className="size-1.5 rounded-full bg-brand" />
                        ) : null}
                      </span>
                      {label}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <p className="flex items-start gap-2 text-[12px] leading-relaxed text-fg-muted">
              <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
              This is a product demo. Creating a token here does not mint anything,
              does not submit to pump.fun, and does not broadcast a transaction.
            </p>
          </div>
        </form>

        {/* ───────────── Live summary ───────────── */}
        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="rounded-card border border-line bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-[14px] font-semibold">Summary</h2>
              <Badge tone="warn">Demo</Badge>
            </div>

            <div className="flex items-center gap-3.5 border-b border-line px-5 py-4">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt=""
                  className="size-11 rounded-xl border border-line object-cover"
                />
              ) : (
                <span className="flex size-11 items-center justify-center rounded-xl border border-dashed border-line-strong font-mono text-[11px] text-fg-muted">
                  IMG
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-medium">
                  {form.name.trim() || "Example Coin"}
                </p>
                <p className="mt-0.5 font-mono text-[12.5px] text-fg-secondary">
                  ${tickerDisplay}
                </p>
              </div>
            </div>

            <dl className="divide-y divide-line">
              <SummaryRow label="Token" value={form.name.trim() || "Example Coin"} />
              <SummaryRow label="Ticker" value={tickerDisplay} mono />
              <SummaryRow label="Recipient" value={recipientDisplay} mono />
              <SummaryRow label="Platform" value={platform.name} />
              <SummaryRow
                label="Network"
                value="Solana"
                icon={<SiSolana size={11} aria-hidden />}
              />
              <SummaryRow label="Launchpad" value={E2W_TOKEN.launchpad} />
              {form.openingBuy.trim() ? (
                <SummaryRow
                  label="Opening buy"
                  value={`${form.openingBuy.trim()} SOL`}
                  mono
                />
              ) : null}
            </dl>

            <p className="border-t border-line px-5 py-4 text-[11.5px] leading-relaxed text-fg-muted">
              Values update as you type. Nothing here is submitted anywhere.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <Image
              src={E2W_TOKEN.image}
              alt=""
              width={512}
              height={512}
              sizes="36px"
              className="size-9 rounded-lg border border-line"
            />
            <p className="text-[12px] leading-relaxed text-fg-secondary">
              Earn2Win&apos;s own token is{" "}
              <span className="font-mono text-fg">${E2W_TOKEN.symbol}</span> — the only
              token this app tracks live market data for.
            </p>
          </div>
        </aside>
      </div>

      <LaunchSuccessToast
        open={toast !== null}
        onClose={() => setToast(null)}
        tokenName={toast?.name ?? ""}
        ticker={`$${toast?.ticker ?? ""}`}
        recipient={toast?.recipient ?? ""}
      />
    </>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="text-[12.5px] text-fg-muted">{label}</dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-1.5 truncate text-[13px] text-fg",
          mono && "font-mono",
        )}
      >
        {icon}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  );
}

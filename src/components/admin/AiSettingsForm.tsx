"use client";

import { useActionState } from "react";

import { saveAiSettingsAction, type AiSettingsFormState } from "@/app/quan-tri/cai-dat-ai/actions";
import {
  AI_FEATURES,
  AI_FEATURE_LABELS,
  AI_MODEL_OPTIONS,
  AI_PROVIDERS,
  AI_PROVIDER_LABELS,
  type AiFeature,
  type AiProvider,
} from "@/lib/types";

import { Select, TextField } from "./fields";

const PROVIDER_KEY_PLACEHOLDER: Record<AiProvider, string> = {
  anthropic: "sk-ant-...",
  openai: "sk-...",
  google: "AIza...",
};

export function AiSettingsForm({
  hasApiKey,
  models,
}: {
  hasApiKey: Record<AiProvider, boolean>;
  models: Record<AiFeature, { provider: AiProvider; model: string }>;
}) {
  const [state, formAction, pending] = useActionState<AiSettingsFormState, FormData>(
    saveAiSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-ink">API key theo nhà cung cấp</p>
        {AI_PROVIDERS.map((provider) => (
          <TextField
            key={provider}
            label={AI_PROVIDER_LABELS[provider]}
            name={`apiKey_${provider}`}
            type="password"
            placeholder={
              hasApiKey[provider]
                ? "•••••••••••• (để trống nếu giữ nguyên key hiện tại)"
                : PROVIDER_KEY_PLACEHOLDER[provider]
            }
            error={state?.errors?.[`apiKey_${provider}`]}
          />
        ))}
        <p className="text-xs text-ink-soft">
          Key được lưu trên máy chủ, chỉ hiện được cho tài khoản quản trị. Không cần điền nhà cung cấp
          bạn không dùng đến.
        </p>
      </div>

      <div className="space-y-4 border-t border-line pt-6">
        <p className="text-sm font-semibold text-ink">Chọn "bộ não" (nhà cung cấp + model) cho từng chức năng</p>
        {AI_FEATURES.map((feature) => (
          <Select
            key={feature}
            label={AI_FEATURE_LABELS[feature]}
            name={`model_${feature}`}
            defaultValue={`${models[feature].provider}:${models[feature].model}`}
            error={state?.errors?.[feature]}
            options={AI_MODEL_OPTIONS.map((o) => ({
              value: `${o.provider}:${o.model}`,
              label: o.label,
            }))}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : "Lưu cài đặt"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { saveAiSettingsAction, type AiSettingsFormState } from "@/app/quan-tri/cai-dat-ai/actions";
import { AI_FEATURES, AI_FEATURE_LABELS, AI_MODELS, AI_MODEL_LABELS, type AiFeature, type AiModel } from "@/lib/types";

import { Select, TextField } from "./fields";

export function AiSettingsForm({
  hasApiKey,
  models,
}: {
  hasApiKey: boolean;
  models: Record<AiFeature, AiModel>;
}) {
  const [state, formAction, pending] = useActionState<AiSettingsFormState, FormData>(
    saveAiSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <TextField
        label="Anthropic API key"
        name="apiKey"
        type="password"
        placeholder={hasApiKey ? "•••••••••••• (để trống nếu giữ nguyên key hiện tại)" : "sk-ant-..."}
        error={state?.errors?.apiKey}
        hint="Lấy API key tại console.anthropic.com. Key được lưu trên máy chủ, chỉ hiện được cho tài khoản quản trị."
      />

      <div className="space-y-4 border-t border-line pt-6">
        <p className="text-sm font-semibold text-ink">Chọn &quot;bộ não&quot; (model) cho từng chức năng</p>
        {AI_FEATURES.map((feature) => (
          <Select
            key={feature}
            label={AI_FEATURE_LABELS[feature]}
            name={`model_${feature}`}
            defaultValue={models[feature]}
            error={state?.errors?.[feature]}
            options={AI_MODELS.map((m) => ({ value: m, label: AI_MODEL_LABELS[m] }))}
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

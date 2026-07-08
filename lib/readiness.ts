import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

// Deterministic, rule-based listing-quality checks. These are practical
// common-sense heuristics (has a SKU, enough images, a real description),
// NOT a verified, up-to-date copy of any marketplace's actual current
// policies -- the channel_rules table is a configurable starting point.

export type RuleCheckType =
  | "field_present"
  | "field_positive"
  | "min_array_length"
  | "min_text_length";

export interface ChannelRule {
  id: string;
  key: string;
  label: string;
  checkType: RuleCheckType;
  config: Record<string, unknown>;
  weight: number;
}

export interface Channel {
  id: string;
  slug: string;
  name: string;
}

export interface RuleResult extends ChannelRule {
  passed: boolean;
}

export interface ChannelReadiness {
  channel: Channel;
  score: number;
  passed: RuleResult[];
  failed: RuleResult[];
}

interface ChannelRuleRow {
  id: string;
  key: string;
  label: string;
  check_type: RuleCheckType;
  config: Record<string, unknown>;
  weight: number;
}

interface ChannelRow {
  id: string;
  slug: string;
  name: string;
  channel_rules: ChannelRuleRow[];
}

async function getChannelsWithRules(): Promise<{ channel: Channel; rules: ChannelRule[] }[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("channels")
    .select("id, slug, name, channel_rules(id, key, label, check_type, config, weight)");

  if (error) {
    throw new Error(`Failed to load channels: ${error.message}`);
  }

  return (data as ChannelRow[]).map((row) => ({
    channel: { id: row.id, slug: row.slug, name: row.name },
    rules: (row.channel_rules ?? []).map((rule) => ({
      id: rule.id,
      key: rule.key,
      label: rule.label,
      checkType: rule.check_type,
      config: rule.config,
      weight: rule.weight,
    })),
  }));
}

function evaluateRule(product: Product, rule: ChannelRule): boolean {
  const field = rule.config.field as keyof Product | undefined;
  const value = field ? product[field] : undefined;

  switch (rule.checkType) {
    case "field_present":
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    case "field_positive":
      return typeof value === "number" && value > 0;
    case "min_array_length": {
      const min = Number(rule.config.min ?? 1);
      return Array.isArray(value) && value.length >= min;
    }
    case "min_text_length": {
      const min = Number(rule.config.min ?? 1);
      return typeof value === "string" && value.trim().length >= min;
    }
    default:
      return false;
  }
}

export function computeReadiness(product: Product, rules: ChannelRule[]) {
  const results: RuleResult[] = rules.map((rule) => ({
    ...rule,
    passed: evaluateRule(product, rule),
  }));
  const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0) || 1;
  const passedWeight = results
    .filter((result) => result.passed)
    .reduce((sum, result) => sum + result.weight, 0);
  const score = Math.round((passedWeight / totalWeight) * 100);

  return {
    score,
    passed: results.filter((result) => result.passed),
    failed: results.filter((result) => !result.passed),
  };
}

export async function getChannelsWithReadiness(product: Product): Promise<ChannelReadiness[]> {
  const channelsWithRules = await getChannelsWithRules();

  return channelsWithRules.map(({ channel, rules }) => {
    const { score, passed, failed } = computeReadiness(product, rules);
    return { channel, score, passed, failed };
  });
}

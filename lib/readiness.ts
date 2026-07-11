import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

// Deterministic, rule-based listing-quality checks. These are practical
// common-sense heuristics (has a SKU, enough images, a real description),
// NOT a verified, up-to-date copy of any marketplace's actual current
// policies -- the channel_rules table is a configurable starting point.
// Workspaces can add their own rules on top (workspace_channel_rules) --
// additive only, the global defaults are shared and never edited in place.

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
  isCustom: boolean;
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

interface WorkspaceChannelRuleRow extends ChannelRuleRow {
  channel_id: string;
}

async function getChannelsWithRules(
  workspaceId: string
): Promise<{ channel: Channel; rules: ChannelRule[] }[]> {
  const supabase = getSupabaseServerClient();

  const [channelsRes, customRulesRes] = await Promise.all([
    supabase
      .from("channels")
      .select("id, slug, name, channel_rules(id, key, label, check_type, config, weight)"),
    supabase
      .from("workspace_channel_rules")
      .select("id, channel_id, key, label, check_type, config, weight")
      .eq("workspace_id", workspaceId),
  ]);

  if (channelsRes.error) {
    throw new Error(`Failed to load channels: ${channelsRes.error.message}`);
  }
  if (customRulesRes.error) {
    throw new Error(`Failed to load custom rules: ${customRulesRes.error.message}`);
  }

  const customByChannel = new Map<string, WorkspaceChannelRuleRow[]>();
  for (const row of (customRulesRes.data ?? []) as WorkspaceChannelRuleRow[]) {
    const list = customByChannel.get(row.channel_id) ?? [];
    list.push(row);
    customByChannel.set(row.channel_id, list);
  }

  return (channelsRes.data as ChannelRow[]).map((row) => {
    const defaultRules: ChannelRule[] = (row.channel_rules ?? []).map((rule) => ({
      id: rule.id,
      key: rule.key,
      label: rule.label,
      checkType: rule.check_type,
      config: rule.config,
      weight: rule.weight,
      isCustom: false,
    }));
    const customRules: ChannelRule[] = (customByChannel.get(row.id) ?? []).map((rule) => ({
      id: rule.id,
      key: rule.key,
      label: rule.label,
      checkType: rule.check_type,
      config: rule.config,
      weight: rule.weight,
      isCustom: true,
    }));

    return {
      channel: { id: row.id, slug: row.slug, name: row.name },
      rules: [...defaultRules, ...customRules],
    };
  });
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

export async function getChannelsWithReadiness(
  product: Product,
  workspaceId: string
): Promise<ChannelReadiness[]> {
  const channelsWithRules = await getChannelsWithRules(workspaceId);

  return channelsWithRules.map(({ channel, rules }) => {
    const { score, passed, failed } = computeReadiness(product, rules);
    return { channel, score, passed, failed };
  });
}

export interface ProductReadinessSummary {
  product: Product;
  averageScore: number;
}

export interface ReadinessOverview {
  channelAverages: { channel: Channel; averageScore: number }[];
  products: ProductReadinessSummary[];
}

/**
 * Catalog-wide readiness summary: per-channel average score across all
 * products, and a per-product overall average, worst-first. Fetches
 * channels+rules once and reuses them for every product, rather than the
 * N+1 pattern getChannelsWithReadiness would produce if called in a loop.
 */
export async function getReadinessOverview(
  products: Product[],
  workspaceId: string
): Promise<ReadinessOverview> {
  const channelsWithRules = await getChannelsWithRules(workspaceId);

  if (products.length === 0 || channelsWithRules.length === 0) {
    return {
      channelAverages: channelsWithRules.map(({ channel }) => ({ channel, averageScore: 0 })),
      products: [],
    };
  }

  // scoresByChannel[channelId] = list of scores across products
  const scoresByChannel = new Map<string, number[]>();
  const productSummaries: ProductReadinessSummary[] = products.map((product) => {
    const scores = channelsWithRules.map(({ channel, rules }) => {
      const { score } = computeReadiness(product, rules);
      const existing = scoresByChannel.get(channel.id) ?? [];
      existing.push(score);
      scoresByChannel.set(channel.id, existing);
      return score;
    });
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    return { product, averageScore };
  });

  const channelAverages = channelsWithRules.map(({ channel }) => {
    const scores = scoresByChannel.get(channel.id) ?? [];
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
    return { channel, averageScore };
  });

  productSummaries.sort((a, b) => a.averageScore - b.averageScore);

  return { channelAverages, products: productSummaries };
}

// -- Self-serve custom rules -------------------------------------------

export interface CustomRule extends ChannelRule {
  channelId: string;
}

/** All of a workspace's custom rules across every channel, for the "manage rules" UI. */
export async function getCustomRulesByChannel(workspaceId: string): Promise<CustomRule[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_channel_rules")
    .select("id, channel_id, key, label, check_type, config, weight")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load custom rules: ${error.message}`);
  }

  return (data as WorkspaceChannelRuleRow[]).map((row) => ({
    id: row.id,
    channelId: row.channel_id,
    key: row.key,
    label: row.label,
    checkType: row.check_type,
    config: row.config,
    weight: row.weight,
    isCustom: true,
  }));
}

export async function getAllChannels(): Promise<Channel[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("channels").select("id, slug, name").order("name");
  if (error) {
    throw new Error(`Failed to load channels: ${error.message}`);
  }
  return data as Channel[];
}

export interface CreateCustomRuleInput {
  channelId: string;
  key: string;
  label: string;
  checkType: RuleCheckType;
  field: string;
  min?: number;
  weight: number;
}

export async function createCustomRule(
  workspaceId: string,
  input: CreateCustomRuleInput
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const config: Record<string, unknown> = { field: input.field };
  if (input.checkType === "min_array_length" || input.checkType === "min_text_length") {
    config.min = input.min ?? 1;
  }

  const { error } = await supabase.from("workspace_channel_rules").insert({
    workspace_id: workspaceId,
    channel_id: input.channelId,
    key: input.key,
    label: input.label,
    check_type: input.checkType,
    config,
    weight: input.weight,
  });

  if (error) {
    throw new Error(`Failed to create custom rule: ${error.message}`);
  }
}

export async function deleteCustomRule(ruleId: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("workspace_channel_rules")
    .delete()
    .eq("id", ruleId)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to delete custom rule: ${error.message}`);
  }
}

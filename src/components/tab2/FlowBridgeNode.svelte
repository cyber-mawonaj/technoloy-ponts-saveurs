<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';
  import {
    ArrowDownCircle,
    CheckCircle2,
    GitFork,
    Layers,
    PlayCircle,
    ShieldAlert,
    Wrench,
  } from 'lucide-svelte';

  export interface BridgeFlowNodeData extends Record<string, unknown> {
    title: string;
    subtitle: string;
    role: 'start' | 'input' | 'process' | 'decision' | 'success' | 'warning' | 'forbidden';
    hasTarget?: boolean;
    hasSource?: boolean;
    layout?: 'horizontal' | 'vertical';
    validationState?: 'neutral' | 'valid' | 'error';
  }

  let { data, selected }: NodeProps = $props();

  const nodeData = $derived(data as BridgeFlowNodeData);
  const isHorizontal = $derived(nodeData.layout === 'horizontal');
  const targetPos = $derived(isHorizontal ? Position.Left : Position.Top);
  const sourcePos = $derived(isHorizontal ? Position.Right : Position.Bottom);

  const cardClasses = $derived.by(() => {
    const base =
      'rounded-xl border px-3.5 py-2.5 min-w-[190px] max-w-[230px] shadow-xs transition-colors select-none';

    if (nodeData.validationState === 'valid') {
      return `${base} bg-emerald-50 dark:bg-emerald-950/75 border-emerald-500 text-emerald-950 dark:text-emerald-100`;
    }
    if (nodeData.validationState === 'error') {
      return `${base} bg-rose-50 dark:bg-rose-950/75 border-rose-500 text-rose-950 dark:text-rose-100`;
    }

    switch (nodeData.role) {
      case 'start':
        return `${base} rounded-full px-5 bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-slate-900 dark:text-amber-100`;
      case 'decision':
        return `${base} bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-500 text-slate-900 dark:text-sky-100`;
      case 'success':
        return `${base} bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-slate-900 dark:text-emerald-100`;
      case 'warning':
        return `${base} bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-slate-900 dark:text-amber-100`;
      case 'forbidden':
        return `${base} bg-rose-50/80 dark:bg-rose-950/40 border-dashed border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-200`;
      default:
        return `${base} bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100`;
    }
  });
</script>

<div class="{cardClasses} {selected ? 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-950' : ''}">
  {#if nodeData.hasTarget !== false}
    <Handle
      type="target"
      position={targetPos}
      class="!w-3.5 !h-3.5 !bg-slate-600 dark:!bg-slate-300 !border-2 !border-white dark:!border-slate-900"
    />
  {/if}

  <div class="flex items-start gap-2">
    <div class="mt-0.5 shrink-0">
      {#if nodeData.role === 'start'}
        <PlayCircle class="w-4 h-4 text-amber-600 dark:text-amber-400" />
      {:else if nodeData.role === 'input'}
        <ArrowDownCircle class="w-4 h-4 text-sky-600 dark:text-sky-400" />
      {:else if nodeData.role === 'decision'}
        <GitFork class="w-4 h-4 text-sky-600 dark:text-sky-400" />
      {:else if nodeData.role === 'success'}
        <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      {:else if nodeData.role === 'warning'}
        <Wrench class="w-4 h-4 text-amber-600 dark:text-amber-400" />
      {:else if nodeData.role === 'forbidden'}
        <ShieldAlert class="w-4 h-4 text-rose-600 dark:text-rose-400" />
      {:else}
        <Layers class="w-4 h-4 text-slate-500 dark:text-slate-400" />
      {/if}
    </div>

    <div class="min-w-0">
      <div class="text-xs font-bold leading-snug">{nodeData.title}</div>
      <div class="text-[11px] text-slate-600 dark:text-slate-300/90 leading-snug mt-0.5">
        {nodeData.subtitle}
      </div>
    </div>
  </div>

  {#if nodeData.role === 'decision'}
    <div class="mt-2.5 pt-1.5 border-t border-sky-200 dark:border-sky-800/80 flex items-center justify-between text-[10px] font-bold">
      <span class="text-emerald-700 dark:text-emerald-300">OUI (≥ 10 s)</span>
      <span class="text-rose-700 dark:text-rose-300">NON (Échec)</span>
    </div>
    <Handle
      id="oui"
      type="source"
      position={Position.Bottom}
      style="left: 26%;"
      class="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900"
    />
    <Handle
      id="non"
      type="source"
      position={Position.Bottom}
      style="left: 74%;"
      class="!w-3.5 !h-3.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900"
    />
  {:else if nodeData.hasSource !== false}
    <Handle
      type="source"
      position={sourcePos}
      class="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-white dark:!border-slate-900"
    />
  {/if}
</div>

<script lang="ts">
  import type { MaskRow } from './types';

  export let input: string;
  export let rows: MaskRow[];

  const chars = input.split('');
</script>

<div class="mask-grid">
  <!-- Input row -->
  <div class="row">
    <span class="label">input</span>
    <span class="cells">
      {#each chars as ch}
        <span class="cell input-cell">{ch}</span>
      {/each}
    </span>
  </div>

  <!-- Mask rows -->
  {#each rows as row}
    <div class="row">
      <span class="label">{row.label}</span>
      <span class="cells">
        {#each chars as ch, i}
          <span
            class="cell"
            class:mask-on={row.mask[i]}
            class:mask-off={!row.mask[i]}
            style:--row-color={row.color}
          >{ch}</span>
        {/each}
      </span>
    </div>
  {/each}
</div>

<style>
  .mask-grid {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1;
    padding: 1.5rem;
  }

  .row {
    display: flex;
    align-items: stretch;
    margin-bottom: 2px;
  }

  .label {
    width: 8em;
    flex-shrink: 0;
    padding: 4px 12px 4px 0;
    text-align: right;
    color: #888;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    user-select: none;
  }

  .cells {
    display: flex;
  }

  .cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4ch;
    height: 1.8em;
    text-align: center;
    box-sizing: border-box;
  }

  .input-cell {
    color: #ddd;
    background: #333;
    border-bottom: 2px solid #555;
  }

  .mask-on {
    background: var(--row-color);
    color: #fff;
  }

  .mask-off {
    color: #666;
    opacity: 0.45;
  }
</style>

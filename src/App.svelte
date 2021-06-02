<script>
  import Tailwind from './Tailwind.svelte';
  import { onMount } from 'svelte';
  import { count } from './lib/stores.js';
  import Start from './lib/Start';
  import './css/style.css';
  import * as d3 from 'd3';
  import * as JSONdata from './data/genomes.json';
  import CompareSelector from './lib/CompareSelector.svelte';
  let idToNode = {};
  JSONdata.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  const submit = (event) => {
    const { values } = event.detail;

    const datahuBlock = `{
        "name": "${values.source} to ${values.target} alignment",
        "type": "genomealign",
        "metadata": {
            "genome": "${values.target}"
        }
    }`;
    alert(datahuBlock);
  };

  onMount(() => {
    const dispatcher = d3.dispatch('filterCategories');
    const start = new Start(dispatcher, JSONdata);
    start.init();
    dispatcher.on('filterCategories', (input) => {
      const source = idToNode[input.source];
      const target = idToNode[input.target];
      count.set({ target, source });
    });
  });
</script>

<Tailwind />

<main class="text-center p-4 mx-0">
  <h1 class="text-4xl uppercase font-thin leading-tight my-8 mx-auto">
    Washu Comparative gateway
  </h1>
</main>

<div class="container">
  <div class="margin-left"><svg id="arcchart" /></div>
</div>

{#if Object.keys($count).length === 0}
  <p>Click on an arc</p>
{:else}
  <CompareSelector on:message={submit} />
{/if}

<style>
  :root {
    --svelte-rgb: 255, 62, 0;
  }

  h1 {
    color: rgb(var(--svelte-rgb));
  }
</style>

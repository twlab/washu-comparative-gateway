<script>
  import Tailwind from './Tailwind.svelte';
  import { SvelteToast, toast } from '@zerodevx/svelte-toast';
  import { JsonView } from '@zerodevx/svelte-json-view';
  import Icon from 'svelte-icon';
  import copy from './img/zondicons/copy.svg';
  import browser_window from './img/zondicons/window-open.svg';
  import save from './img/zondicons/save-disk.svg';
  import * as uuid from 'uuid';
  import axios from 'axios';

  import { onMount } from 'svelte';
  import { count } from './lib/stores.js';
  import Start from './lib/Start';
  import './css/style.css';
  import * as d3 from 'd3';
  import * as JSONdata from './data/genomes.json';
  import GenomeComparisonJSON from './data/genome_comparison.json';
  import CompareSelector from './lib/CompareSelector.svelte';

  const POST_DATAHUB_URL =
    'https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub';
  let uploaded = false;
  let DATAHUB_URL;
  let sourceNode = '';
  let targetNode = '';
  let targetFilters;
  let idToNode = {};
  let nodeDetailsByName = {};
  let comparisons = [];
  let sourceAssembly;
  let targetAssemblies = [];
  let UUID;
  JSONdata.nodes.forEach(function (n) {
    idToNode[n.id] = n;
    nodeDetailsByName[n.name] = n;
  });

  const submit = (event) => {
    const { values } = event.detail;
    console.log(values);
    sourceAssembly = values.source;

    if (Array.isArray(values.target)) {
      targetAssemblies = values.target;
    } else {
      targetAssemblies = [values.target];
    }

    comparisons = createDatahubBlock(values);
  };

  onMount(() => {
    const dispatcher = d3.dispatch('filterCategories');
    const start = new Start(dispatcher, JSONdata);
    start.init();
    dispatcher.on('filterCategories', (input) => {
      const nodeName = getNodeName(input);
      if (sourceNode !== '') {
        targetNode = nodeDetailsByName[nodeName];
        toast.push(`TARGET : ${nodeName}`);
        count.set({ source: sourceNode, target: targetNode });
      } else {
        toast.push(`SOURCE : ${nodeName}`);
        sourceNode = nodeDetailsByName[nodeName];
      }
      let targetCandidates = JSONdata.links.filter(
        (d) => d.source === sourceNode.id
      );
      targetFilters = targetCandidates.map((d) => idToNode[d.target].name);

      start.setTargets(targetFilters, nodeName);
    });
  });

  function deDupComparisonsArray(arr) {
    const result = arr.filter(
      (d, index, self) => index === self.findIndex((t) => t.name === d.name)
    );
    return result;
  }

  function getNodeName(str) {
    const { id } = str.data;
    const idElements = id.split('.');
    const genomeName = idElements[idElements.length - 1];
    return genomeName;
  }
  function createDatahubBlock(values) {
    const { source, target } = values;

    let result = [];

    if (Array.isArray(target)) {
      result = target.map((d) => createDatahubSection(source, d));
    } else {
      let tmp = createDatahubSection(source, target);
      result.push(tmp);
    }

    return [...deDupComparisonsArray([...comparisons, ...result])];
  }

  function createDatahubSection(source, target) {
    const key = `${source}to${target}`;
    console.log(key);
    console.log(GenomeComparisonJSON);

    let label, url;

    const queryBlock = GenomeComparisonJSON.filter((d) => d.name === key);
    if (queryBlock.length > 0) {
      label = queryBlock[0].label;
      url = queryBlock[0].url;
    }

    let tmp = {
      name: `${source}to${target}`,
      filetype: 'genomealign',
      isSelected: true,
      showOnHubLoad: true,
      label: label,
      metadata: { 'Track type': 'genomealign', genome: source },
      querygenome: target,
      url: url,
    };
    return tmp;
  }

  async function saveinmongo() {
    UUID = uuid.v4();

    console.log('ok will save in mongo');
    const toPost = {
      _id: UUID,
      files: [],
      hub: { content: comparisons },
      comments: 'TEST',
      compositegraphdata: {},
      registered: Date(),
      username: 'dpuru',
    };

    console.log('Posting request to mongo API...');

    try {
      const response = await axios.post(POST_DATAHUB_URL, toPost);
      console.log(response);
      let resBody = response.data.body;
      if (resBody.hasOwnProperty('id')) {
        uploaded = true;
        DATAHUB_URL = `https://epigenomegateway.wustl.edu/browser/?genome=${sourceAssembly}&hub=${POST_DATAHUB_URL}/${UUID}`;
        console.log('Created datahub:', DATAHUB_URL);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
</script>

<Tailwind />
<SvelteToast />

<main class="text-center p-4 mx-0">
  <h1 class="text-4xl uppercase font-thin leading-tight my-8 mx-auto">
    Washu Comparative gateway
  </h1>
</main>

<div class="container">
  <div class="margin-left"><svg id="arcchart" /></div>
</div>
<div class="container">
  <div class="margin-left">
    <svg id="treechart" width="960" height="2400" />
  </div>
</div>

{#if Object.keys($count).length === 0}
  <p>Make a selection</p>
{:else}
  <CompareSelector on:message={submit} />
{/if}

{#if comparisons.length > 0}
  <div class="flex justify-between p-4 m-8 bg-gray-100">
    <JsonView json={comparisons} />
    <div class="flex flex-col m-8 justify-start">
      <!-- <Icon data={copy} class="m-8" /> -->
      <div
        on:click={() => saveinmongo()}
        class="m-8 cursor-pointer hover:bg-green-200"
      >
        <Icon data={save} />
      </div>
      {#if DATAHUB_URL !== undefined}
        <a
          href={DATAHUB_URL}
          target="_blank"
          class="m-8 cursor-pointer hover:bg-green-200"
        >
          <Icon data={browser_window} />
        </a>
      {/if}
    </div>
  </div>
{:else}
  <p>Complete selection of genomes to compare</p>
{/if}

<style>
  :root {
    --svelte-rgb: 255, 62, 0;
  }

  h1 {
    color: rgb(var(--svelte-rgb));
  }
</style>

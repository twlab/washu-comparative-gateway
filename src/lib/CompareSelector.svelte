<script>
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  import { count } from './stores.js';

  const initial = {
    target: '',
    source: '',
  };

  function handleSubmit() {
    dispatch('message', {
      values,
    });
  }

  let values = { ...initial };

  const unsubscribe = count.subscribe((value) => {
    values.target = value.target.assemblies[0];
    values.source = value.source.assemblies[0];
  });

  onDestroy(unsubscribe);
</script>

<div class="container">
  <form class="tooltip" on:submit|preventDefault={handleSubmit}>
    <div>
      <h4
        class="bg-pink-400 text-white text-sm h-6 rounded-8 px-2 outline-none focus:outline-none mr-1 mb-1"
      >
        Source Organism
      </h4>
      <div class="flex">
        <h5 class="text-xl px-2 w-48 font-bold">{$count.source.name}</h5>
        <img
          alt="..."
          src={$count.source.url}
          class="shadow-lg rounded-full mx-auto max-w-120-px"
        />
      </div>
      {#each $count.source.assemblies as assembly}
        <label
          class="bg-gray-200 font-sans text-sm h-6 rounded-8 px-2 outline-none focus:outline-none mr-1 mb-1"
        >
          <input type="radio" bind:group={values.source} value={assembly} />
          {assembly}
        </label>
      {/each}
    </div>
    <div>
      <h4
        class="bg-blue-400 text-white text-sm h-6 rounded-8 px-2 outline-none focus:outline-none mr-1 mb-1"
      >
        Target Organism
      </h4>
      <div class="flex">
        <h5 class="text-xl px-2 w-48 font-bold">{$count.target.name}</h5>
        <img
          alt="..."
          src={$count.target.url}
          class="shadow-lg rounded-full mx-auto max-w-120-px"
        />
      </div>
      {#each $count.target.assemblies as assembly}
        <label
          class="bg-gray-200 font-sans text-sm h-6 rounded-8 px-2 outline-none focus:outline-none mr-1 mb-1"
        >
          <input type="checkbox" bind:group={values.target} value={assembly} />
          {assembly}
        </label>
      {/each}
    </div>

    <button
      class="bg-green-600 text-white h-8 rounded-full px-2 outline-none focus:outline-none mr-1 mb-1 mt-8"
      type="submit"
      >Compare +
    </button>
  </form>
</div>

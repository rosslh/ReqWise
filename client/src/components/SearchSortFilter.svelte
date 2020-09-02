<script>
  import getProp from "lodash/get";
  import Fuse from "fuse.js";
  import Select from "svelte-select";

  export let list;
  export let searchKeys = [];
  export let searchResults = [...list];
  export let sortKeyRecent = "updated_at";
  export let sortKeyAlpha = "name";

  let selectedSort = "recent";
  let searchQuery = "";

  const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    keys: searchKeys,
  };

  $: fuse = new Fuse(list, options);

  export let filters = [];

  $: {
    searchResults = searchQuery
      ? fuse.search(searchQuery).map((x) => x.item)
      : [...list];
    if (selectedSort === "recent") {
      searchResults = searchResults.sort(
        (a, b) => new Date(b[sortKeyRecent]) - new Date(a[sortKeyRecent])
      );
    } else if (selectedSort === "alpha") {
      searchResults = searchResults.sort(
        (a, b) => getProp(b, sortKeyAlpha) < getProp(a, sortKeyAlpha)
      );
    }

    filters.forEach((filter) => {
      if (filter.selectedOption) {
        searchResults = searchResults.filter((result) =>
          filter.handler(result, filter.selectedOption.value)
        );
      }
    });
  }
</script>

<style>
  .ssfWrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .ssfWrapper > * {
    margin-right: 1.5rem;
    min-width: 30rem;
  }

  .ssfWrapper > *:last-child {
    margin-right: 0;
  }

  .ssfWrapper .searchField {
    flex-grow: 1;
  }

  .sortField {
    min-width: 30rem;
  }

  #sort button {
    margin-top: 0;
  }
</style>

<div class="ssfWrapper panel">
  <div class="searchField">
    <label for="searchString">Search</label>
    <input
      id="searchString"
      type="text"
      on:input={(e) => {
        searchQuery = e.target.value;
      }} />
  </div>
  <div class="sortField">
    <label for="sort">Sort</label>
    <fieldset id="sort" class="sortButtonWrapper">
      <button
        on:click={() => {
          selectedSort = 'recent';
        }}
        class={`button sortButton button-small button-outline button-${selectedSort === 'recent' ? 'primary' : 'secondary'}`}>
        Recent
      </button>
      <button
        on:click={() => {
          selectedSort = 'alpha';
        }}
        class={`button sortButton button-small button-outline button-${selectedSort === 'alpha' ? 'primary' : 'secondary'}`}>
        Alphabetical
      </button>
    </fieldset>
  </div>
  {#each filters as filter}
    <div class="filterField">
      <label for={filter.label}>{filter.label}</label>
      <Select
        inputAttributes={{ id: filter.label }}
        isClearable={true}
        items={filter.options}
        bind:selectedValue={filter.selectedOption} />
    </div>
  {/each}
</div>

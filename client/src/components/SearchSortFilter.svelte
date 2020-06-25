<script>
  import Select from "svelte-select";
  import Fuse from "fuse.js";
  export let list;
  export let searchKeys = [];
  export let sortKeys = [];
  export let searchResults = [];

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
    keys: searchKeys
  };

  $: fuse = new Fuse(list, options);

  $: handleInput = e => {
    searchResults = fuse.search(e.target.value).map(x => x.item);
  };

  const prettify = str =>
    (str.charAt(0).toUpperCase() + str.slice(1)).replace(/_/g, " ");

  const sortOptions = sortKeys.map(attr => ({
    value: attr,
    label: prettify(attr)
  }));

  let selectedSort = undefined;
</script>

<style>
  .ssfWrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .ssfWrapper > * {
    margin-right: 0.5rem;
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
</style>

<div class="ssfWrapper panel">
  <div class="searchField">
    <label for="searchString">Search</label>
    <input id="searchString" type="text" on:input={handleInput} />
  </div>
  <div class="sortField">
    <label for="sort">Sort</label>
    <Select
      inputAttributes={{ id: 'sort' }}
      items={sortOptions}
      bind:selectedValue={selectedSort} />
  </div>
</div>

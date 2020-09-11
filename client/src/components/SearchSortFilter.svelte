<script>
  import getProp from "lodash/get";
  import Fuse from "fuse.js";
  import Select from "svelte-select";
  import { stores } from "@sapper/app";
  import { onMount, tick } from "svelte";
  import queryString from "query-string";
  import camelCase from "lodash/camelCase";

  const { page } = stores();

  export let list;
  export let searchKeys = [];
  export let searchResults = [...list];
  export let sortKeyRecent = "updated_at";
  export let sortKeyAlpha = "name";

  let selectedSort = "recent";
  let searchQuery = "";

  $: {
    if (
      typeof window !== "undefined" &&
      (filters.length || searchQuery || selectedSort)
    ) {
      updateQueryString();
      searchSortFilter();
    }
  }

  const updateParamsFromQueryString = () => {
    console.log("updating filters from query string");
    // search
    if ($page.query.q) {
      searchQuery = $page.query.q;
    }
    // sort
    if ($page.query.sort) {
      selectedSort = $page.query.sort;
    }
    // filter
    filters.forEach((filter) => {
      const queryString = $page.query[`filter-${camelCase(filter.label)}`];
      if (!filter.selectedOption && queryString) {
        filter.selectedOption = filter.options.find(
          (x) => x.value === queryString
        );
      }
    });
  };

  onMount(updateParamsFromQueryString);

  const updateQueryString = () => {
    // add missing query strings
    console.log("updating query string from filters");
    const queryStrings = queryString.parse(location.search);
    const oldQueryStrings = { ...queryStrings };
    queryStrings.sort = selectedSort;

    if (searchQuery) {
      queryStrings.q = searchQuery;
    } else {
      delete queryStrings.q;
    }

    const activeFilters = filters.filter((f) => f.selectedOption);
    activeFilters.forEach((filter) => {
      queryStrings[`filter-${camelCase(filter.label)}`] =
        filter.selectedOption.value;
    });

    const newUrl = `${$page.path}?${queryString.stringify(queryStrings)}`;
    const oldUrl = `${$page.path}?${queryString.stringify(oldQueryStrings)}`;

    if (newUrl !== oldUrl) {
      history.replaceState(null, "", newUrl);
    }
  };

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

  export let filters = [];

  $: searchSortFilter = () => {
    const fuse = new Fuse(list, options);
    // search
    searchResults = searchQuery
      ? fuse.search(searchQuery).map((x) => x.item)
      : [...list];

    // sort
    if (selectedSort === "recent") {
      searchResults = searchResults.sort(
        (a, b) => new Date(b[sortKeyRecent]) - new Date(a[sortKeyRecent])
      );
    } else if (selectedSort === "alpha") {
      searchResults = searchResults.sort(
        (a, b) => getProp(b, sortKeyAlpha) < getProp(a, sortKeyAlpha)
      );
    }

    // filter
    filters.forEach((filter) => {
      if (filter.selectedOption) {
        searchResults = searchResults.filter((result) =>
          filter.handler(result, filter.selectedOption.value)
        );
      }
    });
  };

  const clearFilter = async (filter) => {
    delete filter.selectedOption;

    const queryStrings = queryString.parse(location.search);
    delete queryStrings[`filter-${camelCase(filter.label)}`];

    const newUrl = `${$page.path}?${queryString.stringify(queryStrings)}`;

    history.replaceState(null, "", newUrl);

    await tick();

    updateParamsFromQueryString();
  };
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
    <input id="searchString" type="text" bind:value={searchQuery} />
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
        on:clear={async () => await clearFilter(filter)}
        bind:selectedValue={filter.selectedOption} />
    </div>
  {/each}
</div>

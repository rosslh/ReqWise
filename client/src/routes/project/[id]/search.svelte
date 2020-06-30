<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../api";
  import MdFolder from "svelte-icons/md/MdFolder.svelte";
  import FaUserTie from "svelte-icons/fa/FaUserTie.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import FaRegFileAlt from "svelte-icons/fa/FaRegFileAlt.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";

  const { session, page } = stores();

  $: q = $page.query.q;
  $: id = $page.params.id;

  $: searchResults = get(
    `/projects/${id}/search?q=${encodeURIComponent(q)}`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  .resultType {
    font-size: 1.4rem;
    color: var(--secondaryText);
    display: flex;
    align-items: center;
    margin: -1.2rem -1.6rem 0;
    padding: 1.2rem 1.6rem;
    background-color: var(--background2);
    text-transform: capitalize;
  }

  div.linkWrapper {
    margin-top: 1rem;
    font-weight: 600;
  }

  .resultIconWrapper {
    margin-right: 0.5rem;
    display: inline-block;
    height: 1.6rem;
    width: 1.6rem;
    overflow: hidden;
  }

  :global(.resultIconWrapper svg) {
    max-height: 1.6rem;
    max-width: 1.6rem;
  }

  .resultIconWrapper-padded {
    transform: scale(0.8);
  }
</style>

<svelte:head>
  <title>Search results</title>
</svelte:head>
<div class="contentWrapper">
  <h2>
    Search results for
    <em>{q}</em>
  </h2>
  {#await searchResults}
    <!-- loading -->
  {:then result}
    {#each result as r}
      <div class="panel">
        <div class="resultType">
          {#if r.result_type === 'requirement group'}
            <div class="resultIconWrapper resultIconWrapper-padded">
              <MdFolder />
            </div>
          {:else if r.result_type === 'requirement'}
            <div class="resultIconWrapper resultIconWrapper-padded">
              <FaCheck />
            </div>
          {:else if r.result_type === 'stakeholder group'}
            <div class="resultIconWrapper resultIconWrapper-padded">
              <FaUserTie />
            </div>
          {:else if r.result_type === 'file'}
            <div class="resultIconWrapper resultIconWrapper-padded">
              <FaRegFileAlt />
            </div>
          {:else if r.result_type === 'user class'}
            <div class="resultIconWrapper">
              <IoMdPeople />
            </div>
          {/if}
          {r.result_type}
        </div>
        <div class="linkWrapper">
          {#if r.result_type === 'requirement group'}
            <a href={`/project/${id}/reqgroup/${r.id}`}>
              #{r.ppuid} - {r.name || r.description}
            </a>
          {:else if r.result_type === 'requirement'}
            <a href={`/project/${id}/requirement/${r.requirement_id}`}>
              #{r.ppuid} - {r.name || r.description}
            </a>
          {:else if r.result_type === 'stakeholder group'}
            <a href={`/project/${id}/stakeholders/${r.id}`}>
              #{r.ppuid} - {r.name || r.description}
            </a>
          {:else if r.result_type === 'file'}
            <a href={`/project/${id}/files/${r.id}`}>
              #{r.ppuid} - {r.name || r.description}
            </a>
          {:else if r.result_type === 'user class'}
            <a href={`/project/${id}/user-classes/${r.id}`}>
              #{r.ppuid} - {r.name || r.description}
            </a>
          {/if}
        </div>
      </div>
    {/each}
  {/await}
</div>

<script>
  import { stores, goto } from "@sapper/app";
  const { session, page } = stores();
  import Select from "svelte-select";
  import { get, post } from "../../../../../api.js";
  import { onMount } from "svelte";
  import Skeleton from "../../../../../components/Skeleton.svelte";
  import SubmitButton from "../../../../../components/SubmitButton.svelte";

  let isPrioritized;

  const id = $page.params.reqId;

  let description;
  let priority;
  let rationale = "";

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let repropose = true;

  onMount(async () => {
    const res = await get(
      `/requirements/${id}`,
      $session.user && $session.user.jwt
    );
    ({ isPrioritized } = res);
    description = res.latestVersion.description;
    priority = priorityOptions.find(
      option => option.value === res.latestVersion.priority
    );
  });

  const updateRequirement = async () => {
    const data = {
      description,
      priority: priority.value,
      status: repropose ? "proposed" : undefined,
      rationale
    };
    await post(
      `/requirements/${id}/versions`,
      data,
      $session.user && $session.user.jwt
    );
    goto(`/project/${$page.params.id}/requirement/${$page.params.reqId}`);
  };
</script>

<style>
  .proposed {
    color: var(--red);
    font-weight: 600;
  }
</style>

<section class="contentWrapper">
  <h2>Update Requirement</h2>
  <form>
    <fieldset>
      <label for="desc">Description</label>
      {#if description || description === ''}
        <input
          type="text"
          id="desc"
          name="desc"
          class="newReqInput"
          bind:value={description} />
      {:else}
        <Skeleton noPadding />
      {/if}
    </fieldset>
    {#if isPrioritized}
      <fieldset class="inline">
        <label for="priority">Priority</label>
        <div class="selectWrapper">
          {#if priority || priority === ''}
            <Select
              inputAttributes={{ id: 'priority' }}
              isClearable={false}
              isSearchable={false}
              items={priorityOptions}
              bind:selectedValue={priority} />
          {:else}
            <Skeleton noPadding inline />
          {/if}
        </div>
      </fieldset>
    {/if}
    <fieldset>
      <label for="desc">Reason for change</label>
      <input
        type="text"
        id="rationale"
        name="rationale"
        class="newReqInput"
        bind:value={rationale} />
    </fieldset>
    <fieldset>
      <input id="repropose" type="checkbox" bind:checked={repropose} />
      <label class="label-inline" for="repropose">
        Change status to
        <span class="proposed">Proposed</span>
      </label>
    </fieldset>
    <SubmitButton className="button-caution" handler={updateRequirement}>
      Save
    </SubmitButton>
  </form>
</section>

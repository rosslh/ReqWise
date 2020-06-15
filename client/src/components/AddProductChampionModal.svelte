<script>
  import Select from "svelte-select";
  import { post, get } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";
  import Skeleton from "../components/Skeleton.svelte";

  export let userclassId;
  export let projectId;
  export let update;
  export let close;

  let description = "";
  let selectedUser = null;

  $: addUserclass = async () => {
    await post(
      `/userclasses/${userclassId}/champions`,
      {
        description,
        account_id: selectedUser.value
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  $: userOptions = (async () => {
    const { team_id } = await get(
      `/projects/${projectId}`,
      $session.user && $session.user.jwt
    );
    const result = await get(
      `/teams/${team_id}/members`,
      $session.user && $session.user.jwt
    );
    return result;
  })();
</script>

<h3>Add a Product Champion</h3>
<form>
  <fieldset class="inline">
    <label for="user">User</label>
    <div class="selectWrapper">
      {#await userOptions}
        <Skeleton inline />
      {:then result}
        <Select
          inputAttributes={{ id: 'user' }}
          isClearable={false}
          isSearchable={true}
          items={result.map(user => ({ label: user.name, value: user.id }))}
          bind:selectedValue={selectedUser} />
      {:catch err}
        <p style="color: var(--red)">{err.message}</p>
      {/await}
    </div>
  </fieldset>
  <fieldset>
    <label for="desc">Notes</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  </fieldset>
  <SubmitButton handler={addUserclass}>Add</SubmitButton>
</form>

<script context="module">
  import { get } from "../../api.js";
  export async function preload(page, session) {
    if (!session.user) {
      return this.redirect(
        302,
        `/login?redirect=${encodeURIComponent(page.path)}`
      );
    }
    const user = await get(
      `/users/${session.user.id}`,
      session.user && session.user.jwt
    );
    return { user };
  }
</script>

<script>
  import Select from "svelte-select";
  import SubmitButton from "../../components/SubmitButton.svelte";

  import { put } from "../../api.js";
  import { toBase64, validateFileSize } from "../../utils.js";
  import { goto, stores } from "@sapper/app";
  const { session } = stores();

  export let user;
  let { name } = user;

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const themeOptions = ["light", "system", "dark"].map(attr => ({
    value: attr,
    label: capitalizeFirstLetter(attr)
  }));

  let theme = themeOptions.find(x => x.value === user.theme);
  $: currentImage = user.imageName;

  const refetchSettings = async () => {
    const { imageName } = await get(
      `/users/${$session.user.id}`,
      $session.user && $session.user.jwt
    );
    files = [];
    fetch("auth/updateSettings", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ theme: theme.value, imageName }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(r => r.json())
      .then(({ imageName }) => {
        $session.user = {
          ...$session.user,
          theme: theme.value,
          imageName
        };
        goto("/account/settings", { replaceState: true });
      });
  };

  const submit = async () => {
    if (!files.length || files[0]["type"].split("/")[0] === "image") {
      if (files.length && !validateFileSize(files[0])) {
        alert("File too large");
        return;
      }
      await put(
        `/users/${$session.user.id}/settings`,
        {
          name,
          theme: theme.value,
          file: files.length ? await toBase64(files.item(0)) : undefined,
          fileName: files.length ? files[0].name : undefined
        },
        $session.user && $session.user.jwt
      );
    } else {
      alert("Invalid image file");
      return;
    }
    refetchSettings();
  };

  const deleteImage = async () => {
    await put(
      `/users/${$session.user.id}/settings`,
      {
        file: ""
      },
      $session.user && $session.user.jwt
    );
    refetchSettings();
  };

  let files = [];
</script>

<style>
  .changePassword {
    margin-top: 2rem;
  }

  .profileImageWrapper {
    height: 9rem;
    width: 9rem;
    border: 0.1rem solid var(--borderColor);
    margin: 1.5rem 0 0.5rem;
  }

  .profileImageWrapper img,
  :global(.profileImageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }

  .finishUploadMessage {
    color: var(--orange);
    font-weight: 600;
    margin-top: 1rem;
  }
</style>

<svelte:head>
  <title>Settings - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h2>Settings</h2>
  <form class="panel">
    <fieldset>
      <label for="name">Your name</label>
      <input bind:value={name} type="text" id="name" />
    </fieldset>
    <fieldset>
      <label for="file">Profile image</label>
      <div class="profileImageWrapper squircle">
        {#if currentImage}
          <img
            src={`https://storage.googleapis.com/user-file-storage/${currentImage}`}
            alt={user.name} />
        {:else}
          {@html user.placeholderImage}
        {/if}
      </div>
      <input type="file" id="file" name="file" bind:files />
      {#if files.length}
        <p class="finishUploadMessage">Click submit to finish uploading</p>
      {:else if currentImage}
        <button
          class="button button-danger button-small button-outline"
          on:click|preventDefault={deleteImage}>
          Delete current image
        </button>
      {/if}
    </fieldset>
    <fieldset>
      <label for="theme">Interface theme</label>
      <Select
        inputAttributes={{ id: 'theme' }}
        items={themeOptions}
        bind:selectedValue={theme} />
    </fieldset>
    <SubmitButton handler={submit}>Submit</SubmitButton>
  </form>
  <div class="panel changePassword">
    <a rel="prefetch" href="/reset/request">Change password</a>
  </div>
</div>

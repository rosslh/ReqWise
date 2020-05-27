<script>
  import { onMount } from "svelte";
  import { post } from "../../../../api.js";
  import { stores, goto } from "@sapper/app";

  const { session, page } = stores();
  const { id: projectId } = $page.params;

  let iframe;
  let iframeOptions = null;

  let name = "";
  let description = "";

  const editor =
    "https://www.draw.io/?embed=1&ui=min&spin=1&proto=json&configure=1";

  const edit = () => {
    iframeOptions = { title: "Diagram Editor" };
    iframeOptions.frameborder = 0;

    const close = () => {
      window.removeEventListener("message", receive);
      iframeOptions = null;
    };

    const receive = async evt => {
      if (evt.data.length > 0) {
        const msg = JSON.parse(evt.data);

        // If configure=1 URL parameter is used the application
        // waits for this message. For configuration options see
        // https://desk.draw.io/support/solutions/articles/16000058316
        if (msg.event == "configure") {
          // Configuration example
          iframe.contentWindow.postMessage(
            JSON.stringify({
              action: "configure",
              config: {
                defaultFonts: ["Humor Sans", "Helvetica", "Times New Roman"]
              }
            }),
            "*"
          );
        } else if (msg.event == "init") {
          iframe.contentWindow.postMessage(
            JSON.stringify({ action: "load", autosave: 1 }),
            "*"
          );
        } else if (msg.event == "export") {
          // Extracts SVG DOM from data URI to enable links
          const svg = atob(msg.data.substring(msg.data.indexOf(",") + 1));

          // TODO: save to web API
          // await POST...
          await post(
            `/projects/${projectId}/models`,
            {
              name,
              description,
              svg
            },
            $session.user && $session.user.jwt
          );

          close();
          goto(`/project/${projectId}/models`);
        } else if (msg.event == "save") {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              action: "export",
              format: "xmlsvg",
              xml: msg.xml,
              spin: "Updating page"
            }),
            "*"
          );
        } else if (msg.event == "exit") {
          close();
        }
      }
    };

    window.addEventListener("message", receive);
  };
</script>

<style>
  iframe {
    position: relative;
    z-index: 2000;
    width: 100%;
    min-height: 70vh;
  }
</style>

<section class="contentWrapper">
  <h2>Create diagram</h2>
  {#if iframeOptions}
    <div id="iframeWrapper">
      <iframe
        {...iframeOptions}
        src={editor}
        title={iframeOptions.title}
        bind:this={iframe} />
    </div>
  {:else}
    <fieldset>
      <label for="name">Diagram name</label>
      <input id="name" bind:value={name} type="text" />
    </fieldset>
    <fieldset>
      <label for="desc">Description</label>
      <input id="desc" bind:value={description} type="text" />
    </fieldset>
    <button on:click={edit}>Start editing</button>
  {/if}
</section>

<script>
  import { onMount } from "svelte";
  import InitialDiagram from "../../../../components/InitialDiagram.svelte";
  let iframe;
  let iframeOptions = null;
  const editor =
    "https://www.draw.io/?embed=1&ui=min&spin=1&proto=json&configure=1";

  let initial = null;
  let name = null;

  const edit = elt => {
    iframeOptions = { title: "Diagram Editor" };
    iframeOptions.frameborder = 0;

    const close = () => {
      window.removeEventListener("message", receive);
      iframeOptions = null;
    };

    // let draft = localStorage.getItem(".draft-" + name);

    // if (draft != null) {
    //   draft = JSON.parse(draft);

    //   if (
    //     !confirm(
    //       "A version of this page from " +
    //         new Date(draft.lastModified) +
    //         " is available. Would you like to continue editing?"
    //     )
    //   ) {
    //     draft = null;
    //   }
    // }

    const receive = evt => {
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
          // if (draft != null) {
          //   iframe.contentWindow.postMessage(
          //     JSON.stringify({ action: "load", autosave: 1, xml: draft.xml }),
          //     "*"
          //   );
          //   iframe.contentWindow.postMessage(
          //     JSON.stringify({ action: "status", modified: true }),
          //     "*"
          //   );
          // }
          // else {
          // Avoids unescaped < and > from innerHTML for valid XML
          const svg = new XMLSerializer().serializeToString(elt.firstChild);
          iframe.contentWindow.postMessage(
            JSON.stringify({ action: "load", autosave: 1, xml: svg }),
            "*"
          );
          // }
        } else if (msg.event == "export") {
          // Extracts SVG DOM from data URI to enable links
          const svg = atob(msg.data.substring(msg.data.indexOf(",") + 1));
          elt.innerHTML = svg;

          // TODO: save to web API
          // await POST...

          // localStorage.setItem(
          //   name,
          //   JSON.stringify({ lastModified: new Date(), data: svg })
          // );
          // localStorage.removeItem(".draft-" + name);
          // draft = null;
          close();
        } else if (msg.event == "autosave") {
          // localStorage.setItem(
          //   ".draft-" + name,
          //   JSON.stringify({ lastModified: new Date(), xml: msg.xml })
          // );
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
          // localStorage.setItem(
          //   ".draft-" + name,
          //   JSON.stringify({ lastModified: new Date(), xml: msg.xml })
          // );
        } else if (msg.event == "exit") {
          // localStorage.removeItem(".draft-" + name);
          // draft = null;
          close();
        }
      }
    };

    window.addEventListener("message", receive);
  };

  const load = () => {
    initial = document.getElementById("diagram").innerHTML;
    start();
  };

  const start = () => {
    // name = "default";
    // var current = localStorage.getItem(name);

    // if (current != null) {
    //   var entry = JSON.parse(current);
    //   document.getElementById("diagram").innerHTML = entry.data;
    // } else {
    document.getElementById("diagram").innerHTML = initial;
    // }
  };

  onMount(load);
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
    <div
      id="diagram"
      title="Click to edit"
      on:click={e => edit(e.currentTarget)}>
      <InitialDiagram />
    </div>
  {/if}
</section>

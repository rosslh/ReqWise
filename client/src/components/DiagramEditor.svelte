<script>
  import { onMount } from "svelte";
  export let initialSvg;
  export let callback;

  let iframe;
  let iframeOptions = { title: "Diagram Editor", frameborder: 0 };

  const editor =
    "https://www.draw.io/?embed=1&ui=min&spin=1&proto=json&configure=1";

  const edit = () => {
    const close = () => {
      window.removeEventListener("message", receive);
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
            JSON.stringify({ action: "load", autosave: 1, xml: initialSvg }),
            "*"
          );
        } else if (msg.event == "export") {
          // Extracts SVG DOM from data URI to enable links
          const svg = atob(msg.data.substring(msg.data.indexOf(",") + 1));

          await callback(svg);

          close();
        } else if (msg.event == "save") {
          iframe.style.visibility = "hidden"; // prevent double save (kinda hack)
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

  onMount(edit);
</script>

<style>
  iframe {
    position: relative;
    z-index: 2000;
    width: 100%;
    min-height: 70vh;
  }
</style>

<div id="iframeWrapper">
  <iframe
    {...iframeOptions}
    src={editor}
    title={iframeOptions.title}
    bind:this={iframe} />
</div>

<script>
  import { onMount } from "svelte";
  export let value = "";

  onMount(() => {
    if (typeof document !== "undefined") {
      let container = document.getElementById("editor");
      import("quill").then(({ default: Quill }) => {
        const quill = new Quill(container, {
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              ["link", "code-block", "blockquote"],
              [{ list: "ordered" }, { list: "bullet" }]
            ]
          },
          placeholder: "Type something...",
          theme: "snow" // or 'bubble'
        });

        quill.on("text-change", () => {
          value = container.innerText;
        });
      });
    }
  });
</script>

<style>
  #editor {
    height: 120px;
  }
</style>

<div id="editor" />

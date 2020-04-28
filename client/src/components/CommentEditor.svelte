<script>
  import { onMount } from "svelte";
  export let quillDelta;
  export let plaintext = "";

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

        quill.on("text-change", (delta, oldDelta, source) => {
          quillDelta = quill.getContents();
          plaintext = container.innerText;
        });
      });
    }
  });
</script>

<style>
  #editor {
    height: 12rem;
  }
</style>

<div id="editor" />

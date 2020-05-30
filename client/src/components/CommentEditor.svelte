<script>
  import { onMount } from "svelte";
  export let quillDelta;
  export let plaintext = "";
  export let postComment;

  let quill;

  onMount(() => {
    if (typeof document !== "undefined") {
      let container = document.getElementById("editor");
      import("quill").then(({ default: Quill }) => {
        quill = new Quill(container, {
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

        quill.on("text-change", (_delta, _oldDelta, _source) => {
          quillDelta = quill.getContents();
          plaintext = container.innerText;
        });
      });
    }
  });

  const postCommentAndClear = async () => {
    await postComment();
    quill.setText("");
  };
</script>

<style>
  .editorWrapper {
    padding-top: 1rem;
  }
  #editor {
    height: 12rem;
  }
</style>

<div class="editorWrapper">
  <div id="editor" />
  <button on:click={postCommentAndClear} class="button-success">
    Post comment
  </button>
</div>

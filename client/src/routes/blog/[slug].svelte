<script context="module">
  export async function preload({ params }) {
    // the `slug` parameter is available because
    // this file is called [slug].html
    const res = await this.fetch(`blog/${params.slug.toLowerCase()}.json`);
    const data = await res.json();

    return {
      post: data,
    };
  }
</script>

<script>
  import Helmet from "../../components/Helmet.svelte";
  export let post;
</script>

<style>
  article {
    margin-top: 1.5rem;
  }

  .postTitle {
    font-size: 2rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  :global(article.blogPost h2) {
    font-size: 1.8rem;
  }

  :global(article.blogPost img) {
    box-shadow: var(--boxShadow);
    width: 90%;
    margin: 0 auto;
    display: block;
  }

  :global(article.blogPost .imageCaption) {
    text-align: center;
    font-size: 1.4rem;
    color: var(--secondaryText);
    margin-top: -1rem;
  }

  .contentWrapper {
    padding-top: 2rem;
    max-width: 85rem;
  }

  .subtitle {
    color: var(--secondaryText);
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }

  .bullet {
    padding: 0 0.75rem;
  }
</style>

<Helmet
  title={post.title}
  description={post.blurb}
  author={post.author}
  date={post.date} />
<div class="contentWrapper mainContent">
  <a href="/blog" rel="prefetch"> &larr; Back to blog </a>
  <article class="panel blogPost">
    <h1 class="postTitle">{post.title}</h1>
    <div class="subtitle">
      {post.author}
      <span class="bullet">&bull;</span>
      <time datetime={post.date}>{post.prettyDate}</time>
    </div>

    <div class="content">
      {@html post.content}
    </div>
  </article>
</div>

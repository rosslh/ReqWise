<script context="module">
  export async function preload() {
    const result = await this.fetch("blog.json");
    const posts = await result.json();
    return {
      posts,
    };
  }
</script>

<script>
  import CurveyHeading from "../../components/CurveyHeading.svelte";
  import Helmet from "../../components/Helmet.svelte";
  export let posts;
</script>

<style>
  p.secondary {
    color: var(--secondaryText);
  }

  .postTitle {
    font-size: 2rem;
    margin-top: 1rem;
  }

  .postTitle a {
    color: var(--normalText);
  }

  .postsHeading {
    font-weight: 400;
    font-size: 1.8rem;
    margin-top: 4rem;
    color: var(--secondaryText);
  }

  .bullet {
    padding: 0 1rem;
  }
</style>

<svelte:head>
  <title>ReqWise Blog</title>
</svelte:head>
<Helmet title="ReqWise Blog" />
<CurveyHeading>
  <h1>Blog</h1>
</CurveyHeading>
<section class="contentWrapper postsSection">
  <h2 class="postsHeading">
    Latest post <span class="bullet">&bull;</span>
    {posts[0].date}
  </h2>
  <div class="panel post">
    <h3 class="postTitle">
      <a href={`/blog/${posts[0].slug}`}>{posts[0].title}</a>
    </h3>
    <p class="secondary">{posts[0].blurb}</p>
  </div>
  {#if posts.length > 1}
    <h2 class="postsHeading">Older posts</h2>
    {#each posts.slice(1) as post}
      <div class="panel post">
        <h3 class="postTitle">
          <a rel="prefetch" href={`/blog/${post.slug}`}>{post.title}</a>
        </h3>
        <p class="secondary">{post.blurb}</p>
      </div>
    {/each}
  {/if}
</section>

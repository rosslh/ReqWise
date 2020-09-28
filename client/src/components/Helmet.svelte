<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let title;
  export let description =
    "Brainstorm requirements, propose designs, and receive client sign-off with ReqWise.";
</script>

<svelte:head>
  <meta name="description" content={description} />
  <meta itemprop="name" content={title} />
  <meta itemprop="description" content={description} />
  <meta property="og:url" content={`https://reqwise.com${$page.path}`} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <title>{title}</title>
</svelte:head>

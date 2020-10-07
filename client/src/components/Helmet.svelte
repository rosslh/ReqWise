<script>
  import { stores } from "@sapper/app";
  import { formatISO } from "date-fns";
  const { page } = stores();
  export let title;
  export let description =
    "Brainstorm requirements, propose designs, and receive client sign-off with ReqWise.";

  export let date;
  export let author;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta itemprop="name" content={title} />
  <meta itemprop="description" content={description} />
  <meta property="og:url" content={`https://reqwise.com${$page.path}`} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if author}
    <meta name="author" content={author} />
    <meta property="article:author" content={author} />
    <meta property="og:type" content="article" />
  {/if}
  {#if date}
    <meta name="date" content={formatISO(new Date(date))} />
    <meta
      property="article:published_time"
      content={formatISO(new Date(date))} />
    <meta
      property="article:modified_time"
      content={formatISO(new Date(date))} />
    <meta
      name="publish_date"
      property="og:publish_date"
      content={formatISO(new Date(date))} />
    <meta property="og:updated_time" content={formatISO(new Date(date))} />
  {/if}
</svelte:head>

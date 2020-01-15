<script>
  import { jwt, userId } from "../stores.js";

  const logout = () => {
    jwt.set("");
    userId.set(-1);
  };
</script>

<style>
  div.contentWrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 5rem;
    max-width: unset;
  }
  a.logoWrapper {
    display: inline-block;
    height: 3rem;
  }

  a.logoWrapper img {
    max-height: 100%;
    max-width: 100%;
  }

  div.right {
    height: 100%;
    display: flex;
    align-items: center;
  }

  div.right > * {
    display: inline-block;
    margin: 0 0.75rem;
  }
</style>

<nav>
  <div class="contentWrapper">
    <a class="logoWrapper" href=".">
      <img src={'logo.png'} alt="ReqWise" />
    </a>
    <div class="right">
      {#if $jwt === ''}
        <a href="/sign-up">Sign Up</a>

        <a href="/login">Login</a>
      {:else}
        <a href="/teams">My Teams</a>

        <button class="button button-small button-outline" on:click={logout}>
          Log out
        </button>
      {/if}
    </div>
  </div>
</nav>

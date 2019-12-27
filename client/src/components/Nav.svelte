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
    height: 3.5rem;
    align-items: center;
  }
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  ul li {
    display: inline-block;
    padding: 0;
    margin: 0;
  }

  a.logoWrapper {
    display: inline-block;
    height: 1.3rem;
  }

  a.logoWrapper img {
    max-height: 100%;
    max-width: 100%;
  }
</style>

<nav>
  <div class="contentWrapper">
    <a class="logoWrapper" href=".">
      <img src={'logo.svg'} alt="ReqWise" />
    </a>
    {#if $jwt === ''}
      <ul>
        <li>
          <a href="/sign-up">Sign Up</a>
        </li>
        <li>
          <a href="/login">Login</a>
        </li>
      </ul>
    {:else}
      <ul>
        <li>
          <a href="/teams">My Teams</a>
        </li>
        <li>
          <button on:click={logout}>Log out</button>
        </li>
      </ul>
    {/if}
  </div>
</nav>

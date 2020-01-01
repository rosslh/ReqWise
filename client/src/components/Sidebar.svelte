<script>
  import IoMdRibbon from "svelte-icons/io/IoMdRibbon.svelte";
  import IoMdCheckmarkCircleOutline from "svelte-icons/io/IoMdCheckmarkCircleOutline.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  export let name;
</script>

<style>
  span.iconWrapper {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
  }
  ul,
  li {
    padding: 0;
    margin: 0;
  }
  li {
    list-style-type: none;
    display: flex;
    align-items: center;
    height: 5rem;
  }
  li span {
    line-height: 1.5rem;
  }
</style>

<div>{name}</div>
<ul>
  <li>
    <span class="iconWrapper">
      <IoMdCheckmarkCircleOutline />
    </span>
    <span>Features</span>
  </li>
  <li>
    <span class="iconWrapper">
      <IoMdRibbon />
    </span>
    <span>Quality Attributes</span>
  </li>
  <li>
    <span class="iconWrapper">
      <IoMdPeople />
    </span>
    <span>User Classes</span>
  </li>
  <li>
    <span class="iconWrapper">
      <MdHistory />
    </span>
    <span>Activity</span>
  </li>
</ul>

<!--

MIT License

Copyright (c) 2019 Dylan Blokhuis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

-->

<script>
  export let width = "100%";
  export let height = "25px";
  export let borderRadius = "4px";
  export let baseColor = "rgb(238, 238, 238)";
  export let highlightColor = "rgb(245, 245, 245)";
  export let animationLength = "1.2s";
</script>

<style>
  .skeleton {
    background-color: var(--baseColor);
    background-image: linear-gradient(
      90deg,
      var(--baseColor),
      var(--highlightColor),
      var(--baseColor)
    );
    background-size: 200px 100%;
    background-repeat: no-repeat;
    display: inline-block;
    width: 100%;
    animation: loading-animation var(--animationLength) ease-in-out infinite;
  }

  @keyframes loading-animation {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
</style>

<div
  class="skeleton"
  style="height: {height}; width: {width}; border-radius: {borderRadius};
  --baseColor: {baseColor}; --highlightColor: {highlightColor};
  --animationLength: {animationLength}" />

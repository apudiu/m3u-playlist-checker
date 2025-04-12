import { createSignal } from "solid-js";

export default function SourceM3u() {
  const [count, setCount] = createSignal(0);
  return (
    <form>
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Hello world!</h1>


    </form>
  );
}

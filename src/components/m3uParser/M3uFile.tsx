import {createSignal} from "solid-js";
import M3uUrl from "~/components/m3uParser/M3uUrl";

export default function M3uFile() {
  const [count, setCount] = createSignal(0);
  return (
    <div>
      <label
        class="text-gray-700 dark:text-gray-200"
        for="file"
      >
        File
      </label>
      <input
        id="file"
        type="file"
        class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
      />
    </div>
  );
}

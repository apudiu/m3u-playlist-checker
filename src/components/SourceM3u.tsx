import { createSignal } from "solid-js";

export default function SourceM3u() {
  const [count, setCount] = createSignal(0);
  return (
    <section class="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-700 capitalize dark:text-white">
        Select M3U
      </h2>

      <form>
        <div class="grid grid-cols-1 gap-6 mt-4">
          <div>
            <label class="text-gray-700 dark:text-gray-200" for="url">Url</label>
            <input
              id="url"
              type="url"
              class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>

          <div class="text-white">
            OR
          </div>

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

          <div class="text-white">
            OR
          </div>

          <div>
            <label
              class="text-gray-700 dark:text-gray-200"
              for="passwordConfirmation"
            >
              Content
            </label>
            <textarea
              id="passwordConfirmation"
              class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              rows={5}
            />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Save
          </button>
        </div>
      </form>
    </section>
  );
}

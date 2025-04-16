import {createEffect, createSignal} from "solid-js";
import M3uUrl from "~/components/m3uParser/M3uUrl";
import M3uText from "~/components/m3uParser/M3uText";
import M3uFile from "~/components/m3uParser/M3uFile";
import {parseM3U} from "~/lib/playlist-parser";

export default function SourceM3u() {
  const [m3uData, setM3uData] = createSignal("");

  createEffect(() => {
    const list = parseM3U(m3uData())
    console.log("lllllllllllll", list)
  })

  return (
    <section class="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-700 capitalize dark:text-white">
        Select M3U
      </h2>

      <form>
        <div class="grid grid-cols-1 gap-6 mt-4">
          <M3uUrl setContent={setM3uData} />

          <div class="text-white">
            OR
          </div>

          <M3uFile />

          <div class="text-white">
            OR
          </div>

          <M3uText />
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            Continue
          </button>
        </div>
      </form>
    </section>
  );
}

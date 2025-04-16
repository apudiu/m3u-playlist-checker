import {createEffect, createResource, createSignal, JSX, Setter, Suspense} from "solid-js";

const getM3uFromUrl = async (url: string) => {
  if (!url) return "";

  const res = await fetch(url);
  const data = await res.text();
  return data as string;
};

type Props = {
  setContent: Setter<string>
};

export default function M3uUrl(props: Props): JSX.Element {
  const  [url, setUrl] = createSignal("");
  const [data, actions] = createResource(url, getM3uFromUrl);

  createEffect(() => {
    const d = data();
    if (!d) return;
    props.setContent(d)
  })

  return (
    <Suspense fallback="Loading...">
      <div>
        <label class="text-gray-700 dark:text-gray-200">Url</label>
        <input
          type="url"
          class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          value={url()}
          onChange={(e) => {
            setUrl(e.target.value)
          }}
        />
      </div>
    </Suspense>
  );
}

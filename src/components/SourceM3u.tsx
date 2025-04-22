import {createEffect, createSignal, For, onCleanup, onMount, Show} from "solid-js";
import M3uUrl from "~/components/m3uParser/M3uUrl";
import M3uText from "~/components/m3uParser/M3uText";
import M3uFile from "~/components/m3uParser/M3uFile";
import {M3UTrack, parseM3U} from "~/lib/playlist-parser";
import {createStore} from "solid-js/store";
import Hls from "hls.js";
import "./SourceM3u.scss";
import {A} from "@solidjs/router";

type HLSPlayer = {
  hls: Hls | null;
  video: HTMLVideoElement;
  url: string;
}

type Store = {
  m3uData: string;
  tracks: M3UTrack[];
  error: string;
  testing: boolean;
  players: HLSPlayer[];
}

const [store, setStore] = createStore<Store>({
  m3uData: '',
  tracks: [],
  testing: false,
  error: '',
  players: []
});

const setM3uData = (data: string): void => setStore({m3uData: data});
const updateTrackStatus = (index: number, status: M3UTrack["status"]) => {
  setStore('tracks', prev => prev.map((t, i) =>
    i === index ? { ...t, status } : t
  ));
};
const setTesting = (t: boolean): void => setStore('testing', t);
const setError = (e: string): void => setStore('error', e);

export default function SourceM3u() {

  createEffect(() => {
    const list = parseM3U(store.m3uData)
    setStore('tracks', list);
    console.log("lllllllllllll", list)
  })

  onCleanup(() => {
    // Cleanup all HLS instances
    // document.querySelectorAll('video').forEach(video => {
    //   // const hls = Hls.getInstanceById(video.dataset.hlsId);
    //   // hls?.destroy();
    // });
  })

  // Test individual stream
  const testStream = async (track: M3UTrack, index: number, updateTrackStatus: (index: number, status: M3UTrack["status"]) => void) => {
    return new Promise<void>(async (resolve) => {
      let hls: Hls | null = null;
      let timeoutId: number;
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = "position: fixed; opacity: 0; pointer-events: none; width: 0; height: 0;";
      document.body.appendChild(video);

      // Store successful instances
      let successfulInstance: { hls: Hls | null; video: HTMLVideoElement } | null = null;

      // Modified cleanup for conditional handling
      const cleanup = (isSuccess: boolean) => {
        clearTimeout(timeoutId);
        video.pause();
        if (!isSuccess) {
          video.pause();
          video.remove();
          hls?.destroy();
        }
      };

      timeoutId = setTimeout(() => {
        cleanup(false);
        updateTrackStatus(index, "invalid");
        resolve();
      }, 10000);

      try {
        if (isHLS(track.url)) {
          if (Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              autoStartLoad: true,
            });

            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
              try {
                await video.play();
                cleanup(true); // Keep video element
                successfulInstance = { hls, video };
                updateTrackStatus(index, "hls");
                attachVideoToUI(successfulInstance, track); // Add to visible UI
                resolve();
              } catch (error) {
                cleanup(false);
                updateTrackStatus(index, "invalid");
                resolve();
              }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                cleanup(false);
                updateTrackStatus(index, "invalid");
                resolve();
              }
            });

            hls.loadSource(track.url);
          } else {
            // Native HLS handling
            video.src = track.url;
            video.addEventListener("loadeddata", async () => {
              try {
                await video.play();
                cleanup(true);
                successfulInstance = { hls: null, video };
                updateTrackStatus(index, "hls");
                attachVideoToUI(successfulInstance, track);
                resolve();
              } catch (error) {
                cleanup(false);
                updateTrackStatus(index, "invalid");
                resolve();
              }
            });
          }
        } else {
          // Regular video handling
          video.src = track.url;
          video.addEventListener("loadedmetadata", async () => {
            try {
              await video.play();
              cleanup(true);
              successfulInstance = { hls: null, video };
              updateTrackStatus(index, "valid");
              attachVideoToUI(successfulInstance, track);
              resolve();
            } catch (error) {
              cleanup(false);
              updateTrackStatus(index, "invalid");
              resolve();
            }
          });
        }
      } catch (error) {
        cleanup(false);
        updateTrackStatus(index, "invalid");
        resolve();
      }
    });
  };


  const handleHlsStream = async (
    url: string,
    video: HTMLVideoElement,
    cleanup: () => void,
    callback: (success: boolean) => void
  ) => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await video.play();
          callback(true);
          cleanup();
        } catch (error) {
          callback(false);
          cleanup();
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          callback(false);
          cleanup();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener("loadeddata", async () => {
        try {
          await video.play();
          callback(true);
          cleanup();
        } catch (error) {
          callback(false);
          cleanup();
        }
      });

      video.addEventListener("error", () => {
        callback(false);
        cleanup();
      });
    } else {
      callback(false);
      cleanup();
    }
  };

  const handleRegularStream = async (
    url: string,
    video: HTMLVideoElement,
    cleanup: () => void,
    callback: (success: boolean) => void
  ) => {
    video.src = url;
    video.preload = "metadata";

    const handleSuccess = async () => {
      try {
        await video.play();
        callback(true);
        cleanup();
      } catch (error) {
        callback(false);
        cleanup();
      }
    };

    const handleError = () => {
      callback(false);
      cleanup();
    };

    video.addEventListener("loadedmetadata", handleSuccess);
    video.addEventListener("error", handleError);

    // Fallback for browsers that don't fire loadedmetadata
    setTimeout(() => {
      if (video.readyState >= 1) return;
      handleError();
    }, 3000);
  };

  // Test all streams with concurrency control
  const testAllStreams = async (concurrency = 10) => { // Reduced concurrency for video
    setTesting(true);
    setError("");

    try {
      const trackPromises = [...store.tracks.entries()];
      const pool = new Set<Promise<void>>();

      while (trackPromises.length > 0) {
        while (pool.size < concurrency && trackPromises.length > 0) {
          const [index, track] = trackPromises.shift()!;
          const promise = testStream(track, index, updateTrackStatus)
            .finally(() => pool.delete(promise));
          pool.add(promise);
        }
        await Promise.race(pool);
      }

      await Promise.all(pool);
    } catch (err) {
      setError("Error testing video streams");
    } finally {
      setTesting(false);
    }
  };

  // Helper for status colors
  const getStatusColor = (status: M3UTrack["status"]) => {
    switch (status) {
      case "valid": return "#00ff00";
      case "hls": return "#00ffff";
      case "invalid": return "#ff0000";
      case "testing": return "#ffff00";
      default: return "transparent";
    }
  };

  const checkHlsManifest = async (url: string) => {
    try {
      const response = await fetch(url);
      const manifest = await response.text();
      return manifest.includes("#EXT-X-STREAM-INF") || manifest.includes("#EXT-X-MEDIA");
    } catch {
      return false;
    }
  };

  return (
    <section class="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-700 capitalize dark:text-white">
        Select M3U
      </h2>

      <form>
        <div class="grid grid-cols-1 gap-6 mt-4">
          <M3uUrl setContent={setM3uData}/>

          <div class="text-white">
            OR
          </div>

          <M3uFile/>

          <div class="text-white">
            OR
          </div>

          <M3uText/>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            Continue
          </button>
        </div>
      </form>

      <div class="mt-4">
        {/* Existing input/button */}
        <Show when={store.tracks.length}>
          <button
            class="text-white uppercase border border-gray-50 rounded-md p-3"
            onClick={() => testAllStreams()}
            disabled={store.testing || store.tracks.length === 0}
          >
            {store.testing ? "Testing..." : "Test All Streams"}
          </button>
        </Show>

        <Show when={store.error}>
          <div style={{color: "red"}}>{store.error}</div>
        </Show>

        {/* Track display */}
        <For each={store.tracks}>
          {(track, i) => (
            <div class="video-container" data-track-id={track.url}>
              <h3>{track.title}</h3>
              <div class="status">Status: {track.status}</div>
              {/* Video will be inserted here by attachVideoToUI */}
            </div>
          )}
        </For>

      </div>
    </section>
  );
}

const isHLS = (url: string) => url.toLowerCase().endsWith(".m3u8");

const attachVideoToUI = (instance: { hls: Hls | null; video: HTMLVideoElement }, track: M3UTrack) => {
  if (!document) {
    console.log("in server document is not available");
    return;
  }

  const container = document.querySelector(`[data-track-id="${track.url}"]`);
  if (container) {
    instance.video.style.cssText = "width: 100%; max-width: 600px; display: block;";
    instance.video.controls = true;
    container.appendChild(instance.video);
  }
};

// Separate HLS video component
function VideoPlayer(props: { url: string }) {
  let video: HTMLVideoElement;
  let hls: Hls | null = null;

  onMount(() => {
    if (isHLS(props.url)) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.attachMedia(video);
        hls.loadSource(props.url);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = props.url;
      }
    }
  });

  onCleanup(() => {
    hls?.destroy();
  });

  return (
    <video
      ref={video!}
      controls
      muted
      playsinline
      style={{ width: "100%", "max-width": "600px" }}
    />
  );
}
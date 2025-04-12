import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import solidDevtools from "solid-devtools/vite";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      solidDevtools({
        autoname: true,
      }),
    ],
  }
});

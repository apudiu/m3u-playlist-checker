export interface M3UTrack {
  duration: number;
  title: string;
  url: string;
  status: "untested" | "testing" | "valid" | "invalid";
}

export function parseM3U(text: string): M3UTrack[] {
  const tracks: M3UTrack[] = [];
  const lines = text.split("\n");
  let currentTrack: Partial<M3UTrack> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("#EXTINF:")) {
      const parts = trimmed.substring(8).split(",");
      const durationMatch = parts[0].match(/(-?\d+)/);
      currentTrack = {
        duration: durationMatch ? parseInt(durationMatch[1]) : 0,
        title: parts.slice(1).join(",").trim(),
        status: "untested",
      };
    } else if (trimmed && !trimmed.startsWith("#")) {
      currentTrack.url = trimmed;
      tracks.push(currentTrack as M3UTrack);
      currentTrack = {};
    }
  }

  return tracks;
}

// todo: adding tracker
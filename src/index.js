// Only the background video is routed through this Worker.
// Cloudflare Workers Static Assets otherwise serve files without running code.
// Safari may request videos using HTTP Range; return byte ranges when requested.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== "/media/background.mp4") {
      return env.ASSETS.fetch(request);
    }

    // Obtain the complete static asset; Cloudflare assets currently ignore Range.
    const asset = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
    if (!asset.ok) return asset;

    const data = await asset.arrayBuffer();
    const size = data.byteLength;
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    });

    const range = request.headers.get("Range");
    if (!range) {
      headers.set("Content-Length", String(size));
      return new Response(request.method === "HEAD" ? null : data, {
        status: 200,
        headers,
      });
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match || (!match[1] && !match[2])) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    let start;
    let end;
    if (!match[1]) {
      const suffixLength = Number(match[2]);
      if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
        headers.set("Content-Range", `bytes */${size}`);
        return new Response(null, { status: 416, headers });
      }
      start = Math.max(0, size - suffixLength);
      end = size - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : size - 1;
    }

    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
        start < 0 || start >= size || end < start) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    end = Math.min(end, size - 1);
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(request.method === "HEAD" ? null : data.slice(start, end + 1), {
      status: 206,
      headers,
    });
  },
};

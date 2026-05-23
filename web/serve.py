#!/usr/bin/env python3
"""Dungeon Debt static dev server.

Serves the web/ folder with no-cache headers and correct ES-module MIME types.
No build step, no dependencies.

Usage:  python serve.py [port]      (default port 5173)
Then open http://localhost:5173
"""
import os
import sys
import http.server

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173

# Run from the directory containing this script so the preview always serves
# web/ no matter where it was launched from.
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("[serve] %s\n" % (fmt % args))


Handler.protocol_version = "HTTP/1.1"
http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
    print(f"Dungeon Debt running:  http://localhost:{PORT}")
    print("Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[serve] stopped.")

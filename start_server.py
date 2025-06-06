#!/usr/bin/env python3
"""
SIMPLETS Terminal Server
v0.8.0

A simple HTTP server for the SIMPLETS Terminal.

Usage:
  1. Make sure you have Python 3 installed. On macOS use:
     $ brew install python3
     
  2. Run the server:
     $ python3 start_server.py
     
  3. If you see "command not found: python3", try:
     $ /usr/bin/python3 start_server.py
     or
     $ /opt/homebrew/bin/python3 start_server.py
"""
import http.server
import socketserver
import socket
import webbrowser
import os
import signal
import sys
from contextlib import closing
import time
import logging

# Slow request threshold in milliseconds
SLOW_THRESHOLD_MS = 100.0

# Configure logging for request timing
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

def find_free_port():
    """Find a free port on localhost"""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]

def handle_exit(signum, frame):
    """Handle exit signals gracefully"""
    print("\nShutting down server...")
    try:
        os.remove('.server-port')
        os.remove('.server-pid')
    except:
        pass
    sys.exit(0)

class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that logs only slow requests"""
    def do_GET(self):
        start = time.time()
        super().do_GET()
        duration = (time.time() - start) * 1000
        if duration >= SLOW_THRESHOLD_MS:
            logging.warning("Slow GET %s: %.2fms", self.path, duration)

    def do_POST(self):
        start = time.time()
        super().do_POST()
        duration = (time.time() - start) * 1000
        if duration >= SLOW_THRESHOLD_MS:
            logging.warning("Slow POST %s: %.2fms", self.path, duration)

def main():
    # Register signal handlers
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
    
    # Measure port selection time
    t0 = time.time()
    port = find_free_port()
    logging.info("Port found in %.2fms", (time.time() - t0) * 1000)
    
    # Measure server setup time
    t1 = time.time()
    handler = LoggingHTTPRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    logging.info("Server set up in %.2fms", (time.time() - t1) * 1000)
    
    # Save the PID and port for reference
    with open('.server-pid', 'w') as f:
        f.write(str(os.getpid()))
    
    with open('.server-port', 'w') as f:
        f.write(str(port))
    
    # Log server start info
    logging.info("Server running at http://localhost:%d", port)
    logging.info("Press Ctrl+C to stop the server")
    
    # Measure browser launch time
    t2 = time.time()
    webbrowser.open(f"http://localhost:{port}")
    logging.info("Browser opened in %.2fms", (time.time() - t2) * 1000)
    
    # Start the server
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    main()

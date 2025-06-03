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

def main():
    # Register signal handlers
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
    
    # Find an available port
    port = find_free_port()
    
    # Create the HTTP server
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    
    # Save the PID and port for reference
    with open('.server-pid', 'w') as f:
        f.write(str(os.getpid()))
    
    with open('.server-port', 'w') as f:
        f.write(str(port))
    
    # Print server information
    print(f"SIMPLETS Terminal server running at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Open the browser
    webbrowser.open(f"http://localhost:{port}")
    
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

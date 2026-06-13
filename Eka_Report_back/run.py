import sys
import os
import threading
import time
import uvicorn
import webview
import subprocess

# Track start time to prevent infinite restart loops on persistent startup errors
START_TIME = time.time()
APP_EXITING = False

# Ensure backend directory is in path when running from arbitrary directories
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.main import app


def start_server():
    # Configure uvicorn settings
    host = settings.HOST
    port = settings.PORT
    print(f"Starting Eka Report Studio server on {host}:{port}...")
    
    if getattr(sys, "frozen", False):
        # In frozen mode, reload must be False and we pass the app object directly
        uvicorn.run(app, host=host, port=port)
    else:
        # In development mode, uvicorn can reload the app dynamically on code changes
        uvicorn.run("app.main:app", host=host, port=port, reload=True)

def wait_for_server(host, port, timeout=30):
    """Poll the server until it responds or timeout (seconds) is reached."""
    import urllib.request
    url = f"http://{host}:{port}/health"
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.1)
    return False


def restart_application():
    """Relaunches the current application and exits."""
    if APP_EXITING:
        return
    uptime = time.time() - START_TIME
    # If the app crashed in under 10 seconds, avoid infinite loop restarts
    if uptime < 10.0:
        print(f"Application crashed shortly after startup (uptime: {uptime:.1f}s). Exiting to prevent loop.")
        os._exit(1)

    print("Auto-restarting application due to unexpected crash...")
    try:
        if getattr(sys, "frozen", False):
            # Relaunch the compiled EXE
            subprocess.Popen([sys.executable] + sys.argv[1:])
        else:
            # Relaunch in python dev environment
            subprocess.Popen([sys.executable] + sys.argv)
    except Exception as e:
        print(f"Failed to auto-restart: {e}")
    os._exit(1)

def monitor_server(server_thread):
    """Monitors if the backend server thread stays alive. If not, triggers a restart."""
    # Give the server a few seconds to start up
    time.sleep(10.0)
    while True:
        if APP_EXITING:
            break
        if not server_thread.is_alive():
            if APP_EXITING:
                break
            print("Backend server thread terminated unexpectedly!")
            restart_application()
        time.sleep(2.0)

if __name__ == "__main__":
    is_frozen = getattr(sys, "frozen", False)
    
    if is_frozen:
        try:
            # Start uvicorn server in a background daemon thread
            server_thread = threading.Thread(target=start_server, daemon=True)
            server_thread.start()

            # Start monitoring thread for backend crashes
            monitor_thread = threading.Thread(target=monitor_server, args=(server_thread,), daemon=True)
            monitor_thread.start()

            host = settings.HOST
            if host == "0.0.0.0":
                host = "127.0.0.1"

            # Wait until the server is actually ready before opening the window
            ready = wait_for_server(host, settings.PORT, timeout=30)
            if not ready:
                time.sleep(1.0)

            url = f"http://{host}:{settings.PORT}"
            
            # Open in a dedicated application window using Edge/WebView2 via pywebview
            window = webview.create_window(
                title="Eka Report Studio",
                url=url,
                width=1280,
                height=800,
                min_size=(800, 600)
            )
            
            def on_closed():
                global APP_EXITING
                APP_EXITING = True
                print("GUI window closed by user. Shutting down server and exiting process...")
                os._exit(0)
                
            window.events.closed += on_closed
            
            webview.start()
            
            # Ensure normal shutdown when GUI window is closed by the user
            APP_EXITING = True
            os._exit(0)
        except Exception as e:
            print(f"GUI crash or runtime error: {e}")
            restart_application()
    else:
        # In development mode, run server directly on the main thread
        start_server()



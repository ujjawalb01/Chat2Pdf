import subprocess
import sys

print("Starting browser install...")
result = subprocess.run(
    ['npx', 'playwright', 'install', 'chromium'],
    cwd='/home/ujjawal/Chat2Pdf/server',
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print("Error:", result.stderr)
    sys.exit(result.returncode)

print("Browser installed successfully")
print(result.stdout)

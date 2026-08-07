import subprocess
import os

env = os.environ.copy()
env['PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD'] = '1'

subprocess.run(
    ['npm', 'install', 'playwright', '--no-fund', '--no-audit'],
    cwd='/home/ujjawal/Chat2Pdf/server',
    env=env
)

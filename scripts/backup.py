# Usage: ./backup.sh <editorPath> <backupPath>
# Description: This script is used to backup the data of the editor to the backupPath
# Example: ./backup.sh ~/LightDancer-Editor ~/LightTableBackup
# Note: You can setup crontab to run this script periodically
#      1. crontab -e
#      2. Add a line like this: 0 * * * * python3 ~/LightDance-Editor/scripts/backup.py ~/LightDance-Editor ~/LightTableBackup
#      3. Save and exit

import sys
import subprocess
import os
from os import path
from datetime import datetime

editorPath = sys.argv[1]
backupPath = sys.argv[2]

utilsPath = path.join(editorPath, "utils")
subprocess.run(["pnpm", "save"], cwd=utilsPath)

tables = [file for file in os.listdir(backupPath) if file != ".git"]
tables.sort()

updateTable = False
if len(tables) == 0:
    updateTable = True

exportTablePath = path.join(utilsPath, "out", "exportData.json")
if not updateTable:
    lastTableName = tables[-1]
    lastTablePath = path.join(backupPath, lastTableName)

    diffResult = subprocess.run(["diff", "-q", lastTablePath, exportTablePath])
    if diffResult.returncode == 1:
        updateTable = True

if updateTable:
    now = datetime.now()
    timestamp = now.strftime('%H:%M:%S-%d.%m.%Y')
    newTablePath = path.join(backupPath, f"{timestamp}.json")

    subprocess.run(["cp", exportTablePath, newTablePath])
    subprocess.run(["git", "add", "."], cwd=backupPath)
    subprocess.run(["git", "commit", "-m", f"backup {timestamp}"], cwd=backupPath)
    subprocess.run(["git", "push"], cwd=backupPath)

# Usage: ./backup.py <editorPath> <backupPath>
# Description: This script is used to backup the data of the editor to the backupPath
# Example: ./backup.py ~/production/LightDancer-Editor ~/production/NewLightTableBackup

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
    timestamp = now.strftime('%Y.%m.%d-%H:%M:%S')
    newTablePath = path.join(backupPath, f"lighttable.json")

    subprocess.run(["cp", exportTablePath, newTablePath])
    subprocess.run(["git", "add", "."], cwd=backupPath)
    subprocess.run(["git", "commit", "-m", f"backup {timestamp}"], cwd=backupPath)
    subprocess.run(["git", "push"], cwd=backupPath)

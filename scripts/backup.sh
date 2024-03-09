# Usage: ./backup.sh <editorPath> <backupPath>
# Description: This script is used to backup the data of the editor to the backupPath
# Example: ./backup.sh ~/LightDancer-Editor ~/LightTableBackup

editorPath=$1
backupPath=$2

cd $editorPath/utils
pnpm save

time=$(date '+%H:%M:%S-%m.%d.%Y')
cp ./out/exportData.json $backupPath/

cd $backupPath
mv ./exportData.json ./$time.json

# Usage: ./backup.sh <editorPath> <backupPath>
# Description: This script is used to backup the data of the editor to the backupPath
# Example: ./backup.sh ~/LightDancer-Editor ~/LightTableBackup
# Note: You can setup crontab to run this script periodically
#      1. crontab -e
#      2. Add a line like this: 0 * * * * sh ~/LightDance-Editor/scripts/backup.sh ~/LightDance-Editor ~/LightTableBackup
#      3. Save and exit

editorPath=$1
backupPath=$2

cd $editorPath/utils
pnpm save

time=$(date '+%H:%M:%S-%m.%d.%Y')
cp ./out/exportData.json $backupPath/

cd $backupPath
mv ./exportData.json ./$time.json

git add .
git commit -m "backup $time"
git push

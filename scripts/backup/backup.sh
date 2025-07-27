# You can setup crontab to run this script periodically
#      1. crontab -e
#      2. Add a line like this: 0 * * * * bash ~/prodution/LightDance-Editor/scripts/backup.sh
#      3. Save and exit

# setup nvm for using pnpm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

python3 ~/production/LightDance-Editor/scripts/backup/backup.py ~/production/LightDance-Editor ~/production/NewLightTableBackup

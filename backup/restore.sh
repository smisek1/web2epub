BACKUP_DIR="/home/pi/Documents/NAS/_filmy/_ostatni/conversion/regulary/"

# Get the name of the latest backup file
LATEST_BACKUP_FILE=$(ls -1t $BACKUP_DIR | head -n 1)

# Restore the database from the backup file
export PGPASSWORD='Pa$$w0rd' 
psql -U postgres -h localhost -p 5432 -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'conversion';"
dropdb -U postgres -h localhost -p 5432 conversion
createdb -U postgres -h localhost -p 5432 conversion
psql -U postgres -h localhost -p 5432 -d conversion < "$BACKUP_DIR/$LATEST_BACKUP_FILE"




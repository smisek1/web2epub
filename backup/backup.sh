#!/bin/bash

# Set the backup directory
BACKUP_DIR="/home/pi/Documents/NAS/_filmy/_ostatni/conversion/regulary/"

# Connect to the PostgreSQL database and dump the data to a backup file
export PGPASSWORD='Pa$$w0rd' 
pg_dump -U "postgres" -h "localhost" -p "5432" -d conversion -f "$BACKUP_DIR/`date +%Y-%m-%d`.tar" 

# Delete backups older than 7 days
find $BACKUP_DIR -mtime +14 -type f -delete


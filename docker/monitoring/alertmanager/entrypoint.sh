#!/bin/sh
set -e
# Template kept for future SMTP; currently static-safe config.
cp /etc/alertmanager/alertmanager.yml.tmpl /tmp/alertmanager.yml
exec /bin/alertmanager --config.file=/tmp/alertmanager.yml --storage.path=/alertmanager

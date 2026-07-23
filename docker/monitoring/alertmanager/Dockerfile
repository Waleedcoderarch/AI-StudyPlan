FROM prom/alertmanager:v0.27.0
USER root
COPY alertmanager.yml.tmpl /etc/alertmanager/alertmanager.yml.tmpl
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER nobody
ENTRYPOINT ["/entrypoint.sh"]

FROM grafana/grafana:11.2.0
ENV GF_AUTH_ANONYMOUS_ENABLED=false \
    GF_USERS_ALLOW_SIGN_UP=false \
    GF_USERS_DEFAULT_THEME=dark \
    GF_SERVER_SERVE_FROM_SUB_PATH=true \
    GF_SECURITY_ALLOW_EMBEDDING=true \
    GF_ANALYTICS_REPORTING_ENABLED=false \
    GF_ANALYTICS_CHECK_FOR_UPDATES=false \
    GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/ai-studyplan-ops.json
COPY provisioning /etc/grafana/provisioning
COPY dashboards /var/lib/grafana/dashboards

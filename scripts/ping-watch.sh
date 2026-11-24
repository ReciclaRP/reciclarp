#!/usr/bin/env bash
#
# Vigia a API do ReciclaRP pelo /api/ping e avisa quando ela cai e quando volta.
# Opcionalmente manda um SMS (Twilio) a cada mudança de estado.
#
# Uso:
#   ./scripts/ping-watch.sh [url] [intervalo_em_segundos]
#
#   ./scripts/ping-watch.sh                                     # http://localhost:3000/api/ping a cada 30s
#   ./scripts/ping-watch.sh http://192.168.0.10:3000/api/ping 15
#
# SMS (desligado por padrão). Exporte as quatro variáveis e o script passa a
# avisar por SMS; sem elas, só imprime no terminal:
#
#   export TWILIO_ACCOUNT_SID="AC..."
#   export TWILIO_AUTH_TOKEN="..."     # é senha: não cole no script nem no git
#   export TWILIO_FROM="+17372508034"  # número Twilio que envia
#   export TWILIO_TO="+5516997477431"  # seu celular que recebe
#   ./scripts/ping-watch.sh
#
# Dica: o intervalo padrão de 30s gera ~30 requisições por 15 min, bem abaixo
# do limite de 100/15min por IP. Se baixar muito o intervalo (menos de 10s), o
# /api/ping pode passar a responder 429 e o script vai reportar o código HTTP.
# Pare com Ctrl+C.

set -uo pipefail

URL="${1:-http://localhost:${RECICLA_API_PORT:-3000}/api/ping}"
INTERVAL="${2:-30}"

# O SMS só liga quando as quatro variáveis existem.
if [[ -n "${TWILIO_ACCOUNT_SID:-}" && -n "${TWILIO_AUTH_TOKEN:-}" \
   && -n "${TWILIO_FROM:-}" && -n "${TWILIO_TO:-}" ]]; then
  SMS_ATIVO=1
else
  SMS_ATIVO=0
fi

enviar_sms() {
  local texto="$1"

  (( SMS_ATIVO )) || return 0

  # A credencial vai por --config - (stdin) para não aparecer em `ps`.
  printf 'user = "%s:%s"\n' "$TWILIO_ACCOUNT_SID" "$TWILIO_AUTH_TOKEN" |
    curl --silent --show-error --max-time 10 --config - \
         --request POST \
         "https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json" \
         --data-urlencode "To=${TWILIO_TO}" \
         --data-urlencode "From=${TWILIO_FROM}" \
         --data-urlencode "Body=${texto}" \
         --output /dev/null \
  || echo "$(date '+%F %T') falha ao enviar SMS" >&2
}

offline=0

while true; do
  # Só o código HTTP importa; o corpo (o IP do cliente) é descartado.
  status=$(curl --silent --show-error --output /dev/null \
                --max-time 5 --write-out '%{http_code}' "$URL" 2>/dev/null)

  if [[ "$status" == 2* ]]; then
    if (( offline )); then
      msg="$(date '+%F %T') API voltou: $URL"
      echo "$msg"
      enviar_sms "$msg"
      offline=0
    fi
  else
    if (( ! offline )); then
      msg="$(date '+%F %T') API fora do ar (HTTP ${status:-000}): $URL"
      echo "$msg" >&2
      enviar_sms "$msg"
      offline=1
    fi
  fi

  sleep "$INTERVAL"
done

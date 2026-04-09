#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.local"
VITE_PORT=5173

# Restaurer VITE_TWITCH_PARENT=localhost à la sortie
cleanup() {
  echo ""
  echo "[tunnel] Restauration de VITE_TWITCH_PARENT=localhost..."
  sed -i 's/^VITE_TWITCH_PARENT=.*/VITE_TWITCH_PARENT=localhost/' "$ENV_FILE"
  # Tuer les processus enfants
  kill 0 2>/dev/null || true
}
trap cleanup EXIT

# Vérifier que cloudflared est installé
if ! command -v cloudflared &>/dev/null; then
  echo "[tunnel] cloudflared n'est pas installé."
  echo "  Installe-le via : sudo apt install cloudflared"
  echo "  Ou voir : https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  exit 1
fi

# Lancer cloudflared et capturer l'URL du tunnel
echo "[tunnel] Lancement de cloudflared..."
TUNNEL_LOG=$(mktemp)
cloudflared tunnel --url "http://127.0.0.1:$VITE_PORT" 2>"$TUNNEL_LOG" &
CF_PID=$!

# Attendre que l'URL du tunnel apparaisse dans les logs
TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done
rm -f "$TUNNEL_LOG"

if [ -z "$TUNNEL_URL" ]; then
  echo "[tunnel] Impossible de récupérer l'URL du tunnel après 30s."
  exit 1
fi

# Extraire le hostname (sans https://)
TUNNEL_HOST="${TUNNEL_URL#https://}"

# Mettre à jour .env.local
sed -i "s/^VITE_TWITCH_PARENT=.*/VITE_TWITCH_PARENT=$TUNNEL_HOST/" "$ENV_FILE"

echo ""
echo "========================================"
echo "  Tunnel actif : $TUNNEL_URL"
echo "  VITE_TWITCH_PARENT mis à jour : $TUNNEL_HOST"
echo ""
echo "  N'oublie pas d'ajouter cette URL comme"
echo "  redirect URI dans la Twitch Developer Console :"
echo "  https://dev.twitch.tv/console/apps"
echo "========================================"
echo ""

# Lancer Vite en HTTP (TUNNEL=1 désactive basicSsl dans vite.config.ts)
TUNNEL=1 npx vite --port "$VITE_PORT" --host 127.0.0.1

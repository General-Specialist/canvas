#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXT_DIR="$PROJECT_ROOT/extension"
XPI_NAME="focus-blocker@jarvis.local.xpi"
XPI_PATH="$PROJECT_ROOT/$XPI_NAME"

echo "📦 Packaging LibreWolf extension..."
cd "$EXT_DIR"
rm -f "$XPI_PATH"
zip -r -q -FS "$XPI_PATH" ./*

echo "✅ Created $XPI_PATH"

# Find LibreWolf profiles
PROFILES_DIR="$HOME/Library/Application Support/librewolf/Profiles"
if [ ! -d "$PROFILES_DIR" ]; then
  PROFILES_DIR="$HOME/Library/Application Support/LibreWolf/Profiles"
fi

if [ -d "$PROFILES_DIR" ]; then
  for p in "$PROFILES_DIR"/*; do
    if [ -d "$p" ]; then
      EXT_TARGET_DIR="$p/extensions"
      mkdir -p "$EXT_TARGET_DIR"
      cp -f "$XPI_PATH" "$EXT_TARGET_DIR/$XPI_NAME"
      echo "  👉 Copied extension to profile: $(basename "$p")"
    fi
  done
fi

# Add policy to LibreWolf distribution policies.json if available
POLICIES_JSON="/Applications/LibreWolf.app/Contents/Resources/distribution/policies.json"
if [ -f "$POLICIES_JSON" ]; then
  echo "⚙️  Configuring LibreWolf Enterprise Policy..."
  python3 - <<EOF
import json

policies_path = "$POLICIES_JSON"
xpi_path = "$XPI_PATH"

try:
    with open(policies_path, 'r') as f:
        data = json.load(f)
    
    if "policies" not in data:
        data["policies"] = {}
    if "ExtensionSettings" not in data["policies"]:
        data["policies"]["ExtensionSettings"] = {}
    
    data["policies"]["ExtensionSettings"]["focus-blocker@jarvis.local"] = {
        "install_url": f"file://{xpi_path}",
        "installation_mode": "normal_installed",
        "private_browsing": True
    }
    
    with open(policies_path, 'w') as f:
        json.dump(data, f, indent=4)
    print("  ✅ LibreWolf policies.json updated with auto-install policy!")
except Exception as e:
    print("  ⚠️ Notice updating policies.json:", e)
EOF
fi

echo ""
echo "🎉 Extension installation complete!"
echo "Restart LibreWolf or open a new tab to see Jarvis Focus Blocker active."

#!/bin/bash

PACK_FOR_RELEASE=false
while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--release)
      PACK_FOR_RELEASE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

PACK_NAME="__blender_temp__"
FOLDER_NAME="editor-blender"

CURRENT_DIR=$(dirname $(realpath $0))
ROOT_DIR=$(dirname $(dirname $CURRENT_DIR))
BLENDER_DIR="$ROOT_DIR/editor-blender"

# Create temp folder
PACK_DIR="$ROOT_DIR/$PACK_NAME"
if [[ ! -d $PACK_DIR ]]; then
  mkdir -p "$PACK_DIR"
fi

# Copy blender dir
cp -r "$BLENDER_DIR" "$PACK_DIR"
PACK_BLENDER_PATH="$PACK_DIR/editor-blender"

# Copy dotenv file
if $PACK_FOR_RELEASE; then
  cp "$BLENDER_DIR/pack/.env.production" "$PACK_BLENDER_PATH/.env"
else
  cp "$BLENDER_DIR/.env.development" "$PACK_BLENDER_PATH/.env"
fi

# Remove pack folder
RELEASE_PATH="$PACK_BLENDER_PATH/pack"
rm -rf "$RELEASE_PATH"

# Remove testing folder
TESTS_PATH="$PACK_BLENDER_PATH/tests"
rm -rf "$TESTS_PATH"

# Remove venv folder
VENV_PATH="$PACK_BLENDER_PATH/.venv"
rm -rf "$VENV_PATH"

# Remove __pycache__ folders
remove_pycache() {
  for dir in "$1"/*; do
    if [[ -d "$dir" ]]; then
      if [[ $(basename "$dir") == "__pycache__" ]]; then
        rm -rf "$dir"
      else
        remove_pycache "$dir"
      fi
    fi
  done
}
remove_pycache "$PACK_BLENDER_PATH"

WHEELS_DIR="$PACK_BLENDER_PATH/wheels"

pack() {
  # Update manifest file
  MANIFEST_FILE="$PACK_BLENDER_PATH/blender_manifest.toml"

  # Get list of .whl files
  WHEELS_LIST=($(find "$WHEELS_DIR" -name "*.whl" -exec basename {} \;))

  # Convert wheels list to TOML array
  WHEELS_TOML=$(printf "\"./wheels/%s\", " "${WHEELS_LIST[@]}")
  WHEELS_TOML="[${WHEELS_TOML%, }]"

  # Update the manifest file (not working on MacOS)
  # sed -i '' "/wheels =/c\wheels = $WHEELS_TOML" "$MANIFEST_FILE"

  # Zip the folder
  cd "$PACK_DIR"
  zip -rq "$FOLDER_NAME.zip" "$FOLDER_NAME"
}

# Download wheels
# For Linux/MacOS
if pip download -r "$PACK_BLENDER_PATH/requirements.prod.txt" --dest "$WHEELS_DIR" --python-version 311 --only-binary=:all: -q; then
  pack
  mv "$FOLDER_NAME.zip" "$ROOT_DIR/$FOLDER_NAME-unix.zip"
  echo Bundled Linux/MacOS version successfully.
  rm -rf "$WHEELS_DIR"
fi
# For Windows
if pip download -r "$PACK_BLENDER_PATH/requirements.prod.txt" --dest "$WHEELS_DIR" --python-version 311 --only-binary=:all: --platform win_amd64 -q; then
  pack
  mv "$FOLDER_NAME.zip" "$ROOT_DIR/$FOLDER_NAME-win.zip"
  echo Bundled Windows version successfully.
  rm -rf "$WHEELS_DIR"
fi

# Remove temp folder
rm -rf "$PACK_DIR"

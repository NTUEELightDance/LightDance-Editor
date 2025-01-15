#!/bin/bash

PACK_FOR_RELEASE=false
while [[ $# -gt 0 ]]; do
  case $1 in
  -h | --help)
    echo "Usage: bundle.sh [options]"
    echo "Options:"
    echo "  -h, --help      Show this help message and exit"
    echo "  -r, --release   Connect to production server if set"
    echo "  -o, --output    Specify output directory"
    exit 0
    ;;
  -r | --release)
    PACK_FOR_RELEASE=true
    shift
    ;;
  -o | --output)
    if [[ -n $2 ]] && [[ -d $2 ]]; then
      OUTPUT_DIR=$(realpath $2)
      shift
    else
      echo "Error: Output directory invalid"
      exit 1
    fi
    shift
    ;;
  *)
    echo "Error: Invalid argument: $1"
    exit 1
    ;;
  esac
done

PACK_NAME="__blender_temp__"
FOLDER_NAME="editor-blender"

PWD_DIR=$(pwd)
CURRENT_DIR=$(dirname $(realpath $0))
ROOT_DIR=$(dirname $(dirname $CURRENT_DIR))
BLENDER_DIR="$ROOT_DIR/editor-blender"

WHEELS_CACHE_DIR="$BLENDER_DIR/.wheels-cache"
CACHE_HIT=false
if [ -f $WHEELS_CACHE_DIR/context.sha1 ] &&
  [ $(cat "$BLENDER_DIR/requirements.prod.txt" "$BLENDER_DIR/blender_manifest.toml" | sha1sum | head -c 40) = $(cat "$WHEELS_CACHE_DIR/context.sha1") ] &&
  [ $(sha1sum "$WHEELS_CACHE_DIR/unix"/* "$WHEELS_CACHE_DIR/win"/* | sha1sum | head -c 40) = $(cat "$WHEELS_CACHE_DIR/integrity.sha1") ]; then
  CACHE_HIT=true
  echo Found dependency cache
fi

if ! $CACHE_HIT; then
  echo No dependency cache found, creating one
  pip download -r "$BLENDER_DIR/requirements.prod.txt" --dest "$WHEELS_CACHE_DIR/unix" --python-version 311 --only-binary=:all: -q && echo Downloaded Linux/MacOS wheels
  pip download -r "$BLENDER_DIR/requirements.prod.txt" --dest "$WHEELS_CACHE_DIR/win" --python-version 311 --only-binary=:all: --platform win_amd64 -q && echo Downloaded Windows wheels
  cat "$BLENDER_DIR/requirements.prod.txt" "$BLENDER_DIR/blender_manifest.toml" | sha1sum | head -c 40 >"$WHEELS_CACHE_DIR/context.sha1"
  sha1sum "$WHEELS_CACHE_DIR/unix"/* "$WHEELS_CACHE_DIR/win"/* | sha1sum | head -c 40 >"$WHEELS_CACHE_DIR/integrity.sha1"
  echo Created dependency cache
fi

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

# Remove dev files
rm -rf "$PACK_BLENDER_PATH"/{.vscode,pack,tests,.venv,.wheels-cache}

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

  # Update the manifest file
  if [[ "$OSTYPE" == "darwin"* ]]; then # BSD sed, NOTE: missing indent is intentional
    sed -i '' "/wheels =/c\\
wheels = $WHEELS_TOML\\

" "$MANIFEST_FILE"
  else # GNU sed
    sed -i "/wheels =/c\wheels = $WHEELS_TOML" "$MANIFEST_FILE"
  fi

  # Zip the folder
  cd "$PACK_DIR"
  zip -rq "$FOLDER_NAME.zip" "$FOLDER_NAME"
}

OUTPUT_DIR=${OUTPUT_DIR:-$ROOT_DIR}

# Download wheels
# For Linux/MacOS
cp "$WHEELS_CACHE_DIR/unix" "$WHEELS_DIR" -r
pack
mv "$FOLDER_NAME.zip" "$OUTPUT_DIR/$FOLDER_NAME-unix.zip"
echo Bundled Linux/MacOS version at "$(realpath $OUTPUT_DIR/$FOLDER_NAME-unix.zip --relative-to $PWD_DIR)".

# For Windows
rm -rf "$WHEELS_DIR" && cp "$WHEELS_CACHE_DIR/win" "$WHEELS_DIR" -r
pack
mv "$FOLDER_NAME.zip" "$OUTPUT_DIR/$FOLDER_NAME-win.zip"
echo Bundled Windows version at "$(realpath $OUTPUT_DIR/$FOLDER_NAME-win.zip --relative-to $PWD_DIR)".

# Remove temp folder
rm -rf "$PACK_DIR"

#!/bin/bash

set -e

PACK_FOR_RELEASE=false
while [[ $# -gt 0 ]]; do
  case $1 in
  -h | --help)
    echo "Usage: bundle.sh [options]"
    echo "Options:"
    echo "  -h, --help      Show this help message and exit"
    echo "  -l, --local     Bundle dependencies for local machine"
    echo "  -o, --output    Specify output directory"
    echo "  -r, --release   Connect to production server if set"
    exit 0
    ;;
  -l | --local)
    LOCAL=true
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
  -r | --release)
    PACK_FOR_RELEASE=true
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

# Check if pip is available, otherwise use pip3
if ! command -v pip &>/dev/null; then
  if command -v pip3 &>/dev/null; then
    alias pip=pip3
  else
    echo "Error: pip or pip3 not found"
    exit 1
  fi
fi

PWD_DIR=$(pwd)
CURRENT_DIR=$(dirname $(realpath $0))
ROOT_DIR=$(dirname $(dirname $CURRENT_DIR))
BLENDER_DIR="$ROOT_DIR/editor-blender"

declare -A PLATFORM_NAMES=(
  ["manylinux2014_x86_64"]="linux"
  ["win_amd64"]="windows"
  ["macosx_10_9_x86_64"]="macos-x86_64"
  ["macosx_11_0_arm64"]="macos-arm64"
)

PLATFORMS=(
  "manylinux2014_x86_64"
  "win_amd64"
  "macosx_10_9_x86_64"
  "macosx_11_0_arm64"
)

WHEELS_CACHE_DIR="$BLENDER_DIR/.wheels-cache"
if [[ -z ${LOCAL+x} ]]; then
  CACHE_HIT=false
  if [ -f $WHEELS_CACHE_DIR/context.sha1 ] &&
    [ $(cat "$BLENDER_DIR/requirements.prod.txt" "$BLENDER_DIR/blender_manifest.toml" | sha1sum | head -c 40) = $(cat "$WHEELS_CACHE_DIR/context.sha1") ] &&
    [ $(find "$WHEELS_CACHE_DIR" -type f ! -name '*.sha1' -exec sha1sum {} + | sha1sum | head -c 40) = $(cat "$WHEELS_CACHE_DIR/integrity.sha1") ]; then
    CACHE_HIT=true
    echo Found dependency cache
  fi

  if ! $CACHE_HIT; then
    rm -rf "$WHEELS_CACHE_DIR"
    echo No dependency cache found, creating one
    for platform in "${PLATFORMS[@]}"; do
      folder_name=${PLATFORM_NAMES[$platform]}
      pip download -r "$BLENDER_DIR/requirements.prod.txt" --dest "$WHEELS_CACHE_DIR/$folder_name" --python-version 311 --only-binary=:all: --platform $platform -q && echo "Downloaded $folder_name wheels"
    done
    cat "$BLENDER_DIR/requirements.prod.txt" "$BLENDER_DIR/blender_manifest.toml" | sha1sum | head -c 40 >"$WHEELS_CACHE_DIR/context.sha1"
    find "$WHEELS_CACHE_DIR" -type f ! -name '*.sha1' -exec sha1sum {} + | sha1sum | head -c 40 >"$WHEELS_CACHE_DIR/integrity.sha1"
    echo Created dependency cache
  fi
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
  cp "$BLENDER_DIR/.env.production" "$PACK_BLENDER_PATH/.env"
else
  cp "$BLENDER_DIR/.env.development" "$PACK_BLENDER_PATH/.env"
fi

# Remove dev files
rm -rf "$PACK_BLENDER_PATH"/{.vscode,pack,tests,.venv,.wheels-cache,dist}

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
  WHEELS_TOML="wheels = [${WHEELS_TOML%, }]"

  # Update the manifest file
  grep -v '^wheels = \[' $MANIFEST_FILE > temp && mv temp $MANIFEST_FILE
  echo $WHEELS_TOML >> $MANIFEST_FILE

  # Zip the folder
  cd "$PACK_DIR"
  zip -rq "$FOLDER_NAME.zip" "$FOLDER_NAME"
}

OUTPUT_DIR=${OUTPUT_DIR:-$BLENDER_DIR/dist}
mkdir -p "$OUTPUT_DIR"

if [[ -z ${LOCAL+x} ]]; then
  for platform in "${!PLATFORM_NAMES[@]}"; do
    folder_name=${PLATFORM_NAMES[$platform]}
    rm -rf "$WHEELS_DIR" && cp -r "$WHEELS_CACHE_DIR/$folder_name" "$WHEELS_DIR"
    pack
    mv "$FOLDER_NAME.zip" "$OUTPUT_DIR/$FOLDER_NAME-$folder_name.zip"
    echo "Bundled $folder_name version at $OUTPUT_DIR/$FOLDER_NAME-$folder_name.zip."
  done
else
  pip download -r "$BLENDER_DIR/requirements.prod.txt" --dest "$WHEELS_DIR" --python-version 311 --only-binary=:all: -q
  pack
  mv "$FOLDER_NAME.zip" "$OUTPUT_DIR/$FOLDER_NAME-local.zip"
  echo "Bundled local version at $OUTPUT_DIR/$FOLDER_NAME-local.zip."
fi

# Remove temp folder
rm -rf "$PACK_DIR"

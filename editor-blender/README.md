# Blender Frontend

## Development

Recommended to use uv for environment management.

#### 1. Create virtual environment
```bash
# editor-blender/

# Create venv
uv venv
source .venv/bin/activate

# Install dependencies
uv sync
```

#### 2. Develop :D

#### 3. Bundle blender add-on
```bash
# editor-blender/

# Download wheels
# For Linux/MacOS
pip download -r requirements.prod.txt --dest wheels/ --python-version 311 --only-binary=:all: 
 # For Windows
pip download -r requirements.prod.txt --dest wheels/ --python-version 311 --only-binary=:all: --platform win_amd64

# Pack add-on
python pack/pack.py # For development
python pack/pack.py -r # For release

# Clean up
rm -rf wheels/
```
The bundled add-on will be in the `LightDance-Editor` folder as a zip file.

#### 4. Install add-on in Blender:

"Settings" -> "Add-ons" -> menu(upper-right corner) -> "Install from disk" -> select the zip file

#### 5. Restart Blender
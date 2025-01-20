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

bash scripts/bundle.sh # For development
bash scripts/bundle.sh -r # For release
```
The bundled add-on will be in the `LightDance-Editor` folder as a zip file.

#### 4. Install add-on in Blender:

"Settings" -> "Add-ons" -> menu(upper-right corner) -> "Install from disk" -> select the zip file

#### 5. Restart Blender

#### Type checking over all files

```bash
# editor-blender/
uv run pyright
```
Make sure no errors are present before committing.

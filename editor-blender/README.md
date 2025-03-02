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
(See more with `bash scripts/bundle.sh -h`)

The bundled add-on will be in the `dist` folder as zip files.

#### 4. Install add-on in Blender:

##### Method 1:
In Blender:
"Settings" -> "Add-ons" -> menu(upper-right corner) -> "Install from disk" -> select the zip file

Then restart Blender.

##### Method 2: (Much quicker)
Make sure the Blender executable is in the PATH, then run the following command:
```bash
blender --command extension install-file -r user_default ${path_to_zip}
```
NOTE: For WSL users, set a `blender` alias for  `blender.exe` from WSL


#### Type checking over all files

```bash
# editor-blender/
uv run pyright
```
Make sure no errors are present before committing.

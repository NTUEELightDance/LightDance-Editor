## Assets

Assets used in editor are defined in [files/data/load.json](files/data/load.json).

Once configured, you can generate empty data for database and upload.

```sh
# LightDance-Editor/utils
node generateInitialExport.js ../files/data/load.json ../files > jsons/exportDataEmpty.json
```

Everytime you modified assets, remember to update [files/data/load_hash.json](files/data/load_hash.json) for auto-update in blender.

```sh
# LightDance-Editor/utils
node updateFileHash.js ../files > ../files/data/load_hash.json
```

### Model

Models should be exported from Blender in GLB format without animation data and materials, and placed in [files/asset/models/](files/asset/models/).

### Music and Waveform

We use [audiowaveform](https://github.com/bbc/audiowaveform/tree/master?fbclid=IwAR19jDCDp5DCzdLK7Z8EgE7W5NSjm8B-wdFABsrT62D2b80bVtCuydkMgnM) to generate waveform. Refer to [Installation](https://github.com/bbc/audiowaveform/blob/master/README.md#installation) section to install the package first.

You need to update waveform [files/data/waveform.json](files/data/waveform.json) when the music is modified.

```sh
# LightDance-Editor/utils
pnpm waveform
```

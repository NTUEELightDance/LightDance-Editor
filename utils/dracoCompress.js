const NodeIO = require("@gltf-transform/core").NodeIO;
const DracoMeshCompression =
  require("@gltf-transform/extensions").DracoMeshCompression;
const draco3d = require("draco3dgltf");

// add type annotations to the function
/**
 * @param {string} input
 * @param {string} output
 * @returns {Promise<void>}
 * @async
 * @function
 * @name compress
 */
async function compress(input, output) {
  const io = new NodeIO()
    .registerExtensions([DracoMeshCompression])
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
      "draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
    });

  // Read and decode.
  const document = await io.read(input);

  // Write and encode.
  document
    .createExtension(DracoMeshCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: DracoMeshCompression.EncoderMethod.EDGEBREAKER,
      encodeSpeed: 5,
      decodeSpeed: 5,
    });
  await io.write(output, document);
}

const inputs = process.argv.slice(2);

// filter out files that ends with .glb but not .draco.glb
const dracoFiles = inputs.filter(
  (file) => file.endsWith(".glb") && !file.endsWith(".draco.glb")
);

// compress all the files with output file name ending with .draco.glb
dracoFiles.forEach((file) => {
  const output = file.replace(".glb", ".draco.glb");
  compress(file, output);
});

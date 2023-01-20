import Clipboard from "components/Clipboard";
import Header from "components/Header";
import Layout from "containers/Layout";

export default function Editor () {
  return (
    <>
      <Clipboard />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh"
        }}
      >
        <Header />
        <div style={{ flexGrow: 1, position: "relative" }}>
          <Layout mode="editor" />
        </div>
      </div>
    </>
  );
}

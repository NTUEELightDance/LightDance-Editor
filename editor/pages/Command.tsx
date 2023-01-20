import Header from "components/Header";
import Layout from "containers/Layout";

export default function Command () {
  return (
    <>
      <Header />
      <div style={{ flexGrow: 1, position: "relative" }}>
        <Layout mode="command" />
      </div>
    </>
  );
}

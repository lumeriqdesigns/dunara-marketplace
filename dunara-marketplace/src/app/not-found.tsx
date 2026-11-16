import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ paddingBlock: "100px", textAlign: "center" }}>
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1 style={{ fontSize: "clamp(36px, 6vw, 58px)" }}>This connection missed its mark.</h1>
      <p style={{ color: "#657269" }}>The page you are looking for may have moved.</p>
      <Link className="button button-primary" href="/">Back to Dúnarà</Link>
    </main>
  );
}

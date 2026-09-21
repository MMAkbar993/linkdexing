
// Heading block shared by the inner public pages.
export default function PageIntro({ eyebrow, title, lede, children }) {
  return (
    <section className="page-intro">
      <div className="wrap">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display display-lg">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
    </section>
  );
}

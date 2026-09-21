import PageIntro from "../../components/site/PageIntro";

// Renders one of the documents in content/legal.js. That HTML is static text
// from our own former WordPress site, limited to basic formatting tags when it
// was carried over, so injecting it directly is safe.
export default function LegalPage({ doc }) {
  return (
    <>
      <PageIntro eyebrow="Legal" title={doc.title} />
      <section className="section-tight">
        <div className="wrap">
          <div className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
      </section>
    </>
  );
}

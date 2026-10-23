import legal from "../../../../content/legal.json";
import { Header, Footer } from "./site";

export function LegalPage({ document }: { document: keyof typeof legal.pages }) {
  const page = legal.pages[document];
  return (
    <>
      <Header route={document} />
      <main className="legal-page wrap">
        <article aria-labelledby="legal-title">
          <p className="legal-kicker">{legal.placeholderLabel}</p>
          <h1 id="legal-title">{page.title}</h1>
          <p className="legal-intro">{page.intro}</p>
          {page.sections.map((section, index) => (
            <section key={index} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}

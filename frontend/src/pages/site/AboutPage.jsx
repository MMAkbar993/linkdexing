import React from "react";
import PageIntro from "../../components/site/PageIntro";
import { company } from "../../content/site";

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="A link indexing service built on manual work, not scripts."
        lede="Linkdexing was founded with one aim: to build the best link indexer available. It has been doing that for SEO professionals, agencies and link builders since 2022."
      />

      <section className="section-tight">
        <div className="wrap split">
          <div className="prose">
            <p>
              Linkdexing provides backlink indexing as a service. Our method is
              new and unusual, and it indexes backlinks with a success rate of
              up to 90%. It relies on people rather than automation, which is
              slower but far more reliable than the tricks most indexers still
              depend on.
            </p>
            <p>
              We have helped thousands of clients, from independent marketers
              to large companies, improve their online visibility, brand
              awareness and web presence. With over a decade of experience
              behind the team, we continue to offer an unmatched service at an
              unbeatable price.
            </p>
            <p>
              Our parent company, {company.parent}, is trusted worldwide.
              Headquartered in New Delhi, India, we have full-time employees
              and an outsourced team in many locations. We strictly follow the
              business practices set by our company and protect our clients'
              privacy at all times.
            </p>
          </div>

          <aside className="aside">
            <dl>
              <dt>Company</dt>
              <dd>
                {company.name}, a service of {company.parent}
              </dd>
              <dt>Headquarters</dt>
              <dd>
                {company.addressLines.map((line) => (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </dd>
              <dt>GSTIN</dt>
              <dd>{company.gstin}</dd>
              <dt>Support</dt>
              <dd>
                <a href={`mailto:${company.supportEmail}`}>
                  {company.supportEmail}
                </a>
              </dd>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}

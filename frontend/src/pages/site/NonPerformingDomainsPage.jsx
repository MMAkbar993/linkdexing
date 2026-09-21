import moment from "moment";
import PageIntro from "../../components/site/PageIntro";
import { company, nonPerformingDomains } from "../../content/site";

export default function NonPerformingDomainsPage() {
  const { domains, updatedOn } = nonPerformingDomains;

  return (
    <>
      <PageIntro
        eyebrow="Before you submit"
        title="Domains that don't index well with our method."
        lede="We have tested these domains across many clients, batches and niches, and they consistently perform poorly. We don't recommend submitting links from them, so your credits aren't wasted. The list is kept up to date."
      />

      <section className="section-tight">
        <div className="wrap split">
          <ul className="domain-list" aria-label="Non-performing domains">
            {domains.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <aside className="aside">
            <dl>
              <dt>Last updated</dt>
              <dd>{moment(updatedOn).format("D MMMM YYYY")}</dd>
              <dt>Found one we've missed?</dt>
              <dd>
                Tell us at{" "}
                <a href={`mailto:${company.supportEmail}`}>
                  {company.supportEmail}
                </a>{" "}
                and we'll test it.
              </dd>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}

import React from "react";
import PageIntro from "../../components/site/PageIntro";
import { Icon } from "../../components/Icon";
import { company } from "../../content/site";

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We'd love to hear from you."
        lede={`Getting in touch is as easy as sending an email. ${company.supportHours}`}
      />

      <section className="section-tight">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-card">
              <div className="ico">
                <Icon name="mail" size={24} />
              </div>
              <h3>Email</h3>
              <a href={`mailto:${company.supportEmail}`}>
                {company.supportEmail}
              </a>
            </div>
            <div className="contact-card">
              <div className="ico">
                <Icon name="pin" size={24} />
              </div>
              <h3>Address</h3>
              <p>
                {company.addressLines.map((line) => (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
          <p className="muted fine" style={{ marginTop: 24, maxWidth: "60ch" }}>
            For the quickest answer, include the email address on your
            Linkdexing account and, if your question is about an order, the
            date you submitted it.
          </p>
        </div>
      </section>
    </>
  );
}

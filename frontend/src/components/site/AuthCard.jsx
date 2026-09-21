// Shared frame for the account pages: a narrow centred card with a heading,
// the form, and an optional footer line (e.g. "Already have an account?").
export default function AuthCard({ eyebrow, title, lede, children, foot }) {
  return (
    <section className="auth">
      <div className="wrap">
        <div className="auth-card">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="display display-md">{title}</h1>
          {lede && <p className="lede">{lede}</p>}
          {children}
          {foot && <p className="auth-foot">{foot}</p>}
        </div>
      </div>
    </section>
  );
}

// Submit button with the loading state every auth form uses.
export function AuthSubmit({ loading, busy = "Please wait…", children }) {
  return (
    <button
      type="submit"
      className="btn-solid btn-lg btn-block"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border" role="status" aria-hidden="true" />
          {busy}
        </>
      ) : (
        children
      )}
    </button>
  );
}

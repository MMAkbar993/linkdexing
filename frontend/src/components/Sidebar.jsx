import { Children, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { privateApi } from "../api";
import { authUrl } from "../api/endpoints";

const links = [
  { link: "/dashboard", label: "Link Indexer" },
  { link: "/links-archive", label: "Links Archive" },
  { link: "/index-checker", label: "Index Checker" },
  { link: "/developer-api", label: "Developer API" },
  { link: "/change-password", label: "Change Password" },
  { link: "/buy-credits", label: "Buy Credits" },
];

const num = (n) => (n ?? 0).toLocaleString("en-US");

const Sidebar = () => {
  const [stats, setStats] = useState(null); // { balance, creditsPurchased, totalLinks }

  useEffect(() => {
    let cancelled = false;
    privateApi
      .get(`${authUrl}/credits`)
      .then((res) => {
        if (cancelled) return;
        setStats({
          balance: res.data.balance,
          creditsPurchased: res.data.creditsPurchased,
          totalLinks: res.data.totalLinks,
        });
      })
      .catch(() => {
        // Non-fatal - the sidebar still works without these numbers shown.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='d-flex col-sm-12 col-md-3 mt-4 justify-content-end'>
      <div>
        <h1 className='display-6 lead'>Your Account</h1>

        {stats && (
          <div
            className='mb-3 p-3'
            style={{
              background: "#f7f8f6",
              border: "1px solid #e5e8eb",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#6b7681" }}>
              Credit balance
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>
              {num(stats.balance)}
            </div>
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid #e5e8eb",
                fontSize: "0.8rem",
                color: "#6b7681",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{num(stats.creditsPurchased)} purchased</span>
              <span>{num(stats.totalLinks)} used</span>
            </div>
          </div>
        )}

        <ul style={{ fontSize: "1.3rem" }}>
          {Children.toArray(
            links.map(({ link, label }) => {
              return (
                <li>
                  <Link to={link}>{label}</Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

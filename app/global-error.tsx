"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#f7f2ea",
          color: "#2e2520",
          fontFamily: "Georgia, serif",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontWeight: 400, fontSize: "2.5rem" }}>Rangriti Studio is unavailable</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#5c4d42" }}>
            An unexpected error occurred. Check the server logs for configuration issues.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "10px 22px",
              borderRadius: 999,
              border: 0,
              background: "#863a37",
              color: "#fbf2ef",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

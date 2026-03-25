"use client";

import { useState, useEffect } from "react";

const DEFAULT_CONFIG = {
  year: "2025",
  trim: "TRD Off-Road",
  cab: "CrewMax",
  drivetrain: "4x4",
  engine: "Standard V6 (not hybrid)",
  bed: "6.5 ft",
  zip: "85001",
  radius: "100",
};

const LABEL = {
  dealerName: "Dealer",
  dealerCity: "City",
  dealerPhone: "Phone",
  stockNumber: "Stock #",
  exteriorColor: "Color",
  msrp: "MSRP",
  vin: "VIN",
  status: "Status",
  notes: "Notes",
};

function fmt(key, val) {
  if (val === null || val === undefined || val === "") return "—";
  if (key === "msrp") return "$" + Number(val).toLocaleString();
  return String(val);
}

export default function TruckFinder() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTs, setSearchTs] = useState(null);
  const [lastSearchTime, setLastSearchTime] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Update countdown timer every second
  // Use 75 seconds to account for API call duration (~15-20s) plus safe buffer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSearchTime) {
        const elapsed = Date.now() - lastSearchTime;
        const remaining = Math.max(0, Math.ceil((75000 - elapsed) / 1000));
        setCountdown(remaining);
      } else {
        setCountdown(0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [lastSearchTime]);

  const search = async () => {
    // Track search attempt time
    const searchTime = Date.now();
    setLastSearchTime(searchTime);
    setLoading(true);
    setError(null);
    setResults([]);
    setSummary("");
    setHasSearched(true);
    setSearchTs(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          setResults(parsed);
          setSearchTs(new Date().toLocaleTimeString());
        } catch {
          setSummary(text);
        }
      } else {
        setSummary(text);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text") => (
    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#7a8a6a", textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        type={type}
        value={cfg[key]}
        onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })}
        style={{
          background: "#1a1f14",
          border: "1px solid #2e3828",
          borderRadius: 4,
          color: "#d4e0c4",
          fontSize: 13,
          fontFamily: "'DM Mono', monospace",
          padding: "7px 10px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  const statusColor = (s) => {
    if (!s) return "#7a8a6a";
    if (s.toLowerCase().includes("stock")) return "#5dba7a";
    if (s.toLowerCase().includes("transit")) return "#e8a84a";
    return "#7a8a6a";
  };

  return (
    <div style={{ background: "#0f1209", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#d4e0c4", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: "#161c0f", borderBottom: "1px solid #2e3828", padding: "20px 24px 18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#7a8a6a", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
            TOYOTA INVENTORY
          </div>
          <div style={{ width: 1, height: 14, background: "#2e3828" }} />
          <div style={{ fontSize: 11, color: "#4a5840", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            PHOENIX AZ · LIVE SEARCH
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: "#e8f0d8", letterSpacing: "-0.02em" }}>
          Tundra Finder
        </div>
      </div>

      <div style={{ padding: "24px 24px 0" }}>
        {/* Filter grid */}
        <div style={{ background: "#161c0f", border: "1px solid #2e3828", borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#7a8a6a", textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>
            Search Filters
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
            {field("year", "Year")}
            {field("trim", "Trim")}
            {field("cab", "Cab")}
            {field("drivetrain", "Drivetrain")}
            {field("engine", "Engine")}
            {field("bed", "Bed Size")}
            {field("zip", "Zip Code")}
            {field("radius", "Radius (mi)")}
          </div>
          <button
            onClick={search}
            disabled={loading || countdown > 0}
            style={{
              background: (loading || countdown > 0) ? "#2e3828" : "#4a7a2e",
              border: "none",
              borderRadius: 5,
              color: (loading || countdown > 0) ? "#5a6850" : "#d4f0b4",
              cursor: (loading || countdown > 0) ? "default" : "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              padding: "10px 24px",
              textTransform: "uppercase",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>⟳</span>
                Searching dealers...
              </>
            ) : countdown > 0 ? (
              <>⏱ Wait {countdown}s</>
            ) : (
              <>{hasSearched ? "⟳ Refresh Search" : "→ Search Inventory"}</>
            )}
          </button>
          {countdown > 0 && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#1a1508", border: "1px solid #3d3420", borderRadius: 5, fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#b89a5a" }}>
              ⏱ Rate limit: Wait {countdown} second{countdown !== 1 ? 's' : ''} before next search
            </div>
          )}
        </div>

        {/* Status bar */}
        {hasSearched && !loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "8px 12px", background: "#161c0f", border: "1px solid #2e3828", borderRadius: 5, fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7a8a6a" }}>
            <span style={{ color: results.length > 0 ? "#5dba7a" : "#e8a84a" }}>
              {results.length > 0 ? "●" : "○"}
            </span>
            {results.length > 0
              ? `${results.length} vehicle${results.length !== 1 ? "s" : ""} found`
              : "No structured results returned"}
            {searchTs && <span style={{ marginLeft: "auto" }}>Last updated {searchTs}</span>}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#1f0f0f", border: "1px solid #4a1e1e", borderRadius: 6, padding: "12px 16px", color: "#e87a7a", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Summary fallback */}
        {summary && !loading && (
          <div style={{ background: "#161c0f", border: "1px solid #2e3828", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#7a8a6a", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
              Search Summary
            </div>
            <p style={{ fontSize: 13, color: "#9aaa8a", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#161c0f",
                  border: "1px solid #2e3828",
                  borderRadius: 8,
                  padding: "16px 20px",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4a5840")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2e3828")}
              >
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#e8f0d8" }}>{r.dealerName || "Unknown Dealer"}</div>
                    <div style={{ fontSize: 12, color: "#7a8a6a", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                      {[r.dealerCity, r.dealerPhone].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    {r.msrp && (
                      <div style={{ fontSize: 17, fontWeight: 600, color: "#5dba7a", fontFamily: "'DM Mono', monospace" }}>
                        ${Number(r.msrp).toLocaleString()}
                      </div>
                    )}
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: statusColor(r.status),
                      background: r.status?.toLowerCase().includes("stock") ? "#0d1f0d" : "#1f1400",
                      padding: "3px 8px",
                      borderRadius: 3,
                      fontFamily: "'DM Mono', monospace",
                      border: `1px solid ${statusColor(r.status)}30`,
                    }}>
                      {r.status || "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Detail grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px 16px", marginBottom: r.notes ? 12 : 0 }}>
                  {["stockNumber", "exteriorColor", "vin"].map((k) =>
                    r[k] ? (
                      <div key={k}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#4a5840", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Mono', monospace" }}>
                          {LABEL[k]}
                        </div>
                        <div style={{ fontSize: 12, color: "#9aaa8a", fontFamily: k === "vin" || k === "stockNumber" ? "'DM Mono', monospace" : "inherit" }}>
                          {fmt(k, r[k])}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Notes */}
                {r.notes && (
                  <div style={{ borderTop: "1px solid #1e2818", marginTop: 12, paddingTop: 10, fontSize: 12, color: "#7a8a6a", lineHeight: 1.6 }}>
                    {r.notes}
                  </div>
                )}

                {/* Link */}
                {r.dealerUrl && (
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={r.dealerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#5a8a3a", fontFamily: "'DM Mono', monospace", textDecoration: "none", letterSpacing: "0.06em" }}
                    >
                      VIEW AT DEALER →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "#4a5840" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⬡</div>
            <div style={{ fontSize: 13, letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
              Configure filters and run search
            </div>
            <div style={{ fontSize: 11, color: "#3a4830", marginTop: 6 }}>
              Pre-loaded for 2025 Tundra TRD Off-Road CrewMax · Phoenix AZ
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

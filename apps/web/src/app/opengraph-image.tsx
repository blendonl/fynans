import { ImageResponse } from "next/og";
import { siteName, siteTagline } from "@/lib/site";

export const alt = `${siteName} — ${siteTagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const lineItems = [
  { name: "Buke Bardhe", total: "€1.58" },
  { name: "Qumesht 1 l", total: "€3.15" },
  { name: "Pemeperime", total: "€0.90" },
  { name: "Detergjent Enesh", total: "€3.49" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#F8F8F6",
          backgroundImage:
            "radial-gradient(circle at 12% 6%, rgba(184,134,11,0.22), transparent 55%), radial-gradient(circle at 92% 10%, rgba(91,138,138,0.20), transparent 45%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingRight: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: "#B8860B",
                color: "#1A1C20",
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              €
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#1A1C20" }}>{siteName}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#806007",
              }}
            >
              Receipt-first
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#1A1C20",
              }}
            >
              Scan the receipt. Let the household agree on it.
            </div>
          </div>

          <div style={{ fontSize: 28, color: "#5F646E", lineHeight: 1.4 }}>
            Itemised expenses, approved by your family before they count.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 400,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            border: "1px solid #DDDFE3",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 22, color: "#5F646E" }}>Receipt processed</div>
          <div style={{ marginTop: 6, fontSize: 40, fontWeight: 700, color: "#1A1C20" }}>
            Market Extra
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, gap: 14 }}>
            {lineItems.map((line) => (
              <div
                key={line.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 24,
                  color: "#1A1C20",
                }}
              >
                <div>{line.name}</div>
                <div style={{ fontWeight: 700 }}>{line.total}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid #ECEEF0",
              fontSize: 28,
              fontWeight: 700,
              color: "#1A1C20",
            }}
          >
            <div>Total</div>
            <div>€9.17</div>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 999,
              backgroundColor: "#1A1C20",
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Waiting for approval
          </div>
        </div>
      </div>
    ),
    size,
  );
}

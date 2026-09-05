"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Receipt } from "@/lib/types";
import { formatMoney } from "@/lib/utils/format";
import { PageHeader } from "./PageHeader";

function totalsBy(receipts: Receipt[], key: (receipt: Receipt) => string) {
  return Object.entries(
    receipts.reduce<Record<string, number>>((all, receipt) => {
      const label = key(receipt);
      all[label] = (all[label] ?? 0) + Number(receipt.amount);
      return all;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
}

function safeSpreadsheetText(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string) {
  const safe = safeSpreadsheetText(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadReportCsv(receipts: Receipt[], filename: string) {
  const rows = [...receipts]
    .sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime(),
    )
    .map((receipt) => {
      const card = receipt.cardName
        ? `${receipt.cardName} •${receipt.cardLastFour}`
        : "";
      return [
        receipt.transactionDate.slice(0, 10),
        receipt.merchant,
        Number(receipt.amount).toFixed(2),
        card,
        receipt.category,
      ]
        .map(csvCell)
        .join(",");
    });

  const csv = `\uFEFFDate,Merchant,Amount,Card,Category\r\n${rows.join("\r\n")}`;
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = rows[0]?.[1] || 1;
  return (
    <article className="breakdown-card">
      <h3>{title}</h3>
      {rows.length ? (
        <div className="breakdown-list">
          {rows.map(([name, value]) => (
            <div key={name}>
              <p>
                <span>{name}</span>
                <strong>{formatMoney(value)}</strong>
              </p>
              <div className="mini-bar">
                <span style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No spending in this period.</p>
      )}
    </article>
  );
}

export function Reports() {
  const now = new Date();
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [folderStatus, setFolderStatus] = useState("");
  const [folderError, setFolderError] = useState("");

  useEffect(() => {
    fetch("/api/receipts")
      .then((response) => response.json())
      .then(setReceipts);
  }, []);

  const years = [
    ...new Set([
      now.getFullYear(),
      ...receipts.map((receipt) =>
        new Date(receipt.transactionDate).getFullYear(),
      ),
    ]),
  ].sort((a, b) => b - a);
  const period = receipts.filter((receipt) => {
    const date = new Date(receipt.transactionDate);
    return (
      date.getFullYear() === year &&
      (view === "yearly" || date.getMonth() === month)
    );
  });
  const total = period.reduce(
    (sum, receipt) => sum + Number(receipt.amount),
    0,
  );
  const byCategory = totalsBy(period, (receipt) => receipt.category);
  const byCard = totalsBy(period, (receipt) =>
    receipt.cardName
      ? `${receipt.cardName} •${receipt.cardLastFour}`
      : "No card",
  );
  const byMerchant = totalsBy(period, (receipt) => receipt.merchant);
  const monthly = Array.from({ length: 12 }, (_, index) => ({
    name: new Date(2024, index).toLocaleString("en-US", { month: "short" }),
    total: receipts
      .filter((receipt) => {
        const date = new Date(receipt.transactionDate);
        return date.getFullYear() === year && date.getMonth() === index;
      })
      .reduce((sum, receipt) => sum + Number(receipt.amount), 0),
  }));
  const highest = monthly.reduce(
    (best, item) => (item.total > best.total ? item : best),
    monthly[0],
  );
  const reportName =
    view === "monthly"
      ? `receipt-report-${year}-${String(month + 1).padStart(2, "0")}`
      : `receipt-report-${year}`;

  async function downloadFolder() {
    if (!period.length || folderStatus) return;
    setFolderError("");
    setFolderStatus("Preparing receipts…");
    try {
      const { downloadReceiptFolder } = await import(
        "@/lib/reports/export-folder"
      );
      await downloadReceiptFolder(period, reportName, setFolderStatus);
    } catch (error) {
      setFolderError(
        error instanceof Error
          ? error.message
          : "The receipt folder could not be created.",
      );
    } finally {
      setFolderStatus("");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Spending overview"
        title="Reports"
        description="A clear look at where your money went."
      />
      <div className="report-toolbar">
        <div className="segment">
          <button
            onClick={() => setView("monthly")}
            className={view === "monthly" ? "active" : ""}
          >
            Monthly
          </button>
          <button
            onClick={() => setView("yearly")}
            className={view === "yearly" ? "active" : ""}
          >
            Yearly
          </button>
        </div>
        <div className="report-actions">
          <div className="period-selectors">
            {view === "monthly" && (
              <select
                aria-label="Month"
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index} value={index}>
                    {new Date(2024, index).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {years.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <button
            className="button secondary export-button"
            onClick={() => downloadReportCsv(period, `${reportName}.csv`)}
          >
            ↓ Export CSV
          </button>
          <button
            className="button primary export-button"
            onClick={downloadFolder}
            disabled={!period.length || !!folderStatus}
          >
            {folderStatus || "↓ Download Receipt Folder"}
          </button>
        </div>
      </div>
      {folderError && <div className="notice error">{folderError}</div>}
      <section className="report-hero">
        <p>
          {view === "monthly"
            ? new Date(year, month).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })
            : year}
        </p>
        <strong>{formatMoney(total)}</strong>
        <span>
          {period.length} {period.length === 1 ? "transaction" : "transactions"}
        </span>
      </section>
      {view === "yearly" && (
        <>
          <div className="report-stats">
            <div>
              <span>Monthly average</span>
              <strong>{formatMoney(total / 12)}</strong>
            </div>
            <div>
              <span>Highest month</span>
              <strong>
                {highest.total
                  ? `${highest.name} · ${formatMoney(highest.total)}`
                  : "—"}
              </strong>
            </div>
          </div>
          <section className="chart-card">
            <h2>Spending by month</h2>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly}
                  margin={{ top: 16, right: 8, left: -15, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#e6e8e4" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    cursor={{ fill: "#f4f6f2" }}
                  />
                  <Bar dataKey="total" fill="#27745b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
      <div className="breakdown-grid">
        <Breakdown title="By category" rows={byCategory} />
        <Breakdown title="By card" rows={byCard} />
        <Breakdown title="Top merchants" rows={byMerchant.slice(0, 6)} />
      </div>
    </div>
  );
}

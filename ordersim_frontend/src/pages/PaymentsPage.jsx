import React, { useState, useEffect } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function PaymentsPage() {
  const { apiFetch } = useApi();
  const [orders, setOrders] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({
    order_id: "",
    amount: "",
    payment_method: "credit_card",
  });
  const [payment, setPayment] = useState(null);
  const [paymentId, setPaymentId] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    apiFetch("/orders").then((r) => r.json()).then(setOrders);
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/payments", {
      method: "POST",
      body: JSON.stringify({
        ...paymentInfo,
        order_id: Number(paymentInfo.order_id),
        amount: Number(paymentInfo.amount),
      }),
    });
    setPayment(await res.json());
    setPaymentResult(null);
  };

  const lookupPayment = async (e) => {
    e.preventDefault();
    const res = await apiFetch(`/payments/${paymentId}`);
    setPaymentResult(await res.json());
  };

  return (
    <section>
      <h2>Payments</h2>
      <form className="inline-form" onSubmit={handlePay}>
        <select
          required
          value={paymentInfo.order_id}
          onChange={(e) => setPaymentInfo((inf) => ({ ...inf, order_id: e.target.value }))}
        >
          <option value="">Order…</option>
          {orders.map((o) =>
            <option key={o.id} value={o.id}>
              #{o.id} - User {o.user_id} (${o.total})
            </option>
          )}
        </select>
        <input
          required
          type="number"
          step="0.01"
          placeholder="Amount"
          value={paymentInfo.amount}
          onChange={(e) => setPaymentInfo((inf) => ({ ...inf, amount: e.target.value }))}
        />
        <select
          value={paymentInfo.payment_method}
          onChange={(e) => setPaymentInfo((inf) => ({ ...inf, payment_method: e.target.value }))}
        >
          <option value="credit_card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select>
        <button type="submit">Send Payment</button>
      </form>

      {payment && (
        <div className="card" style={{ marginTop: 20 }}>
          <div>Payment ID: <b>{payment.id}</b></div>
          <div>Order: #{payment.order_id}</div>
          <div>Result: <b>{payment.status}</b></div>
          <div>Paid ${payment.amount} via {payment.payment_method}</div>
        </div>
      )}

      <hr />
      <h3>Payment Lookup</h3>
      <form className="inline-form" onSubmit={lookupPayment}>
        <input
          required
          placeholder="Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />
        <button type="submit">Fetch</button>
      </form>
      {paymentResult && (
        <div className="card">
          <div>Payment ID: {paymentResult.id}</div>
          <div>Order: #{paymentResult.order_id}</div>
          <div>Status: {paymentResult.status}</div>
          <div>Amount: ${paymentResult.amount}</div>
        </div>
      )}
    </section>
  );
}

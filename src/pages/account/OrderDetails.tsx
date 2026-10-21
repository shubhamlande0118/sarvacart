import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Circle, MapPin, Package, RefreshCw } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { cn } from "../../utils/cn";

const trackingSteps: OrderStatus[] = [
  "Pending Confirmation",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

const aliases: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Pending Confirmation",
  "Picked Up": "Shipped",
  "In Transit": "Shipped",
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { orders, user, refreshOrderTracking } = useStore();
  const order = orders.find((item) => item.id === id && item.userId === user?.id);

  if (!order) {
    return (
      <Page className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-40 text-center">
        <Package className="h-14 w-14 text-zinc-500" />
        <h1 className="mt-6 font-serif text-3xl text-white">Order not found</h1>
        <p className="mt-2 text-zinc-400">This order is unavailable or does not belong to your account.</p>
        <Button to="/orders" className="mt-6">Back to orders</Button>
      </Page>
    );
  }

  const currentStatus = aliases[order.status] ?? order.status;
  const currentIndex = order.status === "Cancelled"
    ? -1
    : trackingSteps.indexOf(currentStatus);

  return (
    <Page className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <Link to="/orders" className="text-sm text-gold-soft hover:underline">Back to orders</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Order</p>
          <h1 className="mt-1 font-serif text-4xl font-bold text-white">{order.id}</h1>
          <p className="mt-2 text-sm text-zinc-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-300">{order.status}</span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-white">Order tracking</h2>
            {order.shipment?.awb && (
              <button
                type="button"
                onClick={() => void refreshOrderTracking(order.id)}
                className="inline-flex items-center gap-2 text-sm text-gold-soft hover:underline"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            )}
          </div>

          {order.status === "Cancelled" ? (
            <p className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">This order has been cancelled.</p>
          ) : (
            <ol className="mt-8 space-y-6">
              {trackingSteps.map((step, index) => {
                const complete = index < currentIndex;
                const current = index === currentIndex;
                return (
                  <li key={step} className="flex gap-4">
                    <div className="relative flex w-6 justify-center">
                      {complete || current ? (
                        <CheckCircle2 className={cn("relative z-10 h-6 w-6", current ? "text-gold-soft" : "text-emerald-400")} />
                      ) : <Circle className="relative z-10 h-6 w-6 text-zinc-600" />}
                      {index < trackingSteps.length - 1 && <span className={cn("absolute top-6 h-8 w-px", complete ? "bg-emerald-400" : "bg-zinc-700")} />}
                    </div>
                    <div>
                      <p className={cn("font-medium", complete || current ? "text-white" : "text-zinc-500")}>{step}</p>
                      <p className="mt-1 text-xs text-zinc-500">{current ? "Current status" : complete ? "Completed" : "Upcoming"}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {order.shipment ? (
            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-zinc-400">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-soft" /> {order.shipment.courier} · {order.shipment.awb}</p>
              <p className="mt-2">Latest carrier status: {order.shipment.status}</p>
              {order.shipment.timeline && order.shipment.timeline.length > 0 && (
                <div className="mt-4 space-y-2">
                  {order.shipment.timeline.map((event, index) => (
                    <div key={`${event.at}-${index}`} className="flex justify-between gap-4 text-xs">
                      <span>{event.status}</span>
                      <time dateTime={new Date(event.at).toISOString()}>{new Date(event.at).toLocaleString("en-IN")}</time>
                    </div>
                  ))}
                </div>
              )}
              <a className="mt-2 inline-block text-gold-soft hover:underline" href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">Open carrier tracking</a>
            </div>
          ) : (
            <p className="mt-8 border-t border-white/10 pt-5 text-sm text-zinc-500">Carrier tracking will appear after the shipment is dispatched.</p>
          )}
        </section>

        <aside className="glass h-fit rounded-2xl p-6">
          <h2 className="font-serif text-2xl font-bold text-white">Order summary</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <img src={item.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{item.name}</p>
                  <p className="text-xs text-zinc-500">Qty {item.qty} · {formatINR(item.price * item.qty)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-zinc-400">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- {formatINR(order.discount)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{order.delivery ? formatINR(order.delivery) : "Free"}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-semibold text-white"><span>Total</span><span className="text-gradient-gold">{formatINR(order.total)}</span></div>
          </div>
          <p className="mt-5 text-sm text-zinc-500">Payment: {order.payment}</p>
        </aside>
      </div>
    </Page>
  );
}

import { TruckIcon, ShieldIcon, WhatsAppIcon, BoxIcon } from "@/components/icons";

const ITEMS = [
  { icon: TruckIcon, label: "Envíos", detail: "a toda la República" },
  { icon: ShieldIcon, label: "Garantía", detail: "de 30 días" },
  { icon: WhatsAppIcon, label: "Pedidos", detail: "por WhatsApp" },
  { icon: BoxIcon, label: "Pago", detail: "contra entrega disponible" },
];

export function TrustStrip() {
  return (
    <div className="border-b border-line bg-paper-raised">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        {ITEMS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-ink-muted">
            <Icon className="h-5 w-5 shrink-0 text-accent" />
            <span>
              <b className="font-semibold text-ink">{label}</b> {detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

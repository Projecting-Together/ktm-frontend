"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";

const AMENITY_GROUPS = [
  {
    group: "Essential",
    items: [
      { id: "wifi", label: "WiFi / Internet", icon: "📶" },
      { id: "water_24h", label: "24hr Water Supply", icon: "💧" },
      { id: "electricity_backup", label: "Power Backup", icon: "⚡" },
      { id: "security_guard", label: "Security Guard", icon: "🛡️" },
    ],
  },
  {
    group: "Kitchen & Laundry",
    items: [
      { id: "kitchen", label: "Kitchen", icon: "🍳" },
      { id: "refrigerator", label: "Refrigerator", icon: "🧊" },
      { id: "washing_machine", label: "Washing Machine", icon: "🫧" },
      { id: "gas_stove", label: "Gas Stove", icon: "🔥" },
    ],
  },
  {
    group: "Comfort",
    items: [
      { id: "ac", label: "Air Conditioning", icon: "❄️" },
      { id: "heater", label: "Water Heater", icon: "🚿" },
      { id: "tv", label: "Cable TV", icon: "📺" },
      { id: "balcony", label: "Balcony / Terrace", icon: "🌿" },
    ],
  },
  {
    group: "Building",
    items: [
      { id: "elevator", label: "Elevator / Lift", icon: "🛗" },
      { id: "gym", label: "Gym / Fitness", icon: "🏋️" },
      { id: "parking_covered", label: "Covered Parking", icon: "🅿️" },
      { id: "cctv", label: "CCTV Security", icon: "📹" },
    ],
  },
];

export function Step5Amenities() {
  const { watch, setValue } = useFormContext<ListingFormData>();
  const selected = watch("amenity_ids") ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((a: string) => a !== id) : [...selected, id];
    setValue("amenity_ids", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">What amenities are included?</h2>
        <p className="text-muted-foreground mt-1">Select all that apply to your property.</p>
      </div>

      {AMENITY_GROUPS.map((group) => (
        <div key={group.group}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.group}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.items.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <button key={item.id} type="button" onClick={() => toggle(item.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                    isSelected ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-border hover:border-accent/50"
                  }`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="rounded-xl border border-verified/40 bg-verified/10 p-3 text-sm text-verified">
          ✓ {selected.length} amenit{selected.length === 1 ? "y" : "ies"} selected
        </div>
      )}
    </div>
  );
}

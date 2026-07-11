import { PASTEL_PALETTE } from "@/lib/palette";
import { cn, generateId } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Plus, X } from "lucide-react";

export interface NamedItem {
  id: string;
  label_bg: string;
  label_en: string;
  color: string;
}

interface NamedListEditorProps<T extends NamedItem> {
  items: T[];
  onChange: (items: T[]) => void;
  addLabel: string;
}

export function NamedListEditor<T extends NamedItem>({ items, onChange, addLabel }: NamedListEditorProps<T>) {
  const { t } = useI18n();

  function updateItem(index: number, patch: Partial<T>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const newItem = {
      id: generateId(),
      label_bg: "",
      label_en: "",
      color: PASTEL_PALETTE[items.length % PASTEL_PALETTE.length],
    } as T;
    onChange([...items, newItem]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id} className="p-3 bg-stone-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={item.label_bg}
              onChange={(e) => updateItem(i, { label_bg: e.target.value } as Partial<T>)}
              placeholder={t("settings.labelBg")}
              className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <input
              type="text"
              value={item.label_en}
              onChange={(e) => updateItem(i, { label_en: e.target.value } as Partial<T>)}
              placeholder={t("settings.labelEn")}
              className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button
              onClick={() => removeItem(i)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PASTEL_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => updateItem(i, { color: c } as Partial<T>)}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  item.color === c ? "border-stone-500 scale-110" : "border-transparent"
                )}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-stone-300 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  );
}

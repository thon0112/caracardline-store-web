import { zhHant } from "../locale/zh-Hant.js";
import { WHATSAPP_CHAT_URL } from "../components/WhatsAppFloat.js";

type CardRepairGalleryItem = {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  note?: string | null;
};

/** Edit this list to add before/after showcase cases. Image URLs can be CDN or `/public` paths. */
const CARD_REPAIR_GALLERY: CardRepairGalleryItem[] = [
  {
    id: "case-001",
    title: "示例：壓痕 （正面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780415180990-bdc1ca5d74a6e7bc-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780415181644-932a35b3a7f51a89-after.webp",
  },
  {
    id: "case-002",
    title: "示例：摺痕 （正面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780415995380-0c0f514c776423d5-Untitled-design--4-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780415995945-03c5b577ef97b3ae-Untitled-design--5-.webp",
    note: "日版大月伊",
  },
  {
    id: "case-003",
    title: "示例：邊角摺痕 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780414240992-9c3fcf5f6fc2a13f-2-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780414725765-c06e0359d7e4eed3-2-after.webp",
  },
  {
    id: "case-004",
    title: "示例：狗咬邊 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780416499917-ae73cbb49c00536a-Untitled-design--7-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780416500582-8405a75eee75c66b-Untitled-design--6-.webp",
  },
  {
    id: "case-005",
    title: "示例：嚴重損傷（背面）",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780414186023-a377ff8573fea381-9-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780414184940-72050a4421b301f0-9-after.webp",
    note: "出現嚴重裂紋或損傷，有脫色",
  },

  {
    id: "case-006",
    title: "示例：白邊/白點 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780416971285-3db6a10887302aac-Untitled-design--4-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780416971798-886acf34b0f7768c-Untitled-design--5-.webp",
    note: "補色屬於加工類，如白點範圍太大或者太深不建議補色",
  },
];

function TwoUp({ item }: { item: CardRepairGalleryItem }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_10px_26px_rgba(28,24,21,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-[1.05rem] font-bold leading-snug text-[var(--fg)]">
            {item.title}
          </h2>
          {item.note ? (
            <p className="m-0 mt-1 text-[0.9375rem] leading-[1.55] text-[var(--muted)]">
              {item.note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <div className="absolute left-3 top-3 z-[2] rounded-full bg-[rgba(28,24,21,0.72)] px-3 py-1 text-[0.8rem] font-bold tracking-[0.02em] text-white">
            {zhHant.cardRepairBefore}
          </div>
          <img
            src={item.beforeUrl}
            alt={`${item.title} before`}
            className="block aspect-[3/4] w-full rounded-xl object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <div className="absolute left-3 top-3 z-[2] rounded-full bg-[rgba(28,24,21,0.72)] px-3 py-1 text-[0.8rem] font-bold tracking-[0.02em] text-white">
            {zhHant.cardRepairAfter}
          </div>
          <img
            src={item.afterUrl}
            alt={`${item.title} after`}
            className="block aspect-[3/4] w-full rounded-xl object-cover "
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </article>
  );
}

export function CardRepairServicePage() {
  return (
    <div>
      <header className="mb-5">
        <h1 className="m-0 text-[1.75rem] font-bold">
          {zhHant.cardRepairTitle}
        </h1>
        <div className="flex flex-wrap w-full gap-4">
        <img
          src="https://cdn.caracardline.com/assets/1776263425636-49754c0823dc4d2f-banner-6.webp"
          className="mt-3 h-auto w-full rounded-2xl border border-[var(--border)] object-cover flex-1 max-w-[700px]"
          alt=""
          decoding="async"
        />
        <section
          className="mt-4 flex-1 rounded-2xl border border-[color-mix(in_srgb,var(--border)_78%,var(--accent)_22%)] bg-gradient-to-br from-[color-mix(in_srgb,var(--card)_92%,var(--accent))] via-[var(--card)] to-[var(--card)] p-4 shadow-[0_10px_36px_rgba(28,24,21,0.06)] sm:p-5"
          aria-label={zhHant.cardRepairTitle}
     
        >
          <div className="mt-4 min-w-[300px] flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="shrink-0 text-[0.9375rem] font-semibold text-[var(--fg)]">
                {zhHant.cardRepairPriceLabel}
              </span>
              <span className="text-[2rem] font-bold leading-none tracking-tight text-[var(--accent)]">
                {zhHant.cardRepairPriceFrom}
              </span>
            </div>
            <p className="m-0 text-[0.9375rem] leading-[1.5] text-[var(--muted)]">
              {zhHant.cardRepairPriceNote}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
            <a
              href={WHATSAPP_CHAT_URL}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[0.95rem] font-semibold text-[var(--fg)] no-underline hover:text-[#25d366]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {zhHant.cardRepairCtaWhatsApp}
            </a>
            <span className="text-[0.85rem] text-[var(--muted)]">
              {zhHant.cardRepairCtaHint}
            </span>
          </div>
        </section>
        </div>
      </header>

      <p className="mt-8 mb-4 leading-[1.65] text-[var(--muted)]">
        {zhHant.cardRepairLede}
      </p>

      {CARD_REPAIR_GALLERY.length === 0 ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">
            {zhHant.cardRepairEmptyTitle}
          </h2>
          <p className="m-0 mt-2 leading-[1.6] text-[var(--muted)]">
            {zhHant.cardRepairEmptyBody}
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CARD_REPAIR_GALLERY.map((it) => (
            <TwoUp key={it.id} item={it} />
          ))}
        </section>
      )}

      <section className="mt-6 max-w-[50rem] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="m-0 text-[1.1rem] font-bold">
          {zhHant.cardRepairNotesTitle}
        </h2>
        <ul className="m-0 mt-2 list-disc pl-5 text-[0.95rem] leading-[1.6] text-[var(--muted)]">
          <li>{zhHant.cardRepairNote1}</li>
          <li>{zhHant.cardRepairNote2}</li>
          <li>{zhHant.cardRepairNote3}</li>
        </ul>
      </section>
    </div>
  );
}

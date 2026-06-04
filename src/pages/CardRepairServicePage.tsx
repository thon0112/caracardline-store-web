import { zhHant } from "../locale/zh-Hant.js";
import { WHATSAPP_CHAT_URL } from "../components/WhatsAppFloat.js";

type CardRepairGalleryItem = {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  note?: string | null;
  imagePosition?: "top" | "center" | "bottom";
};

/** Edit this list to add before/after showcase cases. Image URLs can be CDN or `/public` paths. */
const CARD_REPAIR_GALLERY: CardRepairGalleryItem[] = [
  {
    id: "case-001",
    title: "壓痕 （正面)",
    imagePosition: "top",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780415180990-bdc1ca5d74a6e7bc-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780415181644-932a35b3a7f51a89-after.webp",
  },
  {
    id: "case-002",
    title: "摺痕 （正面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780415995380-0c0f514c776423d5-Untitled-design--4-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780415995945-03c5b577ef97b3ae-Untitled-design--5-.webp",
    note: "日版大月伊",
  },
  {
    id: "case-003",
    title: "邊角摺痕 （背面)",
    imagePosition: "top",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780414240992-9c3fcf5f6fc2a13f-2-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780414725765-c06e0359d7e4eed3-2-after.webp",
  },
  {
    id: "case-004",
    title: "狗咬邊 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780416499917-ae73cbb49c00536a-Untitled-design--7-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780416500582-8405a75eee75c66b-Untitled-design--6-.webp",
  },
  {
    id: "case-005",
    title: "嚴重損傷（背面）",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780414186023-a377ff8573fea381-9-before.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780414184940-72050a4421b301f0-9-after.webp",
    note: "出現嚴重裂紋或損傷，有脫色",
  },
  {
    id: "case-006",
    title: "白邊/白點 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780416971285-3db6a10887302aac-Untitled-design--4-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780416971798-886acf34b0f7768c-Untitled-design--5-.webp",
    note: "補色屬於加工類，如白點範圍太大或者太深不建議補色",
  },
  {
    id: "case-007",
    title: "刮傷/劃痕 （背面)",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780580176953-859e8d574932310e-Untitled-design--5-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780580170904-8db390837c45d3fd-Untitled-design--6-.webp",
    note: "示例為嚴重刮傷，如輕微刮傷可完全修復",
  },
  {
    id: "case-008",
    title: "壓痕 （背面)",
    imagePosition: "top",
    beforeUrl:
      "https://cdn.caracardline.com/assets/1780580593554-1d18fcc0b92bcc52-Untitled-design--7-.webp",
    afterUrl:
      "https://cdn.caracardline.com/assets/1780580605854-eb69a953a1f29ce3-Untitled-design--8-.webp",
  },
];

function TwoUp({
  item,
  index,
}: {
  item: CardRepairGalleryItem;
  index: number;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_10px_26px_rgba(28,24,21,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-[1.05rem] font-bold leading-snug text-[var(--fg)]">
            示例{index + 1}：{item.title}
          </h2>
          <p className="min-h-6 m-0 mt-1 text-[0.9375rem] leading-[1.55] text-[var(--muted)]">
            {item.note}
          </p>
        </div>
      </div>

      <div className="grid gap-1 grid-cols-2 sm:gap-3">
        <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <div className="absolute left-3 top-3 z-[2] rounded-full bg-[rgba(28,24,21,0.72)] px-3 py-1 text-[0.8rem] font-bold tracking-[0.02em] text-white">
            {zhHant.cardRepairBefore}
          </div>
          <img
            src={item.beforeUrl}
            alt={`${item.title} before`}
            className={`block aspect-[4/4] w-full rounded-xl object-cover ${item.imagePosition === "top" ? "object-top" : item.imagePosition === "center" ? "object-center" : "object-bottom"}`}
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
            className={`block aspect-[4/4] w-full rounded-xl object-cover ${item.imagePosition === "top" ? "object-top" : item.imagePosition === "center" ? "object-center" : "object-bottom"}`}
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
            src="https://cdn.caracardline.com/assets/1780582479414-4238e26fe63f0393-fix-step.webp"
            className="mt-3 h-auto w-full object-cover flex-1 max-w-[700px]"
            alt="A four-panel instructional graphic illustrating a card repair process, featuring a Cubone as the repair technician"
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
              <p className="text-[0.9375rem] font-semibold text-[var(--fg)]">
                {zhHant.cardRepairPricePeriod}
              </p>
              <p className="m-0 text-[0.9375rem] leading-[1.5] text-[var(--muted)]">
                {zhHant.cardRepairPriceNote}
              </p>
            </div>

            <div className="mt-4 md:mt-8 md:pt-8 flex flex-col items-center md:items-start gap-2 border-t border-[var(--border)] pt-4">
              <a
                href={WHATSAPP_CHAT_URL}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[#25d366] px-4 py-2 text-[0.95rem] font-semibold text-white no-underline hover:bg-[#25d366]/80"
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
      {/* <img
        src="https://cdn.caracardline.com/assets/1780582479414-4238e26fe63f0393-fix-step.webp"
        alt=""
        className="w-full rounded-2xl border border-[var(--border)] object-cover"
      /> */}
      <h2 className="mt-8 text-[1.75rem] font-bold">{zhHant.cardRepairStepsTitle}</h2>
      <p className="mt-2 mb-4 leading-[1.65] text-[var(--muted)] max-w-[680px]">
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
          {CARD_REPAIR_GALLERY.map((it, index) => (
            <TwoUp key={it.id} item={it} index={index} />
          ))}
        </section>
      )}

      <section className="mt-6 mb-4 max-w-[50rem] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
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

import type { ReactNode } from "react";

function PolicyLeadItem({
  lead,
  children,
}: {
  lead: string;
  children: ReactNode;
}) {
  return (
    <li className="mb-3 text-[var(--muted)] last:mb-0">
      <strong className="font-bold text-[var(--fg)]">{lead}</strong>
      {children}
    </li>
  );
}

export function ShippingPolicyPage() {
  return (
    <div className="max-w-[46rem]">
      <h1 className="m-0 mb-2 text-[1.75rem] font-bold">運送政策</h1>
      <p className="m-0 mb-6 max-w-[42rem] text-[var(--muted)]">
        以下是我們的運送條款及細則：
      </p>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="shipping-s1">
        <h2
          id="shipping-s1"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          1. 訂單處理時間
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]">
          <PolicyLeadItem lead="處理時間：">
            所有現貨訂單在確認付款後，通常會在 <span className="font-semibold">[1-3]</span> 個工作天內處理並寄出（不包括週六、週日及公眾假期）。
          </PolicyLeadItem>
          <PolicyLeadItem lead="特別情況：">
            若訂單量較大或遇上特殊節日，發貨時間可能稍有延遲，敬請見諒。
          </PolicyLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="shipping-s2">
        <h2
          id="shipping-s2"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          2. 配送方式及運費（香港本地）
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]">
          <PolicyLeadItem lead="主要配送商：">
            我們主要使用 <span className="font-semibold">順豐速運 (SF Express)</span> 進行配送，以確保物流穩定及可追蹤。
          </PolicyLeadItem>
          <PolicyLeadItem lead="自取／自助點：">
            順豐站 / 智能櫃 / 營業點自取：運費為到付方式。
          </PolicyLeadItem>
        </ul>
      </section>
      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="shipping-s6">
        <h2
          id="shipping-s6"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          3. 收貨注意事項
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]">
          <PolicyLeadItem lead="開箱錄影：">
            為保障雙方利益，請客人在收到包裹及開箱時全程錄影。若發現商品有損壞或遺漏，必須提供開箱影片作為後續處理憑證。
          </PolicyLeadItem>
          <PolicyLeadItem lead="收貨地址：">
            請確保提供的送貨地址及聯絡電話準確無誤。若因資料錯誤導致派送失敗或退件，產生的額外運費需由客人承擔。
          </PolicyLeadItem>
        </ul>
      </section>

      <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[var(--muted)]">
        <em>
          如有任何疑問，歡迎透過頁尾「聯絡我們」與我們聯繫；
          卡拉卡LINE 保留對本運送政策之修訂與最終解釋權。
        </em>
      </p>
    </div>
  );
}

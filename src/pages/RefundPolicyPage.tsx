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

export function RefundPolicyPage() {
  return (
    <div className="max-w-[46rem]">
      <h1 className="m-0 mb-2 text-[1.75rem] font-bold">退款政策</h1>
      <p className="m-0 mb-6 max-w-[42rem] text-[var(--muted)]">
        為保障雙方權益，請於購買前細閱以下退款與換貨相關說明；特定服務（例如代鑑、維修、回收）另有獨立約定者，以該次約定為準。
      </p>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="refund-s1">
        <h2
          id="refund-s1"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          1. 一般商品（網店購買）
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]" role="list">
          <PolicyLeadItem lead="七日與例外：">
            除法律另有強制規定外，收藏性商品、已拆封或依性質不宜退還之商品，可能不適用無條件退貨；具體是否得退換，以訂單成立時頁面說明、客服約定或相關法規為準。
          </PolicyLeadItem>
          <PolicyLeadItem lead="瑕疵與漏發：">
            若您收到的商品與訂單明顯不符、漏件，或於合理檢視下發現重大瑕疵並非網頁已揭示之正常品相範圍，請於收件後儘快透過客服聯繫並提供訂單資料與影像說明，以便我們協助核查。
          </PolicyLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="refund-s2">
        <h2
          id="refund-s2"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          2. 鑑定卡、原盒及易爭議品相
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]" role="list">
          <PolicyLeadItem lead="品相認定：">
            鑑定卡殼、原盒及卡牌類商品對光線、角度與個人標準敏感；網站圖片與文字描述僅供參考，細微划痕、印刷差異或鑑定公司既註記，不必然構成退貨理由。
          </PolicyLeadItem>
          <PolicyLeadItem lead="開箱與責任：">
            請於開箱與使用前保留完整包裝及必要證明；因不當拆裝、自行處理或保管不當導致之損害，恕無法據此要求退款。
          </PolicyLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="refund-s3">
        <h2
          id="refund-s3"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          3. 代辦／客製與預購類訂單
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]" role="list">
          <PolicyLeadItem lead="已送出之代辦：">
            凡屬 PSA 代鑑、維修、回收估價等已開始處理或已寄交第三方機構之服務，通常視為不可撤銷；已支付之手續費、運費或第三方費用，除另有約定或法令另有規定外，不予退還。
          </PolicyLeadItem>
          <PolicyLeadItem lead="預購與等候：">
            預購或依供應商／活動時程出貨之商品，取消或退款條件以該次商品頁面或雙方訊息約定為準；市價波動原則上不作為退款理由。
          </PolicyLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="refund-s4">
        <h2
          id="refund-s4"
          className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]"
        >
          4. 退款方式與流程
        </h2>
        <ul className="m-0 pl-5 leading-[1.55]" role="list">
          <li className="text-[var(--muted)]">
            經確認符合退款條件者，退款途徑（例如原支付渠道退回或其他雙方同意之方式）與入帳時間，可能受金融機構、支付平台作業影響；手續費是否退還依個案與約定辦理。
          </li>
        </ul>
      </section>

      <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[var(--muted)]">
        <em>
          爭議處理以誠信溝通為優先；卡拉卡LINE 保留對本退款政策之修訂與在法律允許範圍內之最終決定權。
        </em>
      </p>
    </div>
  );
}

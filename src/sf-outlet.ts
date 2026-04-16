export type SfOutlet = {
  kind: string;
  section: string;
  district: string;
  code: string;
  address: string;
  hoursWeekday: string;
  hoursSunHoliday: string;
  selfDrop: string;
};

const MAX_LEN = 255;

function truncate255(text: string): string {
  if (text.length <= MAX_LEN) return text;
  return `${text.slice(0, MAX_LEN - 1)}…`;
}

/** Maps a picked outlet into API `shipAddressLine1` / `shipAddressLine2` (255 char cap each). */
export function sfOutletToShipAddress(outlet: SfOutlet): {
  shipAddressLine1: string;
  shipAddressLine2?: string;
} {
  const shipAddressLine1 = truncate255(`順豐自提碼：${outlet.code}`);
  const detail = [
    outlet.address,
    `類型：${outlet.kind}；${outlet.section}；${outlet.district}`,
    `平日：${outlet.hoursWeekday}；假日：${outlet.hoursSunHoliday}`,
  ].join("｜");
  const shipAddressLine2 = truncate255(detail);
  return { shipAddressLine1, shipAddressLine2 };
}

export function outletSearchHaystack(o: SfOutlet): string {
  return [o.code, o.kind, o.section, o.district, o.address].join("\n");
}

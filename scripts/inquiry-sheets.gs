// linerealestate 전용. 다른 사이트나 시트의 자료를 변경하지 않습니다.
const INQUIRY_SHEET_ID = '1bpMVTIU7ZLcWP7PQRl7LhjeNRIDJkM-YALDX1VfVvic';
const INQUIRY_SYNC_TOKEN = '__PRIVATE_SYNC_TOKEN__';
function installInquirySync() {
  if (INQUIRY_SYNC_TOKEN === '__PRIVATE_SYNC_TOKEN__') throw new Error('관리자가 준비한 연결 코드를 사용하세요.');
  syncInquiries();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncInquiries')) {
    ScriptApp.newTrigger('syncInquiries').timeBased().everyMinutes(1).create();
  }
}
function syncInquiries() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const sheet = SpreadsheetApp.openById(INQUIRY_SHEET_ID).getSheetByName('문의 기록');
    if (!sheet || sheet.getRange('A1').getValue() !== '문의 ID') throw new Error('문의 기록 시트의 제목 행을 확인하세요.');
    const props = PropertiesService.getScriptProperties();
    const ids = new Set(sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().map(String) : []);
    let cursor = JSON.parse(props.getProperty('cursor') || 'null');
    for (let page = 0; page < 5; page++) {
      let url = 'https://linerealestate.vercel.app/api/inquiries/sheets';
      if (cursor) url += '?after=' + encodeURIComponent(cursor.created_at) + '&id=' + encodeURIComponent(cursor.id);
      const response = UrlFetchApp.fetch(url, {headers:{Authorization:'Bearer ' + INQUIRY_SYNC_TOKEN},muteHttpExceptions:true});
      if (response.getResponseCode() !== 200) throw new Error('문의 기록 연결 실패: ' + response.getResponseCode());
      const data = JSON.parse(response.getContentText());
      if (data.site !== 'linerealestate' || data.sheetId !== INQUIRY_SHEET_ID || !Array.isArray(data.rows)) throw new Error('사이트 또는 시트가 일치하지 않습니다.');
      if (!data.rows.length) break;
      const fresh = data.rows.filter(row => !ids.has(row.id));
      const safe = value => {const text=String(value || '');return /^[=+\-@]/.test(text) ? "'" + text : text;};
      const kinds={general:'일반 상담',listing:'매물 상담',work:'중개 사례 상담',landlord:'점포 내놓기'};
      const statuses={new:'새 문의',contacted:'연락 완료',closed:'상담 종료'};
      if (fresh.length) {
        const values=fresh.map(row=>[row.id,row.site_id,new Date(row.created_at),kinds[row.kind]||row.kind,row.listing_number||'',safe(row.listing_title),safe(row.goal),safe(row.phone),safe(row.industry),safe(row.message),safe(row.preferred_time),statuses[row.status]||row.status,'']);
        const range=sheet.getRange(sheet.getLastRow()+1,1,values.length,13);
        range.setValues(values);
        sheet.getRange(range.getRow(),3,values.length,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
        sheet.getRange(range.getRow(),8,values.length,1).setNumberFormat('@');
        sheet.getRange(range.getRow(),10,values.length,1).setWrap(true);
        SpreadsheetApp.flush();
        fresh.forEach(row=>ids.add(row.id));
      }
      const last=data.rows[data.rows.length-1];cursor={created_at:last.created_at,id:last.id};props.setProperty('cursor',JSON.stringify(cursor));
      if (data.rows.length<100)break;
    }
  } finally {lock.releaseLock();}
}

const SHEET_NAME = 'THR';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'claim';

    if (action === 'claim') {
      return jsonResponse(claimThr_());
    }

    if (action === 'health') {
      return jsonResponse({ success: true, message: 'ok' });
    }

    if (action === 'stats') {
      return jsonResponse(getStats_());
    }

    return jsonResponse({ success: false, message: 'Action tidak dikenal' });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message || 'Terjadi kesalahan di Apps Script',
    });
  }
}

function claimThr_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" tidak ditemukan`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      success: true,
      empty: true,
      message: 'THR sudah habis',
    };
  }

  const range = sheet.getRange(2, 1, lastRow - 1, 4);
  const values = range.getValues();

  for (let i = 0; i < values.length; i += 1) {
    const rowIndex = i + 2;
    const reward = String(values[i][0] || '').trim();
    const status = String(values[i][1] || '').trim().toUpperCase();

    if (!reward) {
      continue;
    }

    if (status && status !== 'READY') {
      continue;
    }

    sheet.getRange(rowIndex, 2).setValue('CLAIMED');
    sheet.getRange(rowIndex, 3).setValue(new Date());
    sheet.getRange(rowIndex, 4).setValue('Website THR');

    return {
      success: true,
      empty: false,
      reward: reward,
    };
  }

  return {
    success: true,
    empty: true,
    message: 'THR sudah habis',
  };
}

function getStats_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" tidak ditemukan`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      success: true,
      remaining: 0,
    };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  let remaining = 0;

  for (let i = 0; i < values.length; i += 1) {
    const reward = String(values[i][0] || '').trim();
    const status = String(values[i][1] || '').trim().toUpperCase();

    if (reward && (!status || status === 'READY')) {
      remaining += 1;
    }
  }

  return {
    success: true,
    remaining: remaining,
  };
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

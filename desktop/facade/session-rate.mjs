const key='rf-session-rate';
export function readSessionRate(storage,day){try{const value=JSON.parse(storage.getItem(key));return value?.day===day&&typeof value.date==='string'&&Number.isFinite(value.rate)&&value.rate>0?value:null;}catch{return null;}}
export function saveSessionRate(storage,day,date,rate){if(Number.isFinite(rate)&&rate>0)storage.setItem(key,JSON.stringify({day,date,rate}));else storage.removeItem(key);}
export function restoreSessionRate(storage,day,settings,hasSavedSettings){const value=readSessionRate(storage,day);if(!hasSavedSettings&&value)settings.date=value.date;settings.rate=value?.date===settings.date?value.rate:null;return settings;}

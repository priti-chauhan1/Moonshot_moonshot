const XLSX = require('xlsx');
const fs = require('fs');
const workbook = XLSX.readFile('data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
const headers = jsonData[0].slice(3); 
const rows = jsonData.slice(1);
function excelDateToJSDate(excelDate) {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0]; 
}
const result = rows.map(row => {
  let [day, age, gender, ...groups] = row;
  if (typeof day === 'number') {
    day = excelDateToJSDate(day);
  }
  const entry = { day, age, gender };
  headers.forEach((header, index) => {
    entry[header] = groups[index];
  });
return entry;
});
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
console.log("Data successfully structured and saved:", result);

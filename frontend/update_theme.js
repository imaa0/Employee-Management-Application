const fs = require('fs');
const path = require('path');

const filePaths = [
  "D:/EMS/frontend/src/app/page.tsx",
  "D:/EMS/frontend/src/app/dashboard/layout.tsx",
  "D:/EMS/frontend/src/app/dashboard/page.tsx",
  "D:/EMS/frontend/src/app/dashboard/employees/page.tsx",
  "D:/EMS/frontend/src/app/dashboard/employees/add/page.tsx"
];

for (const filePath of filePaths) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip hardcoded dark class overrides that interfere with new token architecture
  content = content.replace(/dark:bg-slate-950/g, "");
  content = content.replace(/dark:bg-slate-900/g, "");
  content = content.replace(/dark:border-slate-800/g, "");
  content = content.replace(/dark:text-slate-100/g, "");

  // Content token replacements
  content = content.replace(/bg-slate-50/g, "bg-theme-bg");
  content = content.replace(/bg-[#F8F9FA]/g, "bg-theme-bg");
  content = content.replace(/bg-white/g, "bg-theme-card");
  
  content = content.replace(/text-slate-900/g, "text-theme-heading");
  content = content.replace(/text-\[\#0f172a\]/g, "text-theme-heading");
  
  content = content.replace(/text-slate-500/g, "text-theme-text");
  content = content.replace(/text-slate-700/g, "text-theme-heading");
  content = content.replace(/text-\[\#64748b\]/g, "text-theme-text");

  content = content.replace(/border-slate-100/g, "border-theme-border");
  content = content.replace(/border-slate-200/g, "border-theme-border");
  content = content.replace(/border-slate-50/g, "border-theme-border");

  fs.writeFileSync(filePath, content);
}

console.log("Tokens replaced!");

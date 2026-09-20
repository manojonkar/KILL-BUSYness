const fs = require('fs');
let code = fs.readFileSync('c:/KILL BUSYness Website/Rebuild/rebuild/source/app/buy/OrderForm.tsx', 'utf8');
code = code.replace(/{wallet > 0 && \(/, '{wallet > 0 ? (');
code = code.replace(
  /          <\/div>\r?\n        \)\}\r?\n\r?\n        <p style=\{\{ gridColumn:/,
  `          </div>
        ) : (
          <div className="field" style={{ gridColumn: "1/-1", background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <label style={{ color: "#475569" }}>Redeem MI Credits</label>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              You have 0 MI Credits available to redeem. (If you have credits, please make sure you are logged in!)
            </p>
          </div>
        )}

        <p style={{ gridColumn:`
);
fs.writeFileSync('c:/KILL BUSYness Website/Rebuild/rebuild/source/app/buy/OrderForm.tsx', code, 'utf8');

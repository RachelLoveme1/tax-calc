// חישוב מס הכנסה לפי מדרגות 2025
function calculateGrossTax(annualIncome) {
  const brackets = [
    { upTo: 84120, rate: 0.10 },
    { upTo: 120720, rate: 0.14 },
    { upTo: 193800, rate: 0.20 },
    { upTo: 269280, rate: 0.31 },
    { upTo: 560280, rate: 0.35 },
    { upTo: 721560, rate: 0.47 },
    { upTo: Infinity, rate: 0.50 }
  ];

  let remaining = annualIncome;
  let previousLimit = 0;
  let totalTax = 0;

  for (const bracket of brackets) {
    if (annualIncome > previousLimit) {
      const taxable = Math.min(bracket.upTo - previousLimit, remaining);
      totalTax += taxable * bracket.rate;
      remaining -= taxable;
      previousLimit = bracket.upTo;
    } else {
      break;
    }
  }

  return totalTax;
}

function applyTaxCredits(grossTax, creditPoints) {
  const creditValuePerYear = 242 * 12;
  const totalCredit = creditPoints * creditValuePerYear;
  return Math.max(0, grossTax - totalCredit);
}

function applyAdditionalCredits(netTax, lifeInsurance = 0, pensionDeposit = 0) {
  const lifeInsuranceCredit = lifeInsurance * 0.25;
  const maxPensionCreditBase = 8148;
  const pensionCredit = Math.min(pensionDeposit, maxPensionCreditBase) * 0.35;
  const totalAdditionalCredit = lifeInsuranceCredit + pensionCredit;
  const finalTax = Math.max(0, netTax - totalAdditionalCredit);

  return {
    finalTax,
    lifeInsuranceCredit,
    pensionCredit,
    totalAdditionalCredit
  };
}

function calculateRequiredDonations(netTax, annualIncome) {
  const donationCreditRate = 0.35;
  const minDonation = 190;
  const maxDonation = annualIncome * 0.3;
  const requiredDonation = netTax / donationCreditRate;

  if (requiredDonation < minDonation) {
    return {
      requiredDonation: 0,
      note: `סכום המס שלך נמוך מדי – תרומה מזכה מתחילה רק מ-₪${minDonation}`
    };
  }

  if (requiredDonation > maxDonation) {
    return {
      requiredDonation: maxDonation,
      note: `שימו לב: החוק מגביל תרומות מזכות ל-30% מההכנסה. נחשב לפי המקסימום המותר.`
    };
  }

  return {
    requiredDonation,
    note: null
  };
}

// חיבור לטופס והצגת תוצאה
const form = document.getElementById("taxForm");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const income = parseFloat(document.getElementById("income").value);
  const creditPoints = parseFloat(document.getElementById("creditPoints").value);
  const lifeInsurance = parseFloat(document.getElementById("lifeInsurance").value);
  const pensionDeposit = parseFloat(document.getElementById("pensionDeposit").value);

  const grossTax = calculateGrossTax(income);
  const taxAfterCredits = applyTaxCredits(grossTax, creditPoints);
  const {
    finalTax,
    lifeInsuranceCredit,
    pensionCredit,
    totalAdditionalCredit
  } = applyAdditionalCredits(taxAfterCredits, lifeInsurance, pensionDeposit);
  const { requiredDonation, note } = calculateRequiredDonations(finalTax, income);

  resultsDiv.innerHTML = `
    <p>💰 <strong>מס ברוטו:</strong> ₪${grossTax.toFixed(2)}</p>
    <p>🎯 <strong>מס לאחר נקודות זיכוי (${creditPoints}):</strong> ₪${taxAfterCredits.toFixed(2)}</p>
    <p>📉 <strong>זיכוי ביטוח חיים:</strong> ₪${lifeInsuranceCredit.toFixed(2)}</p>
    <p>📉 <strong>זיכוי גמל:</strong> ₪${pensionCredit.toFixed(2)}</p>
    <p>🧾 <strong>סה"כ מס סופי לתשלום:</strong> ₪${finalTax.toFixed(2)}</p>
    <p>❤️ <strong>סכום תרומה לקבלת החזר מלא:</strong> ₪${requiredDonation.toFixed(2)}</p>
    ${note ? `<p style="color:red;">⚠️ ${note}</p>` : ""}
  `;
});

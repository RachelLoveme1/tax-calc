// חישוב מס הכנסה לפי מדרגות עבור שנה מסוימת
function calculateGrossTax(annualIncome, year) {
  const bracketsByYear = {
    2023: [
      { upTo: 81480, rate: 0.10 },
      { upTo: 116760, rate: 0.14 },
      { upTo: 187440, rate: 0.20 },
      { upTo: 260520, rate: 0.31 },
      { upTo: 542160, rate: 0.35 },
      { upTo: 698280, rate: 0.47 },
      { upTo: Infinity, rate: 0.50 },
    ],
    2024: [
      { upTo: 84120, rate: 0.10 },
      { upTo: 120720, rate: 0.14 },
      { upTo: 193800, rate: 0.20 },
      { upTo: 269280, rate: 0.31 },
      { upTo: 560280, rate: 0.35 },
      { upTo: 721560, rate: 0.47 },
      { upTo: Infinity, rate: 0.50 },
    ],
    2025: [
      { upTo: 84120, rate: 0.10 },
      { upTo: 120720, rate: 0.14 },
      { upTo: 193800, rate: 0.20 },
      { upTo: 269280, rate: 0.31 },
      { upTo: 560280, rate: 0.35 },
      { upTo: 721560, rate: 0.47 },
      { upTo: Infinity, rate: 0.50 },
    ],
  };

  const brackets = bracketsByYear[year];
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

function applyTaxCredits(grossTax, creditPoints, year) {
  const creditValueByYear = {
    2023: 2820,
    2024: 2904,
    2025: 2904,
  };
  const creditValuePerYear = creditValueByYear[year];
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
  const year = parseInt(document.getElementById("taxYear").value);

  const grossTax = calculateGrossTax(income, year);
  const taxAfterCredits = applyTaxCredits(grossTax, creditPoints, year);
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

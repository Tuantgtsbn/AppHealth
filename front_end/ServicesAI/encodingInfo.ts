// Đối tượng encodingInfoData chứa thông tin mã hóa
const encodingInfoData: any = {
  Gender: { Female: 0, Male: 1, Other: 2 },
  Region: {
    Central: 0,
    East: 1,
    North: 2,
    "North-East": 3,
    South: 4,
    West: 5,
  },
  "Urban/Rural": { Rural: 0, Urban: 1 },
  SES: { High: 0, Low: 1, Middle: 2 },
  "Smoking Status": { Never: 0, Occasionally: 1, Regularly: 2 },
  "Alcohol Consumption": { Never: 0, Occasionally: 1, Regularly: 2 },
  "Diet Type": { "Non-Vegetarian": 0, Vegan: 1, Vegetarian: 2 },
  "Physical Activity Level": { High: 0, Moderate: 1, Sedentary: 2 },
  "Family History of Heart Disease": { No: 0, Yes: 1 },
  Diabetes: { No: 0, Yes: 1 },
  Hypertension: { No: 0, Yes: 1 },
  "Stress Level": { High: 0, Low: 1, Medium: 2 },
  "ECG Results": { Abnormal: 0, Normal: 1 },
  "Chest Pain Type": {
    Asymptomatic: 0,
    Atypical: 1,
    "Non-anginal": 2,
    Typical: 3,
  },
  "Exercise Induced Angina": { No: 0, Yes: 1 },
};

// Hàm chuẩn hóa dữ liệu đầu vào
export function constructInputVector(userInput: any, featureColumns: any) {
  const vector = [] as any;
  const bpParsed = parseBloodPressure(userInput["Blood Pressure"]);
  userInput.Systolic = bpParsed.systolic;
  userInput.Diastolic = bpParsed.diastolic;

  featureColumns.forEach((col: any) => {
    const userValue = userInput[col];

    if (typeof userValue === "number") {
      vector.push(userValue);
    } else {
      if (
        encodingInfoData[col] &&
        encodingInfoData[col][userValue] !== undefined
      ) {
        const encodedValue = encodingInfoData[col][userValue];
        vector.push(encodedValue);
      } else {
        vector.push(0);
      }
    }
    console.log("feature:", col, "value:", vector[vector.length - 1]);
  });
  console.log("vector:", vector);

  return vector;
}

function parseBloodPressure(bloodPressure: string) {
  const [systolic, diastolic] = bloodPressure.split("/");
  return {
    systolic: parseFloat(systolic) || 0,
    diastolic: parseFloat(diastolic) || 0,
  };
}

import scalerParams from '../../assets/ai/scaler_params.json';
import featureColumns from '../../assets/ai/feature_columns.json';
import * as tf from '@tensorflow/tfjs';

const initTensorflow = async () => {
    await tf.setBackend('cpu');
    await tf.ready();
};

const parseBloodPressure = (bp: string) => {
    const [systolic, diastolic] = bp.split('/').map(parseFloat);
    return { systolic, diastolic };
};

function createCategoryColumns(userInput: any, featureColumns: string[]) {
    const categoricalColumns = featureColumns.filter((col) =>
        col.includes('_')
    );
    const categoricalValues = {} as any;

    categoricalColumns.forEach((col) => {
        const [field, category] = col.split('_');
        if (userInput[field] === category) {
            categoricalValues[col] = 1; // Nếu trùng, gán 1
        } else {
            categoricalValues[col] = 0; // Nếu không trùng, gán 0
        }
    });

    return categoricalValues;
}

function constructInputVector(userInput: any, featureColumns: any) {
    const vector = [] as any;
    const bpParsed = parseBloodPressure(userInput['Blood Pressure']);
    userInput.Systolic = bpParsed.systolic;
    userInput.Diastolic = bpParsed.diastolic;
    const categoricalValues = createCategoryColumns(userInput, featureColumns);

    console.log('categoricalValues:', categoricalValues);

    featureColumns.forEach((col: any) => {
        if (col in categoricalValues) {
            vector.push(categoricalValues[col]);
        } else if (col in userInput) {
            const userValue = userInput[col];
            if (typeof userValue === 'number') {
                vector.push(userValue);
            } else {
                vector.push(parseFloat(userValue.toString()) || 0);
            }
        } else {
            vector.push(0);
        }
    });

    return vector;
}

function normalizeInput(vector: number[]) {
    return vector.map((val, idx) => {
        const mean = scalerParams.mean[idx];
        const std = scalerParams.std[idx];
        return (val - mean) / std;
    });
}

// Prediction function
const makePrediction = async (model: any, userInput: any) => {
    try {
        if (model) {
            await initTensorflow();

            const rawInputVector = constructInputVector(
                userInput,
                featureColumns
            );
            const normalizedVector = normalizeInput(rawInputVector);
            console.log('✅ Normalized Input Vector:', normalizedVector);

            const inputTensor = tf.tensor2d([normalizedVector]);
            console.log('✅ Input Tensor Shape:', inputTensor.shape);

            const result = model.predict(inputTensor) as tf.Tensor;
            await result.data();
            const predictionResult = result.dataSync();
            console.log('✅ Dự đoán:', predictionResult[0].toFixed(4));

            return predictionResult[0].toFixed(4);
        } else {
            console.log('🚨 Model chưa được tải.');
        }
    } catch (err) {
        console.error('🚨 Lỗi khi dự đoán:', err);
    }
};

export default makePrediction;

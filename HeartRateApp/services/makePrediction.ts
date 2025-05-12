import scalerParams from '../assets/ai/scaler_params.json';
import featureColumns from '../assets/ai/feature_columns.json';
import * as tf from '@tensorflow/tfjs';
import { constructInputVector } from './encodingInfo';

const initTensorflow = async () => {
    await tf.setBackend('cpu');
    await tf.ready();
};


function normalizeInput(vector: number[]) {
    return vector.map((val, idx) => {
        const mean = scalerParams.mean[idx];
        const std = scalerParams.std[idx];
        return (val - mean) / std;
    });
}

const makePrediction = async (model: any, userInput: any) => {
    try {
        if (model) {
            await initTensorflow();

            const rawInputVector = constructInputVector(
                userInput,
                featureColumns
            );
            console.log('✅ Raw Input Vector: ', rawInputVector);
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

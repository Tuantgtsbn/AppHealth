import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const loadModel = async () => {
    await tf.ready();

    const modelJson = require('../assets/ai/model.json');
    const modelWeights = require('../assets/ai/group1-shard1of1.bin');

    const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
    );
    console.log('✅ Model loaded successfully!');
    return model;
};

export default loadModel;

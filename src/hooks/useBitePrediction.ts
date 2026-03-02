import * as tf from '@tensorflow/tfjs-react-native';
import modelJSON from '../ml/biteModel.json';

export const useBitePrediction = () => {
  const [model, setModel] = useState(null);
  const predict = async (features: number[]) => {
    if (!model) {
      await tf.ready();
      const m = await tf.loadLayersModel(modelJSON);
      setModel(m);
    }
    const input = tf.tensor2d([features]);
    const output = model.predict(input) as tf.Tensor;
    return (await output.data())[0];
  };
  return { predict };
};
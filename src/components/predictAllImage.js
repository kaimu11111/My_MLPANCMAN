import { useAtom } from 'jotai'
import { 
  imgSrcArrAtom,
  modelAtom,
  truncatedMobileNetAtom
} from '../GlobalState'
import {predict, base64ToTensor, predict_, predictDirection} from '../model/index.js'

export const predictAllImages = async (imgSrcArr, setImgSrcArr, truncatedMobileNet, model) => {
    const batchSize = 4;
    const totalBatches = Math.ceil(imgSrcArr.length / batchSize);

    const updatedData = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * batchSize;
        const endIdx = startIdx + batchSize;
        const batchItems = imgSrcArr.slice(startIdx, endIdx);

        const batchUpdates = await Promise.all(
            batchItems.map(async (item) => {
                const imgTensor = await base64ToTensor(item.src);
                const { classId, maxProbability } = await predict_(truncatedMobileNet, model, imgTensor);
                return {
                    ...item,
                    prediction: classId,
                    confidence: maxProbability,
                };
            })
        );

        updatedData.push(...batchUpdates);
    }

    setImgSrcArr(updatedData);
    return updatedData;
};
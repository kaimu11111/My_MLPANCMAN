import { atom } from "jotai";
import { loadTruncatedMobileNet } from "./model";

// ---- Configurations ----
export const epochsAtom = atom(100); // Number of epochs
export const batchSizeAtom = atom(1); // Selected batch size
export const hiddenUnitsAtom = atom(100); // Number of hidden units
export const learningRateAtom = atom(0.0001); // Learning rate
export const gameRunningAtom = atom(false); // Game state
export const predictionAtom = atom(null); // Current prediction
export const predictionDetailsAtom = atom({ classId: null, maxProbability: null });
// ---- Model Training ----
export const modelAtom = atom(null); // Model
export const truncatedMobileNetAtom = atom(loadTruncatedMobileNet()); // truncatedMobileNet
export const imgSrcArrAtom = atom([]); // collected images, formate {src: string, label: string}

// ---- UI Display ----
export const lossAtom = atom(null); // Loss value
export const trainingProgressAtom = atom(-1); // Training progress
export const stopTrainingAtom = atom(false); // Flag to stop training

export const isFinetunedAtom = atom(false);
export const maxProbabilityAtom = atom(null); // Maximum probability of the prediction

export const newImgSrcArrAtom = atom([]); // New image source array for prediction

export const imageGalleryAtom = atom(false);

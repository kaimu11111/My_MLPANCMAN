import Webcam from "react-webcam";
import { Grid, Button, Box } from "@mui/material";
import {
    ArrowUpward,
    ArrowDownward,
    ArrowBack,
    ArrowForward,
} from "@mui/icons-material/";
import { useState, useRef } from "react";
import { useAtom } from "jotai";
import {
    imgSrcArrAtom,
    dataSetSizeAtom,
    batchArrayAtom,
    batchSizeAtom,
    gameRunningAtom,
} from "../GlobalState";
import React, { useEffect } from "react"
const DIRECTIONS = {
    up: <ArrowUpward />,
    down: <ArrowDownward />,
    left: <ArrowBack />,
    right: <ArrowForward />,
};
import { maxProbabilityAtom } from "../GlobalState";
import { predictionAtom } from "../GlobalState";
import { Tooltip, Typography } from "@mui/material";

export default function DataCollection({ webcamRef }) {
    const [isCameraOn, setIsCameraOn] = useState(false);

    // ---- Model Training ----
    const [imgSrcArr, setImgSrcArr] = useAtom(imgSrcArrAtom);

    // ---- Configurations ----
    const [, setBatchSize] = useAtom(batchSizeAtom);
    const [gameRunning] = useAtom(gameRunningAtom);

    // ---- UI Display ----
    const getDirectionText = (value) => {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          return "No Prediction";
        }
      
        if (value >= 0 && value <= 3) {
          return `Current Predicted direction: ${arrow_dic[value]}`;
        } else {
          return "Invalid Direction";
        }
      };
    const capture = (direction) => async () => {
        // Capture image from webcam
        const newImageSrc = webcamRef.current.getScreenshot();

        // If image is not null, proceed with adding it to the dataset
        if (newImageSrc) {

            // Add example to the dataset
            const newImageArr = [...imgSrcArr, { src: newImageSrc, label: direction }];
            setImgSrcArr(newImageArr);
            setBatchSize(Math.floor(newImageArr.length * 0.4));
        }
    };
    const arrow_dic = ["RIGHT", "UP", "LEFT", "DOWN"];

    const cameraPlaceholder = (
        <Box
            display="flex"
            textAlign={"center"}
            justifyContent="center"   
            alignItems="center"
            sx={{
                p: 2,
                border: "1px dashed grey",
                height: "224px",
                width: "224px",
                margin: "auto",
                backgroundColor: "#ddd",
            }}
        >
            Please turn on the cemara to collect data
        </Box>
    );
    const [predictionDirection] = useAtom(predictionAtom);
    const [maxProbability] = useAtom(maxProbabilityAtom);
    return (
        <Grid container position={"relative"}>
            {/* first row */}
            <Box
            position="absolute"
            top={40}
            right={0}
            
            sx={{backgroundColor: "white", borderRadius: "2px", width: "250px", height: "240px",fontSize: "30px",}}>
            {getDirectionText(predictionDirection)}
            
            <div style={{ height: "20px" }}></div>
            <div style={{ fontSize: "30px" }}>
            {maxProbability
            ? `Confidence Score: ${Math.round(maxProbability * 100)}%`
            : "None"}
            </div>

            </Box>
            <Grid
                item
                xs={12}
                sx={{ marginBottom: 2, marginRight: 30 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
            >
                <Box textAlign="center">
                    <Button
                        variant="contained"
                        onClick={() => setIsCameraOn(!isCameraOn)}
                        disabled={gameRunning}
                    >
                        {" "}
                        {isCameraOn ? "Stop" : "Start"} Camera
                    </Button>
                </Box>
                <Box sx={{ marginTop: 1 }}>
                    {isCameraOn ? (
                        <Webcam
                            mirrored
                            width={224}
                            height={224}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 224,
                                height: 224,
                                facingMode: "user",
                            }}
                        />
                    ) : (
                        cameraPlaceholder
                    )}
                </Box>
            </Grid>

            {Object.keys(DIRECTIONS).map((directionKey) => {
                return (
                    <OneDirection
                        key={directionKey}
                        disabled={!isCameraOn}
                        directionIcon={DIRECTIONS[directionKey]}
                        onCapture={capture(directionKey)}
                        dirImgSrcArr={imgSrcArr.filter((d) => d.label == directionKey)}
                    />
                );
            })}
        </Grid>
    );
}

const OneDirection = ({ directionIcon, onCapture, dirImgSrcArr, disabled }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [, setImgSrcArr] = useAtom(imgSrcArrAtom);
    const [images, setImages] = useState([]);
    const arrow_dic = ["up", "down", "left", "right"];
    useEffect(() => {
        setImages(dirImgSrcArr);
      }, [dirImgSrcArr]);
    const handleclick = () => {
        onCapture();
        setIsSaved(true);
    }
    const handleDelete = (indexToDelete) => {
        setImgSrcArr((prevArr) =>
            prevArr.filter((item, i) => {
                return !(item.label === dirImgSrcArr[0]?.label && dirImgSrcArr.indexOf(item) === indexToDelete);
            })
        );
    };
    return (
        <Grid item xs={3}>
            <Box textAlign="center">
                <Button
                    variant="outlined"
                    endIcon={directionIcon}
                    onClick={handleclick}
                    disabled={disabled}
                >
                    {" "}
                    {isSaved ? "save another pic " : "save one pic for training "}
                </Button>
                </Box>
                <Box
                textAlign="center"
                sx={{
                    width: "100%",
                    height: "120px",
                    overflowX: "auto",
                    overflowY: "hidden", 
                    display: "flex",
                    flexDirection: "row",
                    gap: "2px",
                    padding: "8px 0",
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "2px" },
                }}
                >
                {images.map((img, index) => {
                    const isLowConfidence = img.confidence !== undefined && img.confidence < 0.7;
                    const isWrongPrediction = arrow_dic[img.prediction] !== undefined && arrow_dic[img.prediction] !== img.label;

                return (
                <Tooltip
                    key={index}
                    title={
                    <Box p={1}>
                        <Typography variant="caption">Real Label: {img.label || "unknown"}</Typography>
                        <Typography variant="caption" display="block">
                        Prediction: {arrow_dic[img.prediction] || "no prediction"}
                        </Typography>
                        <Typography variant="caption" display="block">
                        Confidence: {img.confidence !== undefined ? `${Math.round(img.confidence * 100)}%` : "N/A"}
                        </Typography>
                    </Box>
                    }
                        arrow
                    >
                    <Box
                    sx={{
                        position: "relative",
                        flex: "0 0 100px",
                        height: "100px",
                        display: "inline-block",
                        border: (isLowConfidence || isWrongPrediction) 
                            ? "2px solid #ff4444" 
                            : "1px solid #ddd",
                        borderRadius: "6px",
                        overflow: "hidden",
                        flexShrink: 0,
                        mx: "2px",
                        }}
                    >
                    <img
                        src={img.src || "placeholder.jpg"}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        flexShrink: 0,
                        }}

                    />
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        minWidth: "20px",
                        padding: "2px",
                        }}
                        onClick={() => handleDelete(index)}
                        aria-label={`Delete image ${index + 1}`}
                    >
                        X
                    </Button>
                    </Box>
                </Tooltip>
                );
            })}
            </Box>
        </Grid>
    );
};

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
export default function DataCollection({ webcamRef }) {
    const [isCameraOn, setIsCameraOn] = useState(false);

    // ---- Model Training ----
    const [imgSrcArr, setImgSrcArr] = useAtom(imgSrcArrAtom);

    // ---- Configurations ----
    const [, setBatchSize] = useAtom(batchSizeAtom);
    const [gameRunning] = useAtom(gameRunningAtom);

    // ---- UI Display ----

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
    const arrow_dic = ["UP", "DOWN", "LEFT", "RIGHT"];

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
            {predictionDirection
                    ? `Current Predicted direction: ${arrow_dic[predictionDirection]}`
                    : "No Prediction"}
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
          overflow: "auto",
          display: "flex",
          gap: "8px",
          padding: "8px 0",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "2px" },
        }}
      >
        {images.map((imgSrc, index) => (
          <Box key={index} sx={{ position: "relative", display: "inline-block" }}>
            <img
              src={imgSrc.src}
              alt={`Thumbnail ${index + 1}`}
              style={{
                width: "auto",
                height: "100%",
                borderRadius: "6px",
                objectFit: "cover",
                flexShrink: 0,
                border: "1px solid #ddd",
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
            >
              X
            </Button>
          </Box>
                ))}
            </Box>
        </Grid>
    );
};

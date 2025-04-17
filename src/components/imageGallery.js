import React from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Stack,
  Tooltip,
  Button
} from '@mui/material';
import { Close, ZoomIn, Info } from '@mui/icons-material'
import { imageGalleryAtom, newImgSrcArrAtom,selectedImageAtom,imgSrcArrAtom } from '../GlobalState'; 

const ImageGallery = () => {
  const [galleryOpen, setGalleryOpen] = useAtom(imageGalleryAtom);
  const [selectedImages, setSelectedImage] = React.useState([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [imageCollection, setImageCollection] = useAtom(newImgSrcArrAtom);
  const [imgSrcArr, setImgSrcArr] = useAtom(imgSrcArrAtom); // Assuming this is the atom for the image collection
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  console.log("Image collection in ImageGallery:", imageCollection);
  const handleClose = () => {
    setGalleryOpen(false);
    setSelectedImage([]);
    setImageCollection([]); 
    setSaveSuccess(false);
  };
  const handleImageClick = (img) => {
    setSelectedImage(prev => {
      const exists = prev.some(selected => selected.src === img.src);
      return exists 
        ? prev.filter(selected => selected.src !== img.src)
        : [...prev, img];
    });
  };

  const handleSavingImages = () => {
    setImgSrcArr((prev) => [...prev, ...selectedImages]);
    setSelectedImage([]);
    setSaveSuccess(true);
  };
  const directionarray = ["right", "up", "left", "down"];
  const imageCount = imageCollection.length;
  
  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={galleryOpen}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '80%',
            backgroundColor: theme.palette.background.default,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" sx={{ color: 'text.primary' }}>
                  Image Collection
                </Typography>
                <Chip 
                  label={`Selected: ${selectedImages.length}/${imageCount}`}
                  color="secondary"
                  icon={<Info fontSize="small" />}
                />
              </Stack>
            </Grid>
            
            {imageCollection.map((img, index) => {
  const isSelected = selectedImages.some((selected) => selected.src === img.src);

  return (
    <Grid item xs={6} sm={4} md={3} key={`${index}-${img.label}`}>
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 8,
          overflow: 'hidden',
          transition: 'all 0.3s',
          border: isSelected ? '3px solid #4CAF50' : '3px solid transparent', 
        }}
        onClick={() => handleImageClick(img)}
      >
        <img
          src={img.src}
          alt={`Collected image ${index + 1}`}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
          }}
        />

        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            SELECTED
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            color: 'white',
            padding: '8px',
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption">Label: {img.label}</Typography>
            <Typography variant="caption">
              Confidence: {(img.confidence * 100).toFixed(1)}%
            </Typography>
          </Stack>
        </div>
      </div>
    </Grid>
      );
    })}

            {imageCount === 0 && (
              <Grid item xs={12}>
                <Typography 
                  variant="body1" 
                  align="center"
                  sx={{ 
                    color: 'text.secondary',
                    py: 4 
                  }}
                >
                  No images collected yet
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <div style={{ textAlign: 'center', padding: '16px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSavingImages()}
        >
          Saving images for training
        </Button>
        </div>
        
        {saveSuccess && (
          <div style={{ textAlign: 'center', color: 'green', marginTop: '16px' }}>
            Saving success!
          </div>
        )}
            
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Close />
        </IconButton>
      </Dialog>
    </>
  );
};

export default ImageGallery;
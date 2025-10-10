import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload image endpoint
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { barcode } = req.body;

    // Check if image already exists for this barcode
    if (barcode) {
      const { data: existingImage } = await supabase
        .from('barcode_images')
        .select('image_url')
        .eq('barcode', barcode)
        .single();

      if (existingImage) {
        return res.json({
          imageUrl: existingImage.image_url,
          shared: true,
          message: 'Using existing image for this barcode'
        });
      }
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${req.file.mimetype.split('/')[1]}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image to storage' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // If barcode is provided, save for sharing across all users
    if (barcode) {
      await supabase
        .from('barcode_images')
        .upsert(
          {
            barcode,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'barcode' }
        );
    }

    res.json({
      imageUrl,
      shared: false,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;

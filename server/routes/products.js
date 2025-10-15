import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all products for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📦 Fetching products for user:', userId);

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('added_date', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    console.log(`✅ Found ${products?.length || 0} products`);
    res.json(products || []);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, barcode, expiryDate, notes, imageUrl, brand } = req.body;

    if (!name || !barcode || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          user_id: userId,
          name,
          barcode,
          expiry_date: expiryDate,
          notes: notes || '',
          image_url: imageUrl || '',
          brand: brand || '',
          added_date: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to add product' });
    }

    // If there's an image, store it as a shared barcode image
    if (imageUrl) {
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

    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get shared image for a barcode
router.get('/barcode/:barcode/image', authenticateToken, async (req, res) => {
  try {
    const { barcode } = req.params;

    const { data: barcodeImage, error } = await supabase
      .from('barcode_images')
      .select('image_url')
      .eq('barcode', barcode)
      .single();

    if (error || !barcodeImage) {
      return res.status(404).json({ error: 'No image found for this barcode' });
    }

    res.json({ imageUrl: barcodeImage.image_url });
  } catch (error) {
    console.error('Error fetching barcode image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Delete a product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get product to verify ownership
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

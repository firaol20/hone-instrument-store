import express from 'express';
import Settings from '../models/Settings';

const router = express.Router();

router.get('/maintenance', async (req, res) => {
  try {
    const maintenance = await Settings.findOne({ key: 'maintenanceMode' });
    res.json({
      success: true,
      data: {
        isMaintenanceMode: maintenance?.value || false,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: { isMaintenanceMode: false },
    });
  }
});

router.get('/promotions', require('../controllers/promotionController').getActivePromotions);

export default router;

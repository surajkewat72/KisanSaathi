const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const generatePlan = require('../controllers/generatePlan');

// Generate and save a new farm plan
router.post('/generate', generatePlan);

// Get all farm plans
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.farmPlan.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get a single farm plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await prisma.farmPlan.findUnique({
      where: { id: req.params.id }
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// Delete a farm plan
router.delete('/:id', async (req, res) => {
  try {
    await prisma.farmPlan.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;

const axios = require('axios');
const prisma = require('../prismaClient');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function generatePlan(req, res) {
  try {
    const planData = req.body;

    // Call FastAPI to generate the farm plan
    const response = await axios.post(`${FASTAPI_URL}/generate-farm-plan`, planData);
    const farmPlan = response.data;

    // Map FastAPI response to our database schema
    const savedPlan = await prisma.farmPlan.create({
      data: {
        farmerName: planData.farmerName || null,
        totalArea: planData.totalArea || planData.land_area,
        recommendations: farmPlan.farm_plan || [],  // Array of crop allocations
        allocation: {
          predicted_crop: farmPlan.predicted_crop,
          candidate_crops: farmPlan.candidate_crops,
          farm_plan: farmPlan.farm_plan
        },
        totalProfit: farmPlan.total_expected_profit || 0,
        sustainability: farmPlan.sustainability_score || 0,
        riskLevel: farmPlan.farm_plan?.[0]?.risk_level || 'Medium'
      }
    });

    res.json(savedPlan);
  } catch (error) {
    console.error('Error generating plan:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate farm plan',
      details: error.message 
    });
  }
}

module.exports = generatePlan;

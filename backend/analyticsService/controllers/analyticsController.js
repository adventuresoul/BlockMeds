const Prescription = require("../models/Pharmacist");

const getPrescriptionVolume = async (req, res) => {
    try {
      const daily = await Prescription.aggregate([
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$time" } } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);
  
      const weekly = await Prescription.aggregate([
        {
          $group: {
            _id: { week: { $isoWeek: "$time" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.week": 1 } }
      ]);
  
      const monthly = await Prescription.aggregate([
        {
          $group: {
            _id: { month: { $dateToString: { format: "%Y-%m", date: "$time" } } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.month": 1 } }
      ]);
  
      res.json({ daily, weekly, monthly });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getEmergencyAnalysis = async (req, res) => {
    try {
      const result = await Prescription.aggregate([
        { $group: { _id: "$emergency", count: { $sum: 1 } } }
      ]);
      res.json({ emergency: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getDrugDemand = async (req, res) => {
    try {
      const result = await Prescription.aggregate([
        { $group: { _id: "$drug", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      res.json({ drug_comparison: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getFulfillmentStatus = async (req, res) => {
    try {
      const total = await Prescription.countDocuments();
      const fulfilled = await PrescriptionModel.countDocuments({ fulfilled: true });
      const non_fulfilled = total - fulfilled;
  
      res.json({ fulfilled, non_fulfilled, total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getFlaggedPrescriptions = async (req, res) => {
    try {
      const flaggedCount = await Prescription.countDocuments({ flagged: true });
      const nonFlaggedCount = await Prescription.countDocuments({ flagged: false });
  
      res.json({ flagged: flaggedCount, non_flagged: nonFlaggedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getDiagnosisComparison = async (req, res) => {
    try {
      const result = await Prescription.aggregate([
        { $group: { _id: "$diagnosisId", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      res.json({ diagnosis_comparison: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getPrescriptionVolume, getEmergencyAnalysis, getDrugDemand, getFlaggedPrescriptions, getDiagnosisComparison
};
  
  
  
  
  

  

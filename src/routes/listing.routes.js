const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// POST /api/listings - Create listing
router.post(
  '/',
  protect,
  authorize('business'),
  listingController.createListing
);

// GET /api/listings - Get all listings
router.get(
  '/',
  listingController.getListings
);

// GET /api/listings/my - Get current user's listings
router.get(
  '/my',
  protect,
  authorize('business'),
  listingController.getUserListings
);

// GET /api/listings/:id - Get listing by ID
router.get(
  '/:id',
  listingController.getListingById
);

module.exports = router;
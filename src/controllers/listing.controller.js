const Listing = require('../models/listing.model');

class ListingController {
  createListing = async (req, res) => {
    try {
      const { description, location, photoUrls } = req.body;

      // Validation
      if (!description) {
        return res.status(400).json({
          success: false,
          message: 'Description is required',
        });
      }

      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: 'Location with lat and lng is required',
        });
      }

      if (!Array.isArray(photoUrls)) {
        return res.status(400).json({
          success: false,
          message: 'photoUrls must be an array',
        });
      }

      // Create listing
      const listing = await Listing.create({
        description,
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        photoUrls: photoUrls || [],
        userId: req.user._id,
      });

      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        listing,
      });

    } catch (error) {
      console.error('Create listing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating listing',
        error: error.message,
      });
    }
  };

  getListings = async (req, res) => {
    try {
      const listings = await Listing.find()
        .populate('userId', 'fullName businessName email role')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        listings,
      });

    } catch (error) {
      console.error('Get listings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching listings',
        error: error.message,
      });
    }
  };

  getListingById = async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate('userId', 'fullName businessName email role');

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found',
        });
      }

      return res.status(200).json({
        success: true,
        listing,
      });

    } catch (error) {
      console.error('Get listing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching listing',
        error: error.message,
      });
    }
  };

  getUserListings = async (req, res) => {
    try {
      const listings = await Listing.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        listings,
      });

    } catch (error) {
      console.error('Get user listings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user listings',
        error: error.message,
      });
    }
  };
}

module.exports = new ListingController();
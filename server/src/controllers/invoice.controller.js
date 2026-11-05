const Invoice = require('../models/Invoice');
const Package = require('../models/Package');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SystemSettings = require('../models/SystemSettings');
const { v4: uuidv4 } = require('uuid');

// Helper to get or create settings
const getSettings = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

// @desc    Get current user's invoices
// @route   GET /api/invoices/my-invoices
exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('package', 'title thumbnail')
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('package', 'title description');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // Only owner or admin can view
    if (invoice.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access.' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Purchase/Enroll in a package (Generates Invoice & Distributes Commissions)
// @route   POST /api/invoices/purchase
exports.purchasePackage = async (req, res) => {
  try {
    const { packageId, paymentMethod = 'Online', billingDetails } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });

    // Check if already enrolled
    if (user.enrolledPackages.some((p) => p.toString() === packageId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this package.' });
    }

    const settings = await getSettings();

    // Financial Calculation with GST
    const finalPrice = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
    const taxRate = settings.taxRatePercent || 18;
    // Price inclusive of GST formula: Taxable = Total / (1 + Rate/100)
    const taxableAmount = Math.round((finalPrice / (1 + taxRate / 100)) * 100) / 100;
    const taxAmount = Math.round((finalPrice - taxableAmount) * 100) / 100;
    const halfTax = Math.round((taxAmount / 2) * 100) / 100;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `${settings.invoicePrefix || 'INV-EDP'}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      user: userId,
      package: pkg._id,
      packageName: pkg.title,
      basePrice: pkg.price,
      discountAmount: pkg.price - finalPrice > 0 ? pkg.price - finalPrice : 0,
      taxableAmount,
      taxRate,
      taxAmount,
      cgst: halfTax,
      sgst: halfTax,
      totalAmount: finalPrice,
      paymentMethod,
      paymentRef: `PAY-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
      status: 'paid',
      billingDetails: {
        name: billingDetails?.name || user.name,
        email: billingDetails?.email || user.email,
        phone: billingDetails?.phone || user.phone || '',
        address: billingDetails?.address || 'India',
        state: billingDetails?.state || 'Delhi',
      },
      companyDetails: {
        legalName: settings.companyName,
        gstin: settings.companyGstin,
        address: settings.companyAddress,
        email: settings.companyEmail,
        phone: settings.companyPhone,
      },
    });

    // Enroll User
    user.enrolledPackages.push(pkg._id);
    await user.save();

    // Record purchase transaction
    await Transaction.create({
      user: userId,
      type: 'purchase',
      amount: -finalPrice,
      description: `Enrolled in ${pkg.title}`,
      reference: invoice.invoiceNumber,
      status: 'completed',
      package: pkg._id,
    });

    // Increment package enrolled count
    pkg.enrolledCount = (pkg.enrolledCount || 0) + 1;
    await pkg.save();

    // ================= DISTRIBUTE MULTI-LEVEL COMMISSIONS =================
    const level1Percent = pkg.commissionRules?.level1Percent ?? 30;
    const level2Percent = pkg.commissionRules?.level2Percent ?? 10;

    // Direct referrer (Level 1)
    if (user.referredBy) {
      const level1User = await User.findById(user.referredBy);
      if (level1User && !level1User.isBlocked) {
        const l1Commission = Math.round((finalPrice * level1Percent) / 100);
        if (l1Commission > 0) {
          level1User.walletBalance += l1Commission;
          level1User.totalEarnings += l1Commission;
          await level1User.save();

          await Transaction.create({
            user: level1User._id,
            type: 'commission',
            amount: l1Commission,
            description: `Level 1 Commission from ${user.name} (${pkg.title})`,
            reference: invoice.invoiceNumber,
            fromUser: user._id,
            level: 1,
            package: pkg._id,
            status: 'completed',
            balanceAfter: level1User.walletBalance,
          });
        }

        // Indirect referrer (Level 2)
        if (level1User.referredBy) {
          const level2User = await User.findById(level1User.referredBy);
          if (level2User && !level2User.isBlocked) {
            const l2Commission = Math.round((finalPrice * level2Percent) / 100);
            if (l2Commission > 0) {
              level2User.walletBalance += l2Commission;
              level2User.totalEarnings += l2Commission;
              await level2User.save();

              await Transaction.create({
                user: level2User._id,
                type: 'commission',
                amount: l2Commission,
                description: `Level 2 Commission from ${user.name} via ${level1User.name}`,
                reference: invoice.invoiceNumber,
                fromUser: user._id,
                level: 2,
                package: pkg._id,
                status: 'completed',
                balanceAfter: level2User.walletBalance,
              });
            }
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully! Invoice generated and commissions distributed.',
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN INVOICE & GST CONTROLLERS ====================

// @desc    Get all invoices (Admin)
// @route   GET /api/invoices/admin/all
exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } },
        { 'billingDetails.name': { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('user', 'name email phone')
      .populate('package', 'title price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({ success: true, invoices, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get GST & Invoice settings
// @route   GET /api/invoices/admin/settings
exports.getGstSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update GST & Invoice settings (Admin)
// @route   PUT /api/invoices/admin/settings
exports.updateGstSettings = async (req, res) => {
  try {
    const {
      companyName,
      companyGstin,
      companyAddress,
      companyEmail,
      companyPhone,
      taxRatePercent,
      invoicePrefix,
      invoiceNotes,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (companyName !== undefined) settings.companyName = companyName;
    if (companyGstin !== undefined) settings.companyGstin = companyGstin;
    if (companyAddress !== undefined) settings.companyAddress = companyAddress;
    if (companyEmail !== undefined) settings.companyEmail = companyEmail;
    if (companyPhone !== undefined) settings.companyPhone = companyPhone;
    if (taxRatePercent !== undefined) settings.taxRatePercent = Number(taxRatePercent);
    if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix;
    if (invoiceNotes !== undefined) settings.invoiceNotes = invoiceNotes;

    await settings.save();

    res.json({ success: true, message: 'GST & Invoice settings updated successfully.', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

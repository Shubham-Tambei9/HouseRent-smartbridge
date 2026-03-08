const Booking = require('../models/Booking');
const Property = require('../models/Property');
const mongoose = require('mongoose');

// Helper to get start and end dates based on filter (weekly, monthly, yearly)
const getDateFilter = (filter) => {
    const now = new Date();
    let start = new Date();
    if (filter === 'weekly') {
        start.setDate(now.getDate() - 7);
    } else if (filter === 'yearly') {
        start.setFullYear(now.getFullYear() - 1);
    } else {
        // default monthly
        start.setMonth(now.getMonth() - 1);
    }
    return { start, now };
};

exports.getDashboardData = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.id);
        const filter = req.query.filter || 'monthly';
        const { start, now } = getDateFilter(filter);

        // 1. Fetch Owner's Properties
        const properties = await Property.find({ owner: ownerId }).select('_id title type price');
        const propertyIds = properties.map(p => p._id);

        // 2. Fetch Bookings for these properties
        const bookings = await Booking.find({ property: { $in: propertyIds } }).populate('property', 'title');

        // --- Top Summary Metrics ---
        const totalProperties = properties.length;
        const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

        // Earnings (completed/confirmed)
        const totalEarnings = bookings
            .filter(b => ['confirmed', 'completed'].includes(b.status))
            .reduce((sum, b) => sum + b.totalAmount, 0);

        // Earnings this period (based on filter)
        const periodicEarnings = bookings
            .filter(b => ['confirmed', 'completed'].includes(b.status) && new Date(b.createdAt) >= start)
            .reduce((sum, b) => sum + b.totalAmount, 0);

        // Pending payments
        const pendingPayments = bookings
            .filter(b => b.status === 'pending')
            .reduce((sum, b) => sum + b.totalAmount, 0);

        const avgRating = 4.8; // Mocked - Requires Review Model implementation later

        // --- Revenue Analytics (Charts) ---
        // Create time-series data based on the filter
        // For simplicity in this demo, we'll group by month if yearly, else by day
        const isYearly = filter === 'yearly';

        const earningsTrendMap = {};
        const bookingsOverviewMap = {};

        bookings.forEach(b => {
            const d = new Date(b.createdAt);
            if (d < start) return; // Skip old bookings for the charts

            let key;
            if (isYearly) {
                key = d.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"
            } else {
                key = d.toLocaleDateString('default', { month: 'short', day: 'numeric' }); // "Jan 15"
            }

            // Initialize keys
            if (!earningsTrendMap[key]) earningsTrendMap[key] = 0;
            if (!bookingsOverviewMap[key]) bookingsOverviewMap[key] = 0;

            // Accumulate
            if (['confirmed', 'completed'].includes(b.status)) {
                earningsTrendMap[key] += b.totalAmount;
            }
            bookingsOverviewMap[key] += 1;
        });

        const earningsTrend = Object.keys(earningsTrendMap).map(name => ({
            name,
            amount: earningsTrendMap[name]
        }));

        const bookingsOverview = Object.keys(bookingsOverviewMap).map(name => ({
            name,
            bookings: bookingsOverviewMap[name]
        }));

        // Payment Status Pie Chart
        const paymentStatusMap = { Paid: 0, Pending: 0, Cancelled: 0 };
        bookings.forEach(b => {
            if (['confirmed', 'completed'].includes(b.status)) paymentStatusMap['Paid'] += 1;
            else if (b.status === 'pending') paymentStatusMap['Pending'] += 1;
            else if (b.status === 'cancelled') paymentStatusMap['Cancelled'] += 1;
        });

        const paymentStatus = [
            { name: 'Paid', value: paymentStatusMap['Paid'] },
            { name: 'Pending', value: paymentStatusMap['Pending'] },
            { name: 'Cancelled', value: paymentStatusMap['Cancelled'] }
        ];

        // --- Property Performance ---
        const performanceMap = {};
        properties.forEach(p => {
            performanceMap[p._id] = {
                title: p.title,
                bookings: 0,
                earnings: 0,
                views: Math.floor(Math.random() * 500) + 50, // Mocked views
                occupancyRate: Math.floor(Math.random() * 40) + 40 // Mocked occupancy (40-80%)
            };
        });

        bookings.forEach(b => {
            if (performanceMap[b.property._id]) {
                performanceMap[b.property._id].bookings += 1;
                if (['confirmed', 'completed'].includes(b.status)) {
                    performanceMap[b.property._id].earnings += b.totalAmount;
                }
            }
        });

        const performanceArray = Object.values(performanceMap);
        performanceArray.sort((a, b) => b.bookings - a.bookings);

        const mostBooked = performanceArray[0];
        const leastPerforming = performanceArray[performanceArray.length - 1];

        // Sort by views
        const viewsSorted = [...performanceArray].sort((a, b) => b.views - a.views);
        const mostViewed = viewsSorted[0];


        res.json({
            summary: {
                totalProperties,
                activeBookings,
                totalEarnings,
                periodicEarnings,
                pendingPayments,
                avgRating
            },
            charts: {
                earningsTrend,
                bookingsOverview,
                paymentStatus
            },
            performance: {
                all: performanceArray.slice(0, 5), // Top 5 for the table
                mostBooked: mostBooked || null,
                leastPerforming: leastPerforming || null,
                mostViewed: mostViewed || null
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};

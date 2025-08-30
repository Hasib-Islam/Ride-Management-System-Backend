import { User } from '../user/user.model';
import { Ride } from '../ride/ride.model';
import { Payment } from '../payment/payment.model';

export const AdminService = {
  getDashboardStats: async () => {
    const totalUsers = await User.countDocuments();
    const totalRiders = await User.countDocuments({ role: 'rider' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      totalUsers,
      totalRiders,
      totalDrivers,
      totalRides,
      completedRides,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  },

  getRecentRides: async (limit = 10) => {
    const rides = await Ride.find()
      .populate('rider', 'name email')
      .populate('driver', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return rides;
  },

  getRevenueAnalytics: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalRevenue: { $sum: '$amount' },
          rideCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return revenueData;
  },
};

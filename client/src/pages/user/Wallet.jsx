import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Building2, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletService } from '../../services/walletService';
import useAuthStore from '../../store/authStore';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';

const Wallet = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState({ stats: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    paymentMethod: 'bank',
    bankDetails: { accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' },
    upiId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        walletService.getStats(),
        walletService.getPayoutHistory()
      ]);
      setData({ stats: statsRes.data.stats, history: historyRes.data.payouts });
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(payoutForm.amount);
    if (amt < 500) return toast.error('Minimum payout is ₹500');
    if (amt > (data.stats?.walletBalance || 0)) return toast.error('Insufficient balance');
    
    if (payoutForm.paymentMethod === 'bank') {
      const b = payoutForm.bankDetails;
      if (!b.accountHolder || !b.accountNumber || !b.ifscCode || !b.bankName) {
        return toast.error('Please fill all bank details');
      }
    } else {
      if (!payoutForm.upiId) return toast.error('Please enter UPI ID');
    }

    setIsSubmitting(true);
    try {
      await walletService.requestPayout(payoutForm);
      toast.success('Payout request submitted successfully!');
      setPayoutForm({ ...payoutForm, amount: '' }); // Reset amount
      fetchWalletData(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const hasPendingPayout = data.history.some(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet & Earnings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your balance and request payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="stat-card border-emerald-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <WalletIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-emerald-400 font-semibold">Available Balance</h2>
            </div>
            <p className="text-4xl font-bold text-white mb-2">₹{(data.stats?.walletBalance || 0).toLocaleString()}</p>
            <p className="text-sm text-slate-400">Total earned: ₹{(data.stats?.totalEarnings || 0).toLocaleString()}</p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white">Request Payout</h2>
            </CardHeader>
            <CardBody>
              {hasPendingPayout ? (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Pending Request Found</h3>
                  <p className="text-sm text-slate-400">You already have a pending payout request. Please wait for it to be processed before requesting another.</p>
                </div>
              ) : user?.kycStatus !== 'approved' ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">KYC Required</h3>
                  <p className="text-sm text-slate-400 mb-4">You must complete your KYC verification to request payouts.</p>
                </div>
              ) : (
                <form onSubmit={handlePayoutSubmit} className="space-y-4">
                  <Input
                    label="Amount (₹)"
                    type="number"
                    min="₹500"
                    max={data.stats?.walletBalance}
                    placeholder="Min. 500"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayoutForm({ ...payoutForm, paymentMethod: 'bank' })}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                          payoutForm.paymentMethod === 'bank' 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" /> Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutForm({ ...payoutForm, paymentMethod: 'upi' })}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                          payoutForm.paymentMethod === 'upi' 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <Banknote className="w-4 h-4" /> UPI
                      </button>
                    </div>
                  </div>

                  {payoutForm.paymentMethod === 'bank' ? (
                    <div className="space-y-3 pt-2">
                      <Input 
                        placeholder="Account Holder Name" 
                        value={payoutForm.bankDetails.accountHolder}
                        onChange={(e) => setPayoutForm({...payoutForm, bankDetails: {...payoutForm.bankDetails, accountHolder: e.target.value}})}
                      />
                      <Input 
                        placeholder="Account Number" 
                        type="password"
                        value={payoutForm.bankDetails.accountNumber}
                        onChange={(e) => setPayoutForm({...payoutForm, bankDetails: {...payoutForm.bankDetails, accountNumber: e.target.value}})}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="IFSC Code" 
                          value={payoutForm.bankDetails.ifscCode}
                          onChange={(e) => setPayoutForm({...payoutForm, bankDetails: {...payoutForm.bankDetails, ifscCode: e.target.value}})}
                        />
                        <Input 
                          placeholder="Bank Name" 
                          value={payoutForm.bankDetails.bankName}
                          onChange={(e) => setPayoutForm({...payoutForm, bankDetails: {...payoutForm.bankDetails, bankName: e.target.value}})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <Input 
                        placeholder="UPI ID (e.g. user@okicici)" 
                        value={payoutForm.upiId}
                        onChange={(e) => setPayoutForm({...payoutForm, upiId: e.target.value})}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                    Submit Request
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Payout History */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-bold text-white">Payout History</h2>
            </CardHeader>
            <div className="flex-1 overflow-x-auto">
              {data.history.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map(payout => (
                      <tr key={payout._id}>
                        <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                        <td className="font-semibold">₹{payout.amount}</td>
                        <td className="uppercase">{payout.paymentMethod}</td>
                        <td>
                          <Badge variant={
                            payout.status === 'pending' ? 'warning' :
                            payout.status === 'approved' || payout.status === 'paid' ? 'success' : 'danger'
                          }>
                            {payout.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <ArrowUpRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payout history yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

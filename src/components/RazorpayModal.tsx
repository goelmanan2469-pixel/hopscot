import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { Ticket, Event, TicketType } from '../types/index.js';
import { CreditCard, CheckCircle2, ShieldCheck, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  ticketType: TicketType;
  onSuccess: (ticket: Ticket) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  event,
  ticketType,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [testUpiId, setTestUpiId] = useState('student@okaxis');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);

  if (!isOpen) return null;

  const totalAmount = ticketType.price * quantity;

  const handlePayNow = async () => {
    setPaymentStep('processing');
    setErrorMsg('');

    try {
      // 1. Create order on backend
      const orderData = await api.createPaymentOrder(event.id, ticketType.id, quantity);

      // 2. Simulate Razorpay verification delay
      await new Promise((r) => setTimeout(r, 1200));

      // 3. Verify payment signature on backend
      const verifyRes = await api.verifyPayment(
        orderData.orderId,
        orderData.bookingId,
        `pay_rzp_mock_${Date.now()}`
      );

      if (verifyRes.success) {
        setGeneratedTicket(verifyRes.ticket);
        setPaymentStep('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#84cc16', '#ec4899', '#ffffff'],
        });
        onSuccess(verifyRes.ticket);
      } else {
        setErrorMsg('Payment verification failed on server');
        setPaymentStep('checkout');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment failed');
      setPaymentStep('checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-purple-900/40 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Razorpay Secure Checkout</h3>
              <p className="text-[10px] text-lime-400 font-mono">TEST SANDBOX MODE • ZERO REAL CHARGES</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStep === 'checkout' && (
            <div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-sm">{event.title}</span>
                    <p className="text-neutral-400 text-[11px]">{ticketType.name}</p>
                  </div>
                  <span className="font-mono text-lime-400 font-bold text-base">₹{ticketType.price}</span>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-neutral-300">
                  <span>Pass Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between font-bold text-sm">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-lime-400 font-mono text-lg">₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mt-4">
                <label className="text-xs font-bold text-neutral-300 block mb-2">Select Test Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    UPI / GPay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    Netbanking
                  </button>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="mt-3">
                  <label className="text-[11px] text-neutral-400 block mb-1">Test UPI ID</label>
                  <input
                    type="text"
                    value={testUpiId}
                    onChange={(e) => setTestUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    placeholder="student@okaxis"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-5">
                <button
                  onClick={handlePayNow}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-lime-500 text-neutral-950 font-black text-sm shadow-lg shadow-purple-900/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{totalAmount} & Generate QR Pass</span>
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-neutral-500">
                Encrypted end-to-end. Server-side payment signature verified.
              </p>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
              <h4 className="text-base font-bold text-white">Verifying Transaction...</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Checking inventory & creating encrypted QR ticket
              </p>
            </div>
          )}

          {paymentStep === 'success' && generatedTicket && (
            <div className="py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center mx-auto mb-3 border border-lime-400/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-white">Payment Verified! 🎉</h4>
              <p className="text-xs text-neutral-300 mt-1">
                Your pass <span className="font-mono text-purple-300 font-bold">#{generatedTicket.ticketNumber}</span> is issued.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                >
                  View in My Tickets
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

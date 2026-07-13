/**
 * useDeliveryTracking — order status state machine
 * Simulates real-time delivery progress. Pluggable via provider WebSocket later.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export const DELIVERY_STEPS = [
  { key: 'confirmed',        label: 'Order Confirmed',  icon: '✅', desc: 'Your order has been placed.' },
  { key: 'preparing',        label: 'Preparing',        icon: '🧪', desc: 'Pharmacist is picking your medicines.' },
  { key: 'picked_up',        label: 'Picked Up',        icon: '🛵', desc: 'Delivery partner has picked up the order.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '📦', desc: 'Your order is on the way!' },
  { key: 'delivered',        label: 'Delivered',        icon: '🎉', desc: 'Order delivered successfully.' },
];

const STEP_KEYS = DELIVERY_STEPS.map((s) => s.key);

export function useDeliveryTracking() {
  const [activeOrder, setActiveOrder] = useState(null);  // { id, medicine, pharmacy, timestamp }
  const [currentStep, setCurrentStep] = useState(null);
  const [stepTimestamps, setStepTimestamps] = useState({});
  const intervalRef = useRef(null);

  const startTracking = useCallback((orderData) => {
    const orderId = `ORD-${Date.now()}`;
    const now = new Date();
    setActiveOrder({ id: orderId, ...orderData, timestamp: now.toISOString() });
    setCurrentStep('confirmed');
    setStepTimestamps({ confirmed: now.toLocaleTimeString() });

    let stepIndex = 0;
    intervalRef.current = setInterval(() => {
      stepIndex++;
      if (stepIndex >= STEP_KEYS.length) {
        clearInterval(intervalRef.current);
        return;
      }
      const key = STEP_KEYS[stepIndex];
      setCurrentStep(key);
      setStepTimestamps((prev) => ({ ...prev, [key]: new Date().toLocaleTimeString() }));
    }, 4000); // advance step every 4s (demo)
  }, []);

  const cancelOrder = useCallback(() => {
    clearInterval(intervalRef.current);
    setActiveOrder(null);
    setCurrentStep(null);
    setStepTimestamps({});
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const currentStepIndex = STEP_KEYS.indexOf(currentStep);

  return {
    activeOrder,
    currentStep,
    currentStepIndex,
    stepTimestamps,
    startTracking,
    cancelOrder,
    isTracking: !!activeOrder,
  };
}

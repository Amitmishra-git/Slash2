import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const Cart = () => {
  const navigate = useNavigate();
  const { items: cart, removeFromCart, cachedExperiences, checkout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    scrollToTop();
  }, []);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const success = await checkout();
      if (success) {
        toast.success('Booking confirmed successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
            <CardDescription>Add some experiences to your cart to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                navigate('/');
                scrollToTop();
              }}
              className="w-full"
            >
              Browse Experiences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => {
              const experience = cachedExperiences[item.experienceId];
              if (!experience) return null;

              return (
                <Card key={item.experienceId}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={experience.imageUrl}
                        alt={experience.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{experience.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {experience.location}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>Date: {experience.date}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${experience.price * item.quantity}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.experienceId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => {
                    const experience = cachedExperiences[item.experienceId];
                    if (!experience) return null;

                    return (
                      <div key={item.experienceId} className="flex justify-between text-sm">
                        <span>{experience.title}</span>
                        <span>${experience.price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      $
                      {cart.reduce(
                        (total, item) => {
                          const experience = cachedExperiences[item.experienceId];
                          return total + (experience?.price || 0) * item.quantity;
                        },
                        0
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Bookings'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

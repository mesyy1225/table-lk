
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose }) => {
  const { state, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    remarks: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.contactNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const orderItems = state.items.map(item => 
      `📦 ${item.product.name}
💰 Unit Price: ${formatPrice(item.product.price)}
📊 Quantity: ${item.quantity}
💵 Subtotal: ${formatPrice(item.product.price * item.quantity)}
📏 Size: ${item.product.dimensions.width}" x ${item.product.dimensions.length}" x ${item.product.dimensions.height}"`
    ).join('\n\n');

    const message = `🛒 BULK ORDER REQUEST

📋 ORDER ITEMS:
${orderItems}

💵 TOTAL AMOUNT: ${formatPrice(state.totalPrice)}

👤 CUSTOMER DETAILS:
Name: ${formData.name}

📍 Address: ${formData.address}

📞 Contact: ${formData.contactNumber}

💬 Remarks: ${formData.remarks || 'None'}

---
Order placed via TableLK.com`;

    const whatsappNumber = "94768919013";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success('Order details sent to WhatsApp!');
    clearCart();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Checkout ({state.items.length} items)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-3">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatPrice(state.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Customer Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete delivery address"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="077 123 4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Any special instructions or requests..."
                rows={2}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            <Send className="h-4 w-4 mr-2" />
            Send Order via WhatsApp
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;

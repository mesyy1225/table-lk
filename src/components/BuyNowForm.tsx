
import React, { useState } from 'react';
import { Product } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Send } from 'lucide-react';
import { toast } from 'sonner';

interface BuyNowFormProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const BuyNowForm: React.FC<BuyNowFormProps> = ({ product, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    remarks: '',
    selectedColor: product.colors?.[0] || '',
    quantity: 1
  });

  const handleInputChange = (field: string, value: string | number) => {
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

    const totalPrice = product.price * formData.quantity;
    
    const message = `🛒 NEW ORDER REQUEST
    
📦 Product: ${product.name}

💰 Unit Price: ${formatPrice(product.price)}

📊 Quantity: ${formData.quantity}

💵 Total Price: ${formatPrice(totalPrice)}

🎨 Selected Color: ${formData.selectedColor}

📏 Size: ${product.dimensions.width}" x ${product.dimensions.length}" x ${product.dimensions.height}"

👤 CUSTOMER DETAILS:
Name: ${formData.name}

📍 Address: ${formData.address}

📞 Contact: ${formData.contactNumber}

💬 Remarks: ${formData.remarks || 'None'}

---
Order placed via TableLK.com`;

    const whatsappNumber = "94704613204";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success('Order details sent to WhatsApp!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Buy Now - {product.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="text-sm space-y-1">
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Price:</strong> {formatPrice(product.price)}</p>
              <p><strong>Size:</strong> {product.dimensions.width}" x {product.dimensions.length}" x {product.dimensions.height}"</p>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <RadioGroup 
                value={formData.selectedColor} 
                onValueChange={(value) => handleInputChange('selectedColor', value)}
                className="flex flex-wrap gap-4"
              >
                {product.colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <RadioGroupItem value={color} id={`color-${color}`} />
                    <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Select value={formData.quantity.toString()} onValueChange={(value) => handleInputChange('quantity', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Details */}
          <div className="space-y-4 border-t pt-4">
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

          {/* Total Price */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price * formData.quantity)}
              </span>
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

export default BuyNowForm;

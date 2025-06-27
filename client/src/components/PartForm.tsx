import React, { useState, useEffect } from 'react';
import { Part, Supplier } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';

interface PartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part?: Part | null;
  suppliers: Supplier[];
  onSubmit: (part: Omit<Part, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading?: boolean;
}

const PartForm: React.FC<PartFormProps> = ({
  open,
  onOpenChange,
  part,
  suppliers,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    sku: '',
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    if (part) {
      setFormData({
        supplier_id: part.supplier_id.toString(),
        sku: part.sku || '',
        name: part.name || '',
        description: part.description || '',
        price: part.price ? part.price.toString() : ''
      });
    } else {
      setFormData({
        supplier_id: '',
        sku: '',
        name: '',
        description: '',
        price: ''
      });
    }
  }, [part, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku.trim() || !formData.name.trim() || !formData.supplier_id) return;

    try {
      await onSubmit({
        supplier_id: parseInt(formData.supplier_id),
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {part ? 'Edit Part' : 'Add New Part'}
            </DialogTitle>
            <DialogDescription>
              {part ? 'Update part information' : 'Add a new part to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select
                id="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange('supplier_id')}
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={handleChange('sku')}
                placeholder="e.g., ABC-123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Enter part name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange('price')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Part description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.sku.trim() || !formData.name.trim() || !formData.supplier_id || loading}
            >
              {loading ? 'Saving...' : part ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartForm;
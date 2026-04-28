'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { customersAPI, ordersAPI, authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { LogOut, User, Package, MapPin, Settings, ArrowRight, Save, X } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker').then(mod => mod.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Map...</div>
});

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    street: '',
    city: 'Addis Ababa',
    state: 'AA',
    zip: '',
    isDefault: false,
    coordinates: null as { lat: number, lng: number } | null
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customerRes, ordersRes] = await Promise.all([
        customersAPI.getProfile(),
        ordersAPI.getCustomerOrders(), // Fetching real order history
      ]);
      setCustomer(customerRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Session expired. Please log in again.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    try {
      await customersAPI.updateProfile({ phone: phoneInput });
      setCustomer({ ...customer, phone: phoneInput });
      setIsEditingPhone(false);
      toast.success('Phone number updated');
    } catch (error) {
      toast.error('Failed to update phone');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await customersAPI.addAddress(addressForm);
      setCustomer({
        ...customer,
        addresses: [...(customer.addresses || []), res.data.data]
      });
      setIsAddingAddress(false);
      setAddressForm({
        type: 'Home',
        street: '',
        city: 'Addis Ababa',
        state: 'AA',
        zip: '',
        isDefault: false,
        coordinates: null
      });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear local storage tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      // Manually reset the auth store state to trigger UI updates in the Header.
      // This bypasses the need for a specific 'logout' action in the store.
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false
      });

      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Profile</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">{customer?.name}<span className="text-orange-600">.</span></h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{customer?.userId?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              Sign Out
            </button>
          </div>

          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-auto p-0 gap-8">
              <TabsTrigger value="orders" className="data-[state=active]:border-orange-600 data-[state=active]:text-slate-950 border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Order History
              </TabsTrigger>
              <TabsTrigger value="addresses" className="data-[state=active]:border-orange-600 data-[state=active]:text-slate-950 border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Shipping
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:border-orange-600 data-[state=active]:text-slate-950 border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Security
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Reference</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Amount</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order._id} className="hover:bg-slate-50/50 border-slate-50">
                            <TableCell className="font-bold text-xs py-5">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</TableCell>
                            <TableCell className="text-[11px] text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center font-black text-xs">ETB {order.total?.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`rounded-lg text-[9px] font-black uppercase px-2 py-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:text-orange-600">
                                View <ArrowRight className="w-3 h-3 ml-2" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20">
                            <Package className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Orders Found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!isAddingAddress ? (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center hover:border-orange-600 hover:bg-orange-50/30 transition-all group h-full min-h-[200px]"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-orange-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add New Address</span>
                  </button>
                ) : (
                  <Card className="border-none shadow-xl rounded-[2rem] md:col-span-2 p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-600">New Shipping Location</h3>
                      <button onClick={() => setIsAddingAddress(false)} className="text-slate-300 hover:text-slate-900"><X className="w-4 h-4" /></button>
                    </div>

                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Label</label>
                            <select
                              value={addressForm.type}
                              onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                              className="w-full h-9 bg-slate-50 border-none rounded-lg px-3 text-xs font-bold uppercase outline-none focus:ring-1 ring-orange-500"
                            >
                              <option>Home</option>
                              <option>Office</option>
                              <option>Studio</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">City</label>
                            <Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="h-9 border-none bg-slate-50 text-xs font-bold" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Street Address</label>
                          <Input value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="e.g. Bole, Churchill Rd" className="h-9 border-none bg-slate-50 text-xs font-bold" />
                        </div>
                        <Button type="submit" className="w-full bg-slate-950 hover:bg-orange-600 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">Save Address</Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Select from Map</label>
                        <div className="h-40 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                          <LocationPicker onLocationSelect={(coords) => setAddressForm({ ...addressForm, coordinates: coords })} />
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase text-center mt-2 leading-none">Use pin 📍 to pin exact location</p>
                      </div>
                    </form>
                  </Card>
                )}

                {customer.addresses?.map((address: any, idx: number) => (
                  <Card key={idx} className="border-none shadow-sm rounded-[2rem] p-6 relative overflow-hidden group">
                    {address.isDefault && (
                      <div className="absolute top-0 right-0 bg-orange-600 text-white text-[8px] font-black uppercase px-4 py-1 rounded-bl-xl">
                        Primary
                      </div>
                    )}
                    <div className="mb-4">
                      <MapPin className="w-5 h-5 text-slate-950 mb-4" />
                      <h3 className="font-black uppercase text-xs tracking-tight mb-2">{address.type}</h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {address.street}<br />
                        {address.city}, {address.state} {address.zip}
                      </p>
                    </div>
                    <div className="flex gap-4 border-t border-slate-50 pt-4 mt-4">
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950">Edit</button>
                      <button className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600">Delete</button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-none shadow-sm rounded-[2rem] max-w-2xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Full Name</label>
                      <div className="flex justify-between items-center group">
                        <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Contact Number</label>
                      {isEditingPhone ? (
                        <div className="flex gap-2">
                          <Input
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="h-8 text-xs font-bold bg-slate-50 border-none"
                            placeholder="Enter phone number (e.g. +251...)"
                          />
                          <Button onClick={handleUpdatePhone} size="sm" className="h-8 bg-orange-600 hover:bg-orange-700 px-2"><Save className="w-3 h-3" /></Button>
                          <Button onClick={() => setIsEditingPhone(false)} variant="ghost" size="sm" className="h-8 px-2"><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <p className={`text-sm font-bold ${customer?.phone ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                            {customer?.phone || 'No contact number added'}
                          </p>
                          <button onClick={() => { setIsEditingPhone(true); setPhoneInput(customer?.phone || ''); }} className="text-[9px] font-black uppercase text-orange-600 transition-opacity">
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Email Address</label>
                      <p className="text-sm font-bold text-slate-900">{customer.userId?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
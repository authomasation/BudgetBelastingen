"use client";
export const dynamic = 'force-dynamic'
import { useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Button from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Head from "next/head";
import { on } from "events";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    naam: '',
    onderwerp: '',
    contact_type: '',
    bericht: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const supabase = createClientComponentClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateVerificationToken = () => {
    return crypto.randomUUID();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.bericht.trim()) {
      setMessage('Email en bericht zijn verplicht');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Voer een geldig emailadres in');
      setMessageType('error');
      return;
    }

    // Rate limiting check - max 3 submissions per email per day
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSubmissions } = await supabase
      .from('contact_berichten_temp')
      .select('id')
      .eq('email', formData.email.toLowerCase())
      .gte('created_at', today + 'T00:00:00.000Z')
      .lte('created_at', today + 'T23:59:59.999Z');

    if (existingSubmissions && existingSubmissions.length >= 3) {
      setMessage('Je hebt vandaag al het maximum aantal berichten verzonden. Probeer het morgen opnieuw.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      const verificationToken = generateVerificationToken();

      // Store in temporary table with verification token
      const { error: tempError } = await supabase
        .from('contact_berichten_temp')
        .insert({
          email: formData.email.toLowerCase(),
          naam: formData.naam,
          contact_type: formData.contact_type,
          bericht: formData.bericht,
          verification_token: verificationToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

      if (tempError) {
        throw tempError;
      }

      // Send verification email (you'll need to implement this endpoint)
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          naam: formData.naam,
          verificationToken
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      setMessage('Er is een verificatie-email verzonden naar je emailadres. Klik op de link in de email om je bericht te bevestigen.');
      setMessageType('success');

      // Reset form
      setFormData({
        email: '',
        naam: '',
        onderwerp: '',
        contact_type: '',
        bericht: ''
      });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      setMessage('Er is een fout opgetreden. Probeer het later opnieuw.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-8 sm:p-20">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-black dark:text-white text-2xl font-bold text-center mb-6">
            Neem contact op
          </h1>

          {message && (
            <div className={`mb-4 p-3 rounded ${messageType === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="jouw@email.nl"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Naam (optioneel) */}
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input
                type="text"
                name="naam"
                value={formData.naam}
                onChange={handleInputChange}
                placeholder="naam"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Onderwerp</label>
              <input
                type="text"
                name="onderwerp"
                value={formData.onderwerp}
                onChange={handleInputChange}
                placeholder="Onderwerp"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Type contact */}
            <div>
              <label className="block text-sm font-medium mb-1">Type contact *</label>
              <select
                name="contact_type"
                value={formData.contact_type}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="Vraag">Vraag</option>
                <option value="Opmerking">Opmerking</option>
                <option value="Feedback">Feedback</option>
                <option value="Bug report">Bug report</option>
                <option value="Feature request">Feature request</option>
              </select>
            </div>

            {/* Bericht */}
            <div>
              <label className="block text-sm font-medium mb-1">Bericht *</label>
              <textarea
                name="bericht"
                value={formData.bericht}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Typ hier je bericht..."
                maxLength={2000}
                className="w-full border px-3 py-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <div className="text-sm text-gray-500 text-right">
                {formData.bericht.length}/2000
              </div>
            </div>

            {/* Verstuurknop */}
            <Button
              variant="primary"
            >
              {isLoading ? 'Bezig met verzenden...' : 'Verstuur'}
            </Button>
            
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
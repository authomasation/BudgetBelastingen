"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

interface Invoice {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  vat_amount?: number;
  created_at: string;
}

export default function ExcelExportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Get current date for default values
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  useEffect(() => {
    if (isOpen) {
      fetchInvoiceCount();
    }
  }, [isOpen, dateRange, startDate, endDate]);

  const fetchInvoiceCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      const dateFilter = getDateFilter();
      if (dateFilter.start && dateFilter.end) {
        query = query
          .gte('date', dateFilter.start)
          .lte('date', dateFilter.end);
      }

      const { count } = await query;
      setTotalInvoices(count || 0);
    } catch (error) {
      console.error('Error fetching invoice count:', error);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        };
      
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0]
        };
      
      case 'thisQuarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        return {
          start: quarterStart.toISOString().split('T')[0],
          end: quarterEnd.toISOString().split('T')[0]
        };
      
      case 'thisYear':
        return {
          start: `${now.getFullYear()}-01-01`,
          end: `${now.getFullYear()}-12-31`
        };
      
      case 'lastYear':
        return {
          start: `${now.getFullYear() - 1}-01-01`,
          end: `${now.getFullYear() - 1}-12-31`
        };
      
      case 'custom':
        return {
          start: startDate,
          end: endDate
        };
      
      default:
        return { start: null, end: null };
    }
  };

  const handleExport = async () => {
    if (dateRange === 'custom' && (!startDate || !endDate)) {
      alert('Selecteer een start- en einddatum voor custom export');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Je moet ingelogd zijn om te exporteren');
        return;
      }

      let query = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      const dateFilter = getDateFilter();
      if (dateFilter.start && dateFilter.end) {
        query = query
          .gte('date', dateFilter.start)
          .lte('date', dateFilter.end);
      }

      const { data: invoices, error } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        alert('Er is een fout opgetreden bij het ophalen van de gegevens');
        return;
      }

      if (!invoices || invoices.length === 0) {
        alert('Geen facturen gevonden voor de geselecteerde periode');
        return;
      }

      // Prepare data for Excel
      const excelData = invoices.map(invoice => ({
        'Datum': new Date(invoice.invoice_date).toLocaleDateString('nl-NL'),
        'Beschrijving': invoice.description,
        'Bedrag (€)': invoice.amount,
        'BTW (€)': invoice.vat_amount || 0,
        'Totaal (€)': invoice.amount + (invoice.vat_amount || 0),
        'Categorie': invoice.category,
        'Toegevoegd op': new Date(invoice.created_at).toLocaleDateString('nl-NL')
      }));

      // Calculate totals
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalVAT = invoices.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0);

      // Add summary row
      excelData.push({
        'Datum': '',
        'Beschrijving': 'TOTAAL',
        'Bedrag (€)': totalAmount,
        'BTW (€)': totalVAT,
        'Totaal (€)': totalAmount + totalVAT,
        'Categorie': '',
        'Toegevoegd op': ''
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Style the header row
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Auto-width columns
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            if (cellLength > maxWidth) maxWidth = cellLength;
          }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
      }
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Facturen');

      // Generate filename with date range
      const { start, end } = getDateFilter();
      let filename = 'facturen_export';
      if (start && end) {
        filename += `_${start}_tot_${end}`;
      }
      filename += '.xlsx';

      // Download file
      XLSX.writeFile(wb, filename);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Er is een fout opgetreden bij het exporteren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    
    // Set default dates for custom range
    if (value === 'custom') {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-12 rounded-full px-5 py-2 font-medium text-sm sm:text-base transition-colors flex items-center gap-2 border border-gray-300 hover:bg-gray-100 hover:text-[#333]"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Exporteer naar Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Exporteer naar Excel
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Periode selecteren
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Alle facturen</option>
                  <option value="thisWeek">Deze week</option>
                  <option value="thisMonth">Deze maand</option>
                  <option value="thisQuarter">Dit kwartaal</option>
                  <option value="thisYear">Dit jaar</option>
                  <option value="lastYear">Vorig jaar</option>
                  <option value="custom">Aangepaste periode</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Van datum
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Tot datum
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{totalInvoices}</strong> facturen gevonden voor de geselecteerde periode
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                disabled={isLoading}
              >
                Annuleren
              </button>
              <button
                onClick={handleExport}
                disabled={isLoading || totalInvoices === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporteren...
                  </>
                ) : (
                  'Download Excel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
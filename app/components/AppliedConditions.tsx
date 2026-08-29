'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chip } from "@/components/ui/chip";
// Remove unused import
// import { useAppSelector } from '@/lib/store/store';

interface AppliedConditionsProps {
  onConditionRemove?: (conditionType: string, value: string) => void;
}

const AppliedConditions: React.FC<AppliedConditionsProps> = () => {
  const [appliedConditions, setAppliedConditions] = useState<Array<{ label: string; value: string; type: string }>>([]);
  const [searchHistory, setSearchHistory] = useState<unknown[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const getOperatorText = (op: string) => {
    const map: Record<string, string> = {
      '1': 'Equal to',
      '2': 'Not Equal to',
      '3': 'Greater than',
      '4': 'Less than',
      '5': 'Odd',
      '6': 'Even',
    };
    return map[op] || op;
  };

  const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  };

  const loadConditionsFromCookie = useCallback(() => {
    try {
      const cookie = getCookie('searchData');
      console.log('AppliedConditions: Loading from cookies:', cookie ? 'Data found' : 'No data');
      
      if (!cookie) {
        console.log('AppliedConditions: No searchData in cookies');
        setAppliedConditions([]);
        return;
      }

      const data = JSON.parse(cookie);
      const currentSearch = data.currentSearch ?? {};
      console.log('AppliedConditions: Current search data:', currentSearch);
      
      const conditions: Array<{ label: string; value: string; type: string }> = [];

      if (currentSearch.numerologyValue) {
        conditions.push({ label: 'Numerology', value: currentSearch.numerologyValue, type: 'numerology' });
      }

      if (currentSearch.rangeStart && currentSearch.rangeEnd) {
        conditions.push({ label: 'Range', value: `${currentSearch.rangeStart} - ${currentSearch.rangeEnd}`, type: 'range' });
      }

      // Check for state - try both selectedStateObj.Code and selectedState
      if (currentSearch.selectedStateObj?.Code) {
        conditions.push({ label: 'State', value: currentSearch.selectedStateObj.Code, type: 'state' });
      } else if (currentSearch.selectedState) {
        conditions.push({ label: 'State', value: currentSearch.selectedState, type: 'state' });
      }

      if (currentSearch.rto) {
        conditions.push({ label: 'RTO', value: currentSearch.rto, type: 'rto' });
      }

      if (currentSearch.series) {
        conditions.push({ label: 'Series', value: currentSearch.series, type: 'series' });
      }

      const digits = [
        { key: 'digit1Conditions', label: 'Digit 1' },
        { key: 'digit2Conditions', label: 'Digit 2' },
        { key: 'digit3Conditions', label: 'Digit 3' },
        { key: 'digit4Conditions', label: 'Digit 4' },
      ];

      digits.forEach(({ key, label }) => {
        const digitArr = currentSearch[key] ?? [];
        digitArr.forEach((cond: unknown, index: number) => {
          const condObj = cond as { operator: string; value: string; error?: string };
          
          // Only add condition if it has valid operator and no error
          // For Even Numbers (6) and Odd Numbers (5), value can be empty
          if (condObj.operator && !condObj.error) {
            const operatorText = getOperatorText(condObj.operator);
            const isEvenOddOperator = ['5', '6'].includes(condObj.operator);
            
            // For even/odd operators, don't include the value in display
            const displayValue = isEvenOddOperator ? operatorText : `${operatorText} ${condObj.value}`.trim();
            
            conditions.push({
              label,
              value: displayValue,
              type: `${label.toLowerCase().replace(' ', '')}_${index}`
            });
          }
        });
      });

      console.log('AppliedConditions: Loaded conditions:', conditions);
      setAppliedConditions(conditions);
      setSearchHistory(data.searchHistory ?? []);
    } catch (err) {
      console.error('AppliedConditions: Error loading conditions:', err);
      setAppliedConditions([]);
    }
  }, []);

  useEffect(() => {
    loadConditionsFromCookie();
    
    // Listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log('AppliedConditions: Custom storage event received, reloading conditions');
      loadConditionsFromCookie();
    };

    // Listen for focus events to refresh data when returning to the page
    const handleFocus = () => {
      console.log('AppliedConditions: Window focused, reloading conditions');
      loadConditionsFromCookie();
    };

    window.addEventListener('searchDataUpdated', handleCustomStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('searchDataUpdated', handleCustomStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadConditionsFromCookie]);

  // const handleRemoveCondition = (type: string, value: string) => {
  //   setAppliedConditions(prev => prev.filter(c => !(c.type === type && c.value === value)));
  //   onConditionRemove?.(type, value);
  // };

  const loadSearchFromHistory = (entry: unknown) => {
    const cookie = getCookie('searchData');
    if (!cookie) return;

    try {
      const data = JSON.parse(cookie);
      data.currentSearch = entry;
      
      // Save back to cookie
      const setCookie = (name: string, value: string, days: number = 7) => {
        if (typeof window === 'undefined') return;
        
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
      };
      
      setCookie('searchData', JSON.stringify(data), 7);
      loadConditionsFromCookie();
      setShowHistory(false);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <>
      <div className="space-y-4">
        {appliedConditions.length > 0 ? (
          <div>
            <div className="flex justify-between mb-2">
              {searchHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showHistory ? 'Hide History' : `Show History (${searchHistory.length})`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {appliedConditions.map((c, idx) => (
                <Chip
                  key={`${c.type}-${idx}`}
                  variant="ghost"
                  size="sm"
                  className="border-blue-800 font-bold"
                >
                  <span className="mr-1 text-gray-500">{c.label}:</span>
                  <span className="text-purple-700 font-bold">{c.value}</span>
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No conditions applied yet. Use the search filters above to apply conditions.</p>
          </div>
        )}

        {showHistory && searchHistory.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Search History:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchHistory.map((s, idx) => {
                const searchItem = s as {
                  searchDate?: string;
                  series?: string;
                  selectedStateObj?: { Code?: string };
                  rto?: string;
                  numerologyValue?: string;
                  searchResults?: unknown[];
                  NumerologyValue?: string;
                };
                return (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadSearchFromHistory(s)}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        Search #{searchHistory.length - idx}
                      </div>
                      <div className="text-xs text-gray-500">
                        {searchItem.searchDate && new Date(searchItem.searchDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {searchItem.NumerologyValue && <div>Search Query: {searchItem.NumerologyValue}</div>}
                      {searchItem.series && <div>Series: {searchItem.series}</div>}
                      {searchItem.selectedStateObj?.Code && <div>State: {searchItem.selectedStateObj.Code}</div>}
                      {searchItem.rto && <div>RTO: {searchItem.rto}</div>}
                      {searchItem.numerologyValue && <div>Numerology: {searchItem.numerologyValue}</div>}
                      {searchItem.searchResults && <div>Results: {searchItem.searchResults.length} numbers</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AppliedConditions;

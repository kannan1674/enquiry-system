'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/common/container';
import { Demo7Layout } from '../components/layouts/demo7/demo7-layout';
import { useAppSelector } from '@/lib/store/store';

export default function Home() {
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated);
  console.log('isAuthenticated:', isAuthenticated);
  const [series, setSeries] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const handleSeriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, max 2 chars
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2);
    setSeries(value);
  };

  return (
    <Demo7Layout>
      {isAuthenticated === true && (
        <div className="p-6 text-lg font-bold">meikannan</div>
      )}
      {isAuthenticated === false && (
        <Container>
          <div className="border-b border-gray-200 w-full mb-2" />
          <p className="text-base text-gray-500 mb-6">
            Find Vehicle Numerology Fancy Number
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* State */}
            <div className="flex flex-col gap-2">
              <Label>State</Label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-32 h-10">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">TN</SelectItem>
                    <SelectItem value="2">KL</SelectItem>
                    <SelectItem value="3">KA</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox id="numerology-state" />
                  <label htmlFor="numerology-state" className="text-xs">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>
            </div>
            {/* District */}
            <div className="flex flex-col gap-2">
              <Label>District</Label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <Input
                  className="w-24 h-10"
                  placeholder="District"
                  maxLength={2}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <div className="flex items-center gap-2">
                  <Checkbox id="numerology-district" />
                  <label htmlFor="numerology-district" className="text-xs">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>
            </div>
            {/* Series */}
            <div className="flex flex-col gap-2">
              <Label>Series</Label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <Input
                  value={series}
                  onChange={handleSeriesChange}
                  className="w-24 h-10"
                  placeholder="Series"
                  maxLength={2}
                  type="text"
                  inputMode="text"
                  pattern="[A-Za-z]{2}"
                />
                <div className="flex items-center gap-4">
                  <Checkbox id="numerology-series" />
                  <label htmlFor="numerology-series" className="text-xs">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>
            </div>
            {/* Digits */}
            <div className="flex flex-col md:flex-row md:justify-between mt-3 gap-y-4 md:gap-y-0 md:gap-x-8">
              <div>
                <Label>Digit 1</Label>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <Select>
                    <SelectTrigger className="w-52 h-10">
                      <SelectValue placeholder="Digit 1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Greater than</SelectItem>
                      <SelectItem value="2">Less than</SelectItem>
                      <SelectItem value="3">Equal to</SelectItem>
                      <SelectItem value="4">Not Equal to</SelectItem>
                      <SelectItem value="5">Even Numbers</SelectItem>
                      <SelectItem value="6">Odd Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center">
                  <Checkbox />
                  <label className="text-xs mx-2 ">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>

              <div>
                <Label>Digit 2</Label>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <Select>
                    <SelectTrigger className="w-52 h-10">
                      <SelectValue placeholder="Digit 2" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Greater than</SelectItem>
                      <SelectItem value="2">Less than</SelectItem>
                      <SelectItem value="3">Equal to</SelectItem>
                      <SelectItem value="4">Not Equal to</SelectItem>
                      <SelectItem value="5">Even Numbers</SelectItem>
                      <SelectItem value="6">Odd Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center">
                  <Checkbox />
                  <label className="text-xs mx-2 ">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>

              <div>
                <Label>Digit 3</Label>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <Select>
                    <SelectTrigger className="w-52 h-10">
                      <SelectValue placeholder="Digit 3" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Greater than</SelectItem>
                      <SelectItem value="2">Less than</SelectItem>
                      <SelectItem value="3">Equal to</SelectItem>
                      <SelectItem value="4">Not Equal to</SelectItem>
                      <SelectItem value="5">Even Numbers</SelectItem>
                      <SelectItem value="6">Odd Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center">
                  <Checkbox />
                  <label className="text-xs mx-2 ">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>

              <div>
                <Label>Digit 4</Label>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <Select>
                    <SelectTrigger className="w-52 h-10">
                      <SelectValue placeholder="Digit 4" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Greater than</SelectItem>
                      <SelectItem value="2">Less than</SelectItem>
                      <SelectItem value="3">Equal to</SelectItem>
                      <SelectItem value="4">Not Equal to</SelectItem>
                      <SelectItem value="5">Even Numbers</SelectItem>
                      <SelectItem value="6">Odd Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center">
                  <Checkbox />
                  <label className="text-xs mx-2 ">
                    Include for Numerology Calculation
                  </label>
                </div>
              </div>
            </div>
            {/* Final Value */}
            <div className="flex flex-col gap-2 mt-4">
              <Label>Final Value</Label>
              <Input className="w-32 h-10" placeholder="Value" type="text" inputMode="numeric" pattern="[0-9]*" />
            </div>
            <div className="flex items-center justify-center mt-6 col-span-full">
              <Button className="px-8 py-2" type="submit">Search</Button>
            </div>
          </div>
        </Container>
      )}
      {isAuthenticated === undefined && (
        <div className="p-6 text-lg text-gray-400">Loading...</div>
      )}
    </Demo7Layout>
  );
}

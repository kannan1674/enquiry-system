import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

interface BreadcrumbWithBackProps {
  title: string;
}

export function BreadcrumbWithBack({ title }: BreadcrumbWithBackProps) {
  return (
    <div className="flex items-center justify-between mb-0">
      <nav className="text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/Home" className="flex items-center text-gray-600 hover:text-blue-600">
              <Home size={18} />
            </Link>
          </li>
          <li>
            <span className=" text-gray-400">{'>'}</span>
          </li>
          <li className="text-gray-700 text-sm ">{title}</li>
        </ol>
      </nav>
    </div>
  );
} 
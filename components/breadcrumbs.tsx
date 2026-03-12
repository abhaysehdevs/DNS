
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
    items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-amber-500 transition-colors flex items-center">
                <Home size={14} />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight size={14} className="mx-2" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-amber-500 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-300 font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}

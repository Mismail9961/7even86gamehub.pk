import React from 'react';
import Link from 'next/link';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const SideBar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    
    // Base menu items for all sellers
    const baseMenuItems = [
        { name: 'Add Product', path: '/seller', icon: assets.add_icon },
        { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
        { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
    ];

    // Admin/Seller only items
    const adminMenuItems = [
        { name: 'All Users', path: '/seller/users', icon: assets.user_icon || assets.add_icon }, // Use user icon if available
        { name: 'SEO Settings', path: '/seller/seo', icon: assets.seo_icon || assets.add_icon }, // Use SEO icon if available
    ];

    // Combine menu items based on user role
    const menuItems = session?.user?.role === 'admin' || session?.user?.role === 'seller'
        ? [...baseMenuItems, ...adminMenuItems]
        : baseMenuItems;

    return (
        <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col'>
            {menuItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                    <Link href={item.path} key={item.name} passHref>
                        <div
                            className={
                                `flex items-center py-3 px-4 gap-3 transition-all duration-200 ${
                                    isActive
                                        ? "border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90"
                                        : "hover:bg-gray-100/90 border-white hover:border-r-2 hover:border-gray-300"
                                }`
                            }
                        >
                            <Image
                                src={item.icon}
                                alt={`${item.name.toLowerCase()}_icon`}
                                className="w-7 h-7 flex-shrink-0"
                            />
                            <p className='md:block hidden text-sm font-medium text-gray-700'>{item.name}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SideBar;
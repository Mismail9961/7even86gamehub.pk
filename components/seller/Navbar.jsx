import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'

const Navbar = () => {

  const { router } = useAppContext()

  return (
    <div className='flex items-center justify-between border-b 
      px-3 py-2  
      sm:px-4 md:px-8 md:py-3'
    >
      <Image
        onClick={() => router.push('/')}
        className='cursor-pointer
          w-20   /* iPhone 5s small */
          sm:w-24 
          md:w-28 
          lg:w-32'
        src={assets.mainlogo}
        alt="Logo"
      />

      <button
        className='bg-gray-700 text-white rounded-full
        text-[10px] px-3 py-1
        sm:text-xs sm:px-5 sm:py-2
        md:text-sm md:px-7 md:py-2'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar

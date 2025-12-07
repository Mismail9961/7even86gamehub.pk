import React from 'react'

const Loading = () => {
    return (
        <div className="flex justify-center bg-[#003049] items-center h-[100vh]">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-[#8a1a13] border-gray-200"></div>
        </div>
    )
}

export default Loading
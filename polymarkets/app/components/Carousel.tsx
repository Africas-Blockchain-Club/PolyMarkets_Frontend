"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { carouselImage } from "../config/carouselImage"



const Carousel = () => {
    const [CurrentIndex,setCurrentIndex] = useState(0)

    useEffect( ()=>{
        const interval = setInterval(()=> {
            setCurrentIndex((prevIdx) => (prevIdx +1) % carouselImage.length)
        }, 2000)
        return () => clearInterval(interval)
    },[])

    return (
        <div className="relative w-full overflow-hidden h-[300px] rounded-2xl">
          <div
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{ transform: `translateX(-${CurrentIndex * 100}%)` }}
          >
            {carouselImage.map((image, index) => (
              <div key={`${image.id}-${index}`} className="w-full flex-shrink-0 px-2">
                <div className="relative h-full rounded-xl overflow-hidden shadow-lg group">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.description}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-300/80 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">{image.name}</h3>
                    <p className="text-lg text-white/90">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
    
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImage.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  CurrentIndex === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )
}
export default Carousel

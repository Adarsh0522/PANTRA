"use client";

import { useState } from "react";
import { Play, X, PlayCircle } from "lucide-react";

const VIDEOS = [
  { id: 1, title: "New PAN Form (Form 93) in 2 Mins", videoId: "M7lc1UVf-VE", duration: "2:15" },
  { id: 2, title: "PAN Correction Form (CR-01) Guide", videoId: "M7lc1UVf-VE", duration: "3:40" },
  { id: 3, title: "How to use Universal ID Card Maker", videoId: "M7lc1UVf-VE", duration: "1:50" },
  { id: 4, title: "AI Background Remover Demo", videoId: "M7lc1UVf-VE", duration: "1:20" },
  { id: 5, title: "Create Passport Size Photos", videoId: "M7lc1UVf-VE", duration: "2:05" },
  { id: 6, title: "PAN Photo Crop (160x200) Tutorial", videoId: "M7lc1UVf-VE", duration: "1:15" },
  { id: 7, title: "Signature Crop Tutorial", videoId: "M7lc1UVf-VE", duration: "1:10" },
  { id: 8, title: "Compress Documents Under 100KB", videoId: "M7lc1UVf-VE", duration: "1:30" },
  { id: 9, title: "Convert PDF to Image", videoId: "M7lc1UVf-VE", duration: "1:05" },
];

export default function VideoTutorials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Close modal on escape key press
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
  }

  return (
    <section className="py-12 lg:py-16 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-5">
            See PANTRA in Action
          </h2>
          <p className="text-slate-600 text-base lg:text-lg font-medium max-w-2xl mx-auto">
            Step-by-step guides on how to generate official PAN forms and use our premium document tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              onClick={() => setActiveVideo(video.videoId)}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90 group-hover:opacity-100 transition-opacity" />
                {/* Abstract shape for thumbnail placeholder */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full -ml-12 -mb-12" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <Play className="w-6 h-6 text-white ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          />
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

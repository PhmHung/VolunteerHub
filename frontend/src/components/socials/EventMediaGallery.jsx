import React from "react";

export const EventMediaGallery = ({ posts = [] }) => {
  const imagePosts = posts.filter((p) => p.image);

  if (imagePosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chưa có hình ảnh nào
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {imagePosts.map((post) => (
        <div
          key={post._id}
          className="aspect-square bg-gray-100 overflow-hidden rounded-lg"
        >
          <img
            src={post.image}
            alt=""
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  );
};

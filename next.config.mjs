/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tab "Lưu trú" đổi tên thành "Nghỉ dưỡng", URL đổi theo. Redirect vĩnh viễn
  // để link cũ đã được index/chia sẻ không chết.
  async redirects() {
    return [
      { source: "/luu-tru", destination: "/nghi-duong", permanent: true },
      { source: "/luu-tru/:path*", destination: "/nghi-duong/:path*", permanent: true },
      { source: "/quan-tri/luu-tru", destination: "/quan-tri/nghi-duong", permanent: true },
      {
        source: "/quan-tri/luu-tru/:path*",
        destination: "/quan-tri/nghi-duong/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
